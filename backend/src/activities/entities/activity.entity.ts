import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  color: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  targetAmount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @RelationId((activity: Activity) => activity.user)
  userId: number;
}
