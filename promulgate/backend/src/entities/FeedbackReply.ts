import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee';

@Entity('feedback_replies')
export class FeedbackReply {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  feedback_id: number;

  @Column({ type: 'int', nullable: false })
  employee_id: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn()
  created_at: Date;
}
