import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('feedback_attachments')
export class FeedbackAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  feedback_id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  file_url: string;

  @Column({ type: 'varchar', length: 200, nullable: false })
  file_name: string;

  @CreateDateColumn()
  created_at: Date;
}
