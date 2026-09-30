import { Repository } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';
export declare class TransactionsService {
    private readonly transactionsRepository;
    private readonly accountsService;
    private readonly activitiesService;
    constructor(transactionsRepository: Repository<Transaction>, accountsService: AccountsService, activitiesService: ActivitiesService);
    findAll(userId: number): Promise<Transaction[]>;
    findOne(id: number, userId: number): Promise<Transaction>;
    create(createTransactionDto: CreateTransactionDto, userId: number): Promise<Transaction>;
    update(id: number, updateTransactionDto: UpdateTransactionDto, userId: number): Promise<Transaction>;
    remove(id: number, userId: number): Promise<void>;
    private validate;
    private toEntityFields;
}
