// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { AccountsValidator } from './accounts.validate.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { Account } from './entities/account.entity.js';

// Exports
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    private readonly accountsValidator: AccountsValidator,
  ) {}

  async findAllByUserId(userId: number): Promise<Account[]> {
    return await this.accountsRepository.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  // Another user's account behaves exactly like a missing one.
  async findOneByIdAndUserId(id: number, userId: number): Promise<Account> {
    const account = await this.accountsRepository.findOneBy({ id, user: { id: userId } });
    if (!account) {
      throw new NotFoundException('La cuenta no existe o no está disponible.');
    }
    return account;
  }

  async create(createAccountDto: CreateAccountDto, userId: number): Promise<Account> {
    const fields = this.accountsValidator.validate(createAccountDto);
    const account = this.accountsRepository.create({
      name: fields.name,
      type: fields.type,
      balance: fields.balance,
      user: { id: userId },
    });
    const savedAccount = await this.accountsRepository.save(account);
    return await this.findOneByIdAndUserId(savedAccount.id, userId);
  }

  async update(id: number, updateAccountDto: UpdateAccountDto, userId: number): Promise<Account> {
    const account = await this.findOneByIdAndUserId(id, userId);
    const fields = this.accountsValidator.validate({
      name: updateAccountDto.name ?? account.name,
      type: updateAccountDto.type ?? account.type,
      balance: updateAccountDto.balance ?? account.balance,
    });

    Object.assign(account, fields);
    return await this.accountsRepository.save(account);
  }

  // The account's transactions are removed by the database (onDelete: 'CASCADE').
  async remove(id: number, userId: number): Promise<void> {
    const account = await this.findOneByIdAndUserId(id, userId);
    await this.accountsRepository.remove(account);
  }
}
