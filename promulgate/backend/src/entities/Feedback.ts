import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { FeedbackCategory } from './FeedbackCategory';

export type FeedbackStatus = 'pending' | 'replied';

@Entity('feedbacks')
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  employee_id: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int', nullable: true })
  category_id: number | null;

  @ManyToOne(() => FeedbackCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: FeedbackCategory | null;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'replied'],
    default: 'pending',
    nullable: false,
  })
  status: FeedbackStatus;

  @CreateDateColumn()
  created_at: Date;
}
