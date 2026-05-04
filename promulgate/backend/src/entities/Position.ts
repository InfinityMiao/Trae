import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Department } from './Department';
import { Employee } from './Employee';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  department_id: number;

  @ManyToOne(() => Department, (department) => department.positions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Employee, (employee) => employee.position)
  employees: Employee[];
}
