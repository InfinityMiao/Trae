import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type AnnouncementStatus = 'online' | 'offline';

@Entity('announcements')
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enum: ['online', 'offline'],
    default: 'offline',
    nullable: false,
  })
  status: AnnouncementStatus;

  @Column({ type: 'int', default: 0, nullable: false })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;
}
