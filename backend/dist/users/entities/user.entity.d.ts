import type { Relation } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
import { Role } from '../enums/role.enum.js';
export declare class User {
    id: number;
    name: string;
    role: Role;
    email: string;
    password: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    accounts: Relation<Account[]>;
    activities: Relation<Activity[]>;
}
