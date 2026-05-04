import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Position } from './Position';
import { Employee } from './Employee';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Position, (position) => position.department)
  positions: Position[];

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];
}
