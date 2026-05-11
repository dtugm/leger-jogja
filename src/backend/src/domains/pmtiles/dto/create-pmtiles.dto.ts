import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum BucketName {
  DT_LEGGER = 'dt-legger',
  BASE_STORAGE = 'base-storage',
}

export class CreatePmtilesDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  @IsNotEmpty()
  epoch: number;

  @ApiPropertyOptional({ type: [String] })
  @IsString({ each: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return value.split(',');
    if (Array.isArray(value)) return value.map(String);
    return [];
  })
  project_usages?: string[];

  @ApiProperty({ enum: BucketName })
  @IsEnum(BucketName)
  @IsNotEmpty()
  bucket_name: BucketName;
}
