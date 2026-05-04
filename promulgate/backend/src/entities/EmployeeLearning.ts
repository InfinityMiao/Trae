import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { Regulation } from './Regulation';

@Entity('employee_learning')
export class EmployeeLearning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  employee_id: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'int', nullable: false })
  regulation_id: number;

  @ManyToOne(() => Regulation, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'regulation_id' })
  regulation: Regulation;

  @Column({ type: 'tinyint', default: 0, nullable: false })
  is_completed: number;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
