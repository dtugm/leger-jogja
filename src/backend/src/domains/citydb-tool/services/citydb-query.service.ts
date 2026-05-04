import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CountFeaturesResult } from '../interfaces/citydb-query.interface';

@Injectable()
export class CitydbQueryService {
  private readonly logger = new Logger(CitydbQueryService.name);

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
      JOIN property p1 ON f.id = p1.feature_id AND p1.name = 'asset_id' AND p1.val_string = $1
      JOIN property p2 ON f.id = p2.feature_id AND p2.name = 'source_file_id' AND p2.val_string = $2
        `

    try {
      const result = await this.dataSource.query(query, [assetId, fileId]);

      // Return the first aggregated row, or null if not found
      return result.length > 0 ? result[0] : null;
    } catch (err) {
      throw err;
    }
  }

  async countFeaturesByAssetId(assetId: string): Promise<CountFeaturesResult[]> {
    const query = `
      SELECT 
        p_file.val_string AS id,
        oc.classname AS feature_type,
        COUNT(*) AS total
      FROM feature f
      JOIN objectclass oc ON f.objectclass_id = oc.id
      JOIN property p_asset ON f.id = p_asset.feature_id
        AND p_asset.name = 'asset_id'
        AND p_asset.val_string = $1
      JOIN property p_file ON f.id = p_file.feature_id
        AND p_file.name = 'source_file_id'
      WHERE
        f.termination_date IS NULL
      GROUP BY oc.classname, p_file.val_string
    `

    try {
      const rawResult = await this.dataSource.query(query, [assetId]);
      const result = Object.values(rawResult) as CountFeaturesResult[];
      return result;
    } catch (error) {
      throw error;
    }
  }
}