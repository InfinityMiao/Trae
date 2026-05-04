import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Regulation } from './Regulation';

@Entity('regulation_versions')
export class RegulationVersion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  regulation_id: number;

  @ManyToOne(() => Regulation, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'regulation_id' })
  regulation: Regulation;

  @Column({ type: 'varchar', length: 200, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: false })
  pdf_url: string;

  @Column({ type: 'int', nullable: false })
  version: number;

  @CreateDateColumn()
  created_at: Date;
}
