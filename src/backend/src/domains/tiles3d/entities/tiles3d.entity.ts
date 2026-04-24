import { IsOptional, IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type { Polygon } from "typeorm";

export class Tiles3DProperty {
    @IsOptional()
    @IsString()
    description?: string;
}

@Entity('tiles_3d')
export class Tiles3D {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'jsonb', nullable: true })
    properties?: Tiles3DProperty;

    @Column({ type: 'varchar' })
    url: string;

    @Index({ spatial: true })
    @Column({ type: 'geography', spatialFeatureType: 'Polygon', srid: 4326, nullable: true })
    geometry?: Polygon;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}