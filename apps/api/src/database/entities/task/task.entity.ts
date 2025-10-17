import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TaskStatus } from '@libs/data';
import { User } from '../user/user.entity';
import { Organization } from '../organization/organization.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'org_id' })
  @Index()
  orgId!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar' })
  @Index()
  category!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @Index()
  status!: TaskStatus;

  @Column({ name: 'order_index', type: 'int', default: 0 })
  @Index()
  orderIndex!: number;

  @Column({ type: 'uuid', name: 'owner_user_id' })
  @Index()
  ownerUserId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_user_id' })
  owner!: User;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
