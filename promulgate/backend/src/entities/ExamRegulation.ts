import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('exam_regulations')
export class ExamRegulation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  exam_id: number;

  @Column({ type: 'int', nullable: false })
  regulation_id: number;
}
