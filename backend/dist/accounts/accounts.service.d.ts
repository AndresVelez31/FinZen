import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { Account } from './entities/account.entity.js';
export declare class AccountsService {
    private readonly accountsRepository;
    constructor(accountsRepository: Repository<Account>);
    findAll(userId: number): Promise<Account[]>;
    findOne(id: number, userId: number): Promise<Account>;
    create(createAccountDto: CreateAccountDto, userId: number): Promise<Account>;
    update(id: number, updateAccountDto: UpdateAccountDto, userId: number): Promise<Account>;
    remove(id: number, userId: number): Promise<void>;
    private validate;
}
