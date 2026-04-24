import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Tiles3DProperty } from '../entities/tiles3d.entity'
import { IsOptional, IsString, ValidateNested } from "class-validator";
import { Transform, Type } from "class-transformer";

export class UpsertTiles3dDto {
    @ApiProperty({ description: 'The name of the 3dtiles data' })
    @IsString()
    name: string;

    @ApiPropertyOptional({
        description: 'Properties related to the 3dtiles data',
        type: Tiles3DProperty
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (!value) return undefined;

        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Object.assign(new Tiles3DProperty(), parsed)
    })
    @Type(() => Tiles3DProperty)
    @ValidateNested()
    properties?: Tiles3DProperty;

    @ApiHideProperty()
    @IsOptional()
    url?: string;

    @ApiProperty({ type: 'string', format: 'binary' })
    @IsOptional()
    file?: any;
}