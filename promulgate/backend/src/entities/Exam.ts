import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ExamSource = 'manual' | 'upload';
export type ExamStatus = 'published' | 'closed';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int', nullable: false })
  pass_score: number;

  @Column({ type: 'json', nullable: false })
  content: any;

  @Column({
    type: 'enum',
    enum: ['manual', 'upload'],
    default: 'manual',
    nullable: false,
  })
  source: ExamSource;

  @Column({
    type: 'enum',
    enum: ['published', 'closed'],
    default: 'closed',
    nullable: false,
  })
  status: ExamStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
