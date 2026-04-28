import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../../users/entities/user.entity';

@Entity('menus', { schema: 'public' })
export class Menu {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string | null;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  icon: string | null;

  @Column({ type: 'varchar' })
  href: string;

  @Column({ type: 'int' })
  index: number;

  @Column({ type: 'varchar', array: true })
  roles: UserRole[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp without time zone' })
  updatedAt: Date;
}
