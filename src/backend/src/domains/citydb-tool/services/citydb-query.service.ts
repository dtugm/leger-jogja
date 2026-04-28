import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CitydbQueryService {
  constructor(private readonly dataSource: DataSource) { }

  async getAssetCenterPoint(assetId: string): Promise<{ location: string | null } | null> {
    const query = `
      SELECT 
        ST_AsGeoJSON( 
          ST_Centroid(ST_Collect(f.envelope))
        ) AS location
      FROM feature f
      JOIN property p ON f.id = p.feature_id
      WHERE 
        p.name = $1
        AND p.val_string = $2
      GROUP BY p.val_string 
      `

    try {
      const result = await this.dataSource.query(query, ['asset_id', assetId]);

      // Return the first aggregated row, or null if not found
      return result.length > 0 ? result[0] : null;
    } catch (err) {
      throw err;
    }
  }

  async findFeatureByFileId(assetId: string, fileId: string): Promise<{ id: string | null } | null> {
    const query = `
      SELECT f.id
      FROM feature f
      JOIN property p ON f.id = p.feature_id
      WHERE
        p.name = $1
        AND p.val_string = $2
        AND p.name = $3
        AND p.val_string = $4
        `

    try {
      const result = await this.dataSource.query(
        query,
        [
          'asset_id', assetId,
          'source_file_id', fileId
        ]);

      // Return the first aggregated row, or null if not found
      return result.length > 0 ? result[0] : null;
    } catch (err) {
      throw err;
    }
  }
}