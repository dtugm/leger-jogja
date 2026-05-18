import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePmtilesDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsOptional()
  epoch?: number;

  @ApiPropertyOptional()
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value.split(',');
    if (Array.isArray(value)) return value.map(String);
    return undefined;
  })
  project_usages?: string[];

  @ApiPropertyOptional({ type: String, example: 'dt-legger' })
  @IsString()
  @IsOptional()
  bucket_name?: string;

  @ApiPropertyOptional({ type: String, example: 'custom/pmtiles' })
  @IsString()
  @IsOptional()
  @Transform(({ value }): string | undefined => {
    if (typeof value !== 'string') return undefined;
    const prefix = value.trim();
    return prefix || undefined;
  })
  prefix?: string;
}
