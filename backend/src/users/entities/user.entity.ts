// Imports
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Role } from '../enums/role.enum.js';

// Exports
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', default: Role.User })
  role: Role;

  @Column({ type: 'varchar', unique: true })
  email: string;

  // Never sent to the client: only the login query selects it explicitly.
  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Relation<Account[]>;

  @OneToMany(() => Activity, (activity) => activity.user)
  activities: Relation<Activity[]>;
}
