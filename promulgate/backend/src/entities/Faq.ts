import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('faqs')
export class Faq {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  question: string;

  @Column({ type: 'text', nullable: false })
  answer: string;

  @Column({ type: 'int', default: 0, nullable: false })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}
