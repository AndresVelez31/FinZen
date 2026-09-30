import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import type { Account } from './entities/account.entity.js';
export declare class AccountsController {
    private readonly accountsService;
    constructor(accountsService: AccountsService);
    findAll(userId: number): Promise<Account[]>;
    findOne(id: string, userId: number): Promise<Account>;
    create(createAccountDto: CreateAccountDto, userId: number): Promise<Account>;
    update(id: string, updateAccountDto: UpdateAccountDto, userId: number): Promise<Account>;
    remove(id: string, userId: number): Promise<void>;
}
