import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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

  @ApiProperty({ type: String, example: 'dt-legger' })
  @IsString()
  @IsNotEmpty()
  bucket_name: string;

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
