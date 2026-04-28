import { User } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Asset } from "./asset.entity";

@Entity('source_files', { schema: 'public' })
export class SourceFile {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string;

    @ManyToOne(
        () => User,
        (user) => user.sourceFiles,
        {
            onDelete: 'SET NULL'
        }
    )
    @JoinColumn({ name: 'uploaded_by' })
    @Index()
    uploadedBy: User;

    @ManyToOne(
        () => Asset,
        (asset) => asset.sourceFiles,
        {
            onDelete: 'CASCADE'
        }
    )
    @JoinColumn({ name: 'asset_id' })
    asset: Asset;

    @Column({ type: 'varchar' })
    filename: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}