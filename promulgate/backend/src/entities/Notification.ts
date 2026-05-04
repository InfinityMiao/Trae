import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  employee_id: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  is_read: number;

  @CreateDateColumn()
  created_at: Date;
}
