// Imports
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';

// Exports
@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  // `date` is when the transaction happened, so it replaces createdAt
  // (see docs/decisions/DOMAIN-103).
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.transactions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'accountId' })
  account: Relation<Account>;

  @RelationId((transaction: Transaction) => transaction.account)
  accountId: number;

  @ManyToOne(() => Activity, (activity) => activity.transactions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'activityId' })
  activity: Relation<Activity>;

  @RelationId((transaction: Transaction) => transaction.activity)
  activityId: number;
}
