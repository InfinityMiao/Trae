import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('regulation_categories')
export class RegulationCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Column({ type: 'int', nullable: true })
  parent_id: number | null;

  @ManyToOne(() => RegulationCategory, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: RegulationCategory | null;

  @OneToMany(() => RegulationCategory, (category) => category.parent)
  children: RegulationCategory[];

  @Column({ type: 'tinyint', default: 0, nullable: false })
  is_system: number;

  @Column({ type: 'int', default: 0, nullable: false })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}
