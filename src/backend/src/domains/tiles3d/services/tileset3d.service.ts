import { Injectable } from "@nestjs/common";
import { StorageService } from "src/domains/storage/services/storage.service";


type BoxOutput = {
  polygonGeoJSON: { type: 'Polygon'; coordinates: number[][][] };
  polygonWKT: string;
  centroid: { lon: number; lat: number; height: number };
  minHeight: number;
  maxHeight: number;
};

@Injectable()
export class Tileset3dService {
  constructor(private readonly storageService: StorageService) { }

  /** Multiply 4x4 column-major matrix by 4-vector [x,y,z,1] */
  private mulMat4Vec3_colMajor(mat: number[], x: number, y: number, z: number) {
    // mat is column-major: element at row r, col c is mat[c*4 + r]
    const vx = x, vy = y, vz = z, vw = 1;
    const out = [0, 0, 0, 0];
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let c = 0; c < 4; c++) {
        const m = mat[c * 4 + r];
        const v = c === 0 ? vx : c === 1 ? vy : c === 2 ? vz : vw;
        s += m * v;
      }
      out[r] = s;
    }
    return { x: out[0], y: out[1], z: out[2] };
  }

  /** ECEF -> geodetic (lon, lat in degrees, height in meters) (WGS84) */
  private ecefToGeodetic(x: number, y: number, z: number) {
    const a = 6378137.0;
    const f = 1 / 298.257223563;
    const e2 = f * (2 - f);
    const p = Math.sqrt(x * x + y * y);
    const lon = Math.atan2(y, x);
    // initial lat guess
    let lat = Math.atan2(z, p * (1 - e2));
    let N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
    let h = p / Math.cos(lat) - N;
    for (let i = 0; i < 100; i++) {
      N = a / Math.sqrt(1 - e2 * Math.sin(lat) * Math.sin(lat));
      h = p / Math.cos(lat) - N;
      const latNew = Math.atan2(z, p * (1 - e2 * N / (N + h)));
      if (Math.abs(latNew - lat) < 1e-12) {
        lat = latNew;
        break;
      }
      lat = latNew;
    }
    return { lon: (lon * 180) / Math.PI, lat: (lat * 180) / Math.PI, height: h };
  }

  /**
   * Convert 3d-tiles box+transform -> polygon lon/lat + min/max heights
   * box: array[12], transform: array[16] (column-major)
   */
  private boxToWgs84Polygon(box: number[], transform: number[]): BoxOutput {
    if (!Array.isArray(box) || box.length !== 12) throw new Error('box must be length 12');
    if (!Array.isArray(transform) || transform.length !== 16) throw new Error('transform must be length 16');

    const [cx, cy, cz,
      hx, hy, hz,
      ux, uy, uz,
      vx, vy, vz] = box;

    // generate corners in local coords: center ± h ± u
    const cornersLocal = [
      { x: cx - hx - ux, y: cy - hy - uy, z: cz - hz - uz }, // (-,-)
      { x: cx + hx - ux, y: cy + hy - uy, z: cz + hz - uz }, // (+,-)
      { x: cx + hx + ux, y: cy + hy + uy, z: cz + hz + uz }, // (+,+)
      { x: cx - hx + ux, y: cy - hy + uy, z: cz - hz + uz }, // (-,+)
    ];

    // transform each to world (ECEF) coords
    const cornersEcef = cornersLocal.map(c => this.mulMat4Vec3_colMajor(transform, c.x, c.y, c.z));
    const centerEcef = this.mulMat4Vec3_colMajor(transform, cx, cy, cz);

    // convert to lon/lat/height
    const cornersLLH = cornersEcef.map(c => this.ecefToGeodetic(c.x, c.y, c.z));
    const centerLLH = this.ecefToGeodetic(centerEcef.x, centerEcef.y, centerEcef.z);

    // build polygon coordinates array [ [lon,lat], ... ]
    const polygonCoords = cornersLLH.map(c => [c.lon, c.lat]);
    // close ring
    polygonCoords.push([cornersLLH[0].lon, cornersLLH[0].lat]);

    // wkt
    const polygonWKT = 'POLYGON((' + polygonCoords.map(p => `${p[0]} ${p[1]}`).join(', ') + '))';

    // compute min/max heights from corner heights and center
    const heights = cornersLLH.map(c => c.height).concat(centerLLH.height);
    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);

    return {
      polygonGeoJSON: { type: 'Polygon', coordinates: [polygonCoords] },
      polygonWKT,
      centroid: { lon: centerLLH.lon, lat: centerLLH.lat, height: centerLLH.height },
      minHeight,
      maxHeight,
    };
  }

  async loadTilesetFromS3(fileUrl: string): Promise<{ polygon: string, minH: any, maxH: any }> {
    // Opsi jika nama "bucket"-nya fleksibel (misal: apapun.dt-legger.geo-ai.id)
    const regex = /^https:\/\/([a-z0-9-]+\.s3\.[a-z0-9-]+\.amazonaws\.com|[a-z0-9-]+\.[a-z0-9-]+\.geo-ai\.id)\//i;

    if (!regex.test(fileUrl)) {
      throw new Error('Wrong url');
    }

    const parsedUrl = new URL(fileUrl);
    // pathname starts with `/` → remove leading slash
    let key = parsedUrl.pathname;
    if (key.startsWith('/')) key = key.slice(1);
    // Decode URL-encoded characters (like %20 → space)
    key = decodeURIComponent(key);

    const byteArray = await this.storageService.getFile(key)
    const jsonString = Buffer.from(byteArray).toString('utf-8');
    const tileset = JSON.parse(jsonString);

    let polygon: string, minH, maxH;
    if (tileset?.root?.boundingVolume?.box) {
      const box = tileset?.root?.boundingVolume?.box
      if (!Array.isArray(box) || box.length !== 12) {
        throw new Error('Box must be an array of 12 numbers');
      }

      const transform = tileset?.root?.transform
      const res = this.boxToWgs84Polygon(box, transform)
      polygon = res.polygonWKT
      minH = res.minHeight;
      maxH = res.maxHeight;
    } else if (tileset?.root?.boundingVolume?.region) {
      const region = tileset?.root?.boundingVolume?.region
      if (!region) throw new Error('Region should be exist');

      const [west, south, east, north, minHeight, maxHeight] = region;

      // Convert radians -> degrees
      const westDeg = (west * 180) / Math.PI;
      const southDeg = (south * 180) / Math.PI;
      const eastDeg = (east * 180) / Math.PI;
      const northDeg = (north * 180) / Math.PI;

      // Build POLYGON WKT (lon/lat in degrees)
      polygon = `POLYGON((
        ${westDeg} ${southDeg},
        ${eastDeg} ${southDeg},
        ${eastDeg} ${northDeg},
        ${westDeg} ${northDeg},
        ${westDeg} ${southDeg}
      ))`.replace(/\s+/g, ' ').trim();
      minH = minHeight;
      maxH = maxHeight;
    } else {
      throw new Error('Wrong tileset');
    }

    return {
      polygon, minH, maxH
    }
  }
}
