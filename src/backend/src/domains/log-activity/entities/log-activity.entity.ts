import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('log_activities', { schema: 'public' })
export class LogActivity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Index()
  @Column({ name: 'user_id', type: 'varchar', length: 36, nullable: true })
  userId: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  resource: string;

  @Column({ name: 'resource_id', type: 'varchar', length: 255, nullable: true })
  resourceId: string;

  @Column({ type: 'varchar', length: 10 })
  method: string;

  @Column({ type: 'varchar', length: 500 })
  endpoint: string;

  @Column({ name: 'status_code', type: 'int', nullable: true })
  statusCode: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ name: 'response_time', type: 'int', nullable: true })
  responseTime: number;

  @Index()  
  @CreateDateColumn({ name: 'created_at', type: 'timestamp without time zone' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
