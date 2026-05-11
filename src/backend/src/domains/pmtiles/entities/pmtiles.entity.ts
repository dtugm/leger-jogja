import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('pmtiles', { schema: 'public' })
export class Pmtiles {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'integer' })
  epoch: number;

  @Column({ type: 'simple-array' })
  project_usages: string[];

  @Column({ type: 'varchar' })
  filename: string;

  @Column({ type: 'varchar', nullable: true })
  url: string;

  @Column({ type: 'integer', nullable: true })
  file_size: number;

  @Exclude()
  @Column({ type: 'varchar' })
  bucket_name: string;

  @Column({ type: 'varchar' })
  updated_by: string;

  @ManyToOne(() => User, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  updater: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
