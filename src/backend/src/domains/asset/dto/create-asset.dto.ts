import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class CreateAssetDto {
    @ApiProperty({
        description: 'The name of the asset',
        example: 'Jembatan Suramadu'
    })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'A brief description of the asset'
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({
        description: 'The location of the asset in GeoJSON format',
        example: '{ "type":"Point", "coordinates":[115.175989,-5.147621]}'
    })
    @IsString()
    @IsOptional()
    location?: string;
}