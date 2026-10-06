// External imports
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';

// Internal imports
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { User } from '../../users/entities/user.entity.js';

// Exports
@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  type: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @RelationId((account: Account) => account.user)
  userId: number;

  @OneToMany(() => Transaction, (transaction) => transaction.account)
  transactions: Relation<Transaction[]>;
}
