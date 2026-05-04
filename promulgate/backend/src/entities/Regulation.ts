import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RegulationCategory } from './RegulationCategory';

export type RegulationStatus = 'online' | 'offline';

@Entity('regulations')
export class Regulation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ type: 'int', nullable: true })
  category_id: number | null;

  @ManyToOne(() => RegulationCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: RegulationCategory | null;

  @Column({ type: 'varchar', length: 500, nullable: false })
  pdf_url: string;

  @Column({
    type: 'enum',
    enum: ['online', 'offline'],
    default: 'offline',
    nullable: false,
  })
  status: RegulationStatus;

  @Column({ type: 'int', default: 1, nullable: false })
  version: number;

  @Column({ type: 'tinyint', default: 1, nullable: false })
  is_latest: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
