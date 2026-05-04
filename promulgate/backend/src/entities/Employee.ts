import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Department } from './Department';
import { Position } from './Position';

export type EmployeeType = 'admin' | 'employee';
export type EmployeeStatus = 'active' | 'disabled';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  employee_no: string;

  @Column({ type: 'varchar', length: 6, nullable: false })
  id_card_last6: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'employee'],
    default: 'employee',
    nullable: false,
  })
  employee_type: EmployeeType;

  @Column({ type: 'int', nullable: true })
  department_id: number | null;

  @ManyToOne(() => Department, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'int', nullable: true })
  position_id: number | null;

  @ManyToOne(() => Position, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'position_id' })
  position: Position | null;

  @Column({
    type: 'enum',
    enum: ['active', 'disabled'],
    default: 'active',
    nullable: false,
  })
  status: EmployeeStatus;

  @Column({ type: 'tinyint', default: 1, nullable: false })
  first_login: number;

  @Column({ type: 'int', default: 0, nullable: false })
  login_fail_count: number;

  @Column({ type: 'datetime', nullable: true })
  lock_until: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
