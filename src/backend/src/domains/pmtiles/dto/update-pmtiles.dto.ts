import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { BucketName } from './create-pmtiles.dto';

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

  @ApiPropertyOptional({ enum: BucketName })
  @IsEnum(BucketName)
  @IsOptional()
  bucket_name?: BucketName;
}
