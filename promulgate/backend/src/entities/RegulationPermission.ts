import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

export type PermissionTargetType = 'department' | 'position';

@Entity('regulation_permissions')
export class RegulationPermission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  regulation_id: number;

  @Column({
    type: 'enum',
    enum: ['department', 'position'],
    nullable: false,
  })
  target_type: PermissionTargetType;

  @Column({ type: 'int', nullable: false })
  target_id: number;
}
