// External imports
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { Account } from './entities/account.entity.js';

// Exports
@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
  ) {}

  async findAll(userId: number): Promise<Account[]> {
    return await this.accountsRepository.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  // Another user's account behaves exactly like a missing one.
  async findOne(id: number, userId: number): Promise<Account> {
    const account = await this.accountsRepository.findOneBy({ id, user: { id: userId } });
    if (!account) {
      throw new NotFoundException('La cuenta no existe o no está disponible.');
    }
    return account;
  }

  async create(createAccountDto: CreateAccountDto, userId: number): Promise<Account> {
    const fields = this.validate(createAccountDto);
    const account = this.accountsRepository.create({
      name: fields.name,
      type: fields.type,
      balance: fields.balance,
      user: { id: userId },
    });
    const savedAccount = await this.accountsRepository.save(account);
    return await this.findOne(savedAccount.id, userId);
  }

  async update(id: number, updateAccountDto: UpdateAccountDto, userId: number): Promise<Account> {
    const account = await this.findOne(id, userId);
    const fields = this.validate({
      name: updateAccountDto.name ?? account.name,
      type: updateAccountDto.type ?? account.type,
      balance: updateAccountDto.balance ?? account.balance,
    });

    Object.assign(account, fields);
    return await this.accountsRepository.save(account);
  }

  // The account's transactions are removed by the database (onDelete: 'CASCADE').
  async remove(id: number, userId: number): Promise<void> {
    const account = await this.findOne(id, userId);
    await this.accountsRepository.remove(account);
  }

  // Picks only the editable fields, so a request body can never change the owner.
  private validate(accountDto: CreateAccountDto): CreateAccountDto {
    const name = accountDto.name?.trim();
    if (!name) {
      throw new BadRequestException('El nombre de la cuenta es obligatorio.');
    }
    if (!accountDto.type) {
      throw new BadRequestException('El tipo de cuenta es obligatorio.');
    }
    if (!Number.isFinite(accountDto.balance) || accountDto.balance < 0) {
      throw new BadRequestException('El saldo inicial debe ser mayor o igual a 0.');
    }

    return { name, type: accountDto.type, balance: accountDto.balance };
  }
}
