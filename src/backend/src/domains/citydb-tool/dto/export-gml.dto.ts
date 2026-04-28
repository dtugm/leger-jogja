import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ExportQueryDto {
  @ApiPropertyOptional({
    description: 'Object ID of the feature'
  })
  @IsOptional()
  @IsString()
  objectid?: string;

  @ApiPropertyOptional({
    description: 'SRID for the exported geometries (e.g., "4326" for WGS 84)'
  })
  @IsOptional()
  @IsString()
  srid?: string;

  @ApiPropertyOptional({
    description: 'Name of the exported file'
  })
  @IsOptional()
  @IsString()
  filename?: string;

  @ApiPropertyOptional({
    description: 'The ID of the asset'
  })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({
    description: 'The ID of the source file'
  })
  @IsOptional()
  @IsString()
  sourceFileId?: string;
}
