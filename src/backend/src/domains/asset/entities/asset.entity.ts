import { SourceFile } from "./source-file.entity";
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('assets', { schema: 'public' })
export class Asset {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326, nullable: true })
    location: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @OneToMany(() => SourceFile, (sourceFile) => sourceFile.asset)
    sourceFiles: SourceFile[];
}