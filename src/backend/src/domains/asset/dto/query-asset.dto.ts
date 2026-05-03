import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class QueryAssetDto {
    @ApiPropertyOptional({
        description: 'The page number for pagination'
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page: number = 1;

    @ApiPropertyOptional({
        description: 'The number of items per page for pagination'
    })
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit: number = 10;
    
    @ApiPropertyOptional({
        description: 'The name of the asset to search for',
        example: 'Jembatan Suramadu'
    })
    @IsOptional()
    @IsString()
    name?: string;
}