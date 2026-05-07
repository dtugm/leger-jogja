import { SourceFile } from '../../asset/entities/source-file.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { LogActivity } from 'src/domains/log-activity/entities/log-activity.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

@Entity('users', { schema: 'public' })
export class User {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ name: 'fullname', type: 'varchar' })
  fullname: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'role_enum',
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ type: 'varchar', select: false })
  @Exclude()
  password: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp without time zone',
    nullable: true,
  })
  deletedAt?: Date;

  @OneToMany(() => SourceFile, (sourceFile) => sourceFile.uploadedBy)
  sourceFiles: SourceFile[];

  @OneToMany(() => LogActivity, (log) => log.user)
  logActivities: LogActivity[];
}
