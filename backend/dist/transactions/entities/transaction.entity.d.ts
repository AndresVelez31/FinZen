import type { Relation } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
export declare class Transaction {
    id: number;
    type: string;
    amount: number;
    date: string;
    description: string;
    updatedAt: Date;
    account: Relation<Account>;
    accountId: number;
    activity: Relation<Activity>;
    activityId: number;
}
