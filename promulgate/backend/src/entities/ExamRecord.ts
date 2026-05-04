import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('exam_records')
export class ExamRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  employee_id: number;

  @Column({ type: 'int', nullable: false })
  exam_id: number;

  @Column({ type: 'int', nullable: false })
  score: number;

  @Column({ type: 'tinyint', nullable: false })
  is_passed: number;

  @Column({ type: 'json', nullable: false })
  answers: any;

  @CreateDateColumn()
  submitted_at: Date;
}
