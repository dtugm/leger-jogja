/* ------------------------------------------------------------------ */
/*  3D Tiles Types                                                       */
/* ------------------------------------------------------------------ */

export type AssetType = "Bangunan" | "Jalan" | "Lahan" | "Fasilitas" | "Lainnya";

/**
 * GeoJSON Polygon geometry — used to derive a centroid for fly-to.
 */
export interface TileGeometry {
  type: "Polygon";
  /** Array of rings; first ring is the exterior. Each point: [lng, lat]. */
  coordinates: number[][][];
}

/**
 * Represents a single 3D tile asset from the backend.
 */
export interface Tile3D {
  id: string;
  name: string;
  /** URL to the Cesium 3D Tiles tileset.json */
  url: string;
  assetId?: number;
  assetType?: AssetType | string | null;
  region?: string | null;
  description?: string | null;
  isPublic?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  geometry?: TileGeometry | null;
}
