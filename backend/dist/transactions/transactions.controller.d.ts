import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import type { Transaction } from './entities/transaction.entity.js';
import { TransactionsService } from './transactions.service.js';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    findAll(userId: number): Promise<Transaction[]>;
    findOne(id: string, userId: number): Promise<Transaction>;
    create(createTransactionDto: CreateTransactionDto, userId: number): Promise<Transaction>;
    update(id: string, updateTransactionDto: UpdateTransactionDto, userId: number): Promise<Transaction>;
    remove(id: string, userId: number): Promise<void>;
}
