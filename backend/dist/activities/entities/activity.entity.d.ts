import type { Relation } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { User } from '../../users/entities/user.entity.js';
export declare class Activity {
    id: number;
    name: string;
    color: string;
    type: string;
    targetAmount: number;
    createdAt: Date;
    updatedAt: Date;
    user: Relation<User>;
    userId: number;
    transactions: Relation<Transaction[]>;
}
