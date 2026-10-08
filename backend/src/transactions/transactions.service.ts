// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DeepPartial } from 'typeorm';

// Internal imports
import { AccountsService } from '../accounts/accounts.service.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';
import { TransactionsValidator } from './transactions.validate.js';

// Exports
// A transaction has no userId: it belongs to whoever owns its account.
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
    private readonly activitiesService: ActivitiesService,
    private readonly transactionsValidator: TransactionsValidator,
  ) {}

  async findAllByUserId(userId: number): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { account: { user: { id: userId } } },
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOneByIdAndUserId(id: number, userId: number): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({
      id,
      account: { user: { id: userId } },
    });
    if (!transaction) {
      throw new NotFoundException('La transacción no existe o no está disponible.');
    }
    return transaction;
  }

  async create(createTransactionDto: CreateTransactionDto, userId: number): Promise<Transaction> {
    const fields = this.transactionsValidator.validate(createTransactionDto);
    await this.checkOwnership(fields, userId);
    const savedTransaction = await this.transactionsRepository.save(this.toEntityFields(fields));
    return await this.findOneByIdAndUserId(savedTransaction.id, userId);
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    const transaction = await this.findOneByIdAndUserId(id, userId);
    const fields = this.transactionsValidator.validate({
      type: updateTransactionDto.type ?? transaction.type,
      amount: updateTransactionDto.amount ?? transaction.amount,
      date: updateTransactionDto.date ?? transaction.date,
      description: updateTransactionDto.description ?? transaction.description,
      accountId: updateTransactionDto.accountId ?? transaction.accountId,
      activityId: updateTransactionDto.activityId ?? transaction.activityId,
    });
    await this.checkOwnership(fields, userId);

    await this.transactionsRepository.save(this.toEntityFields(fields, transaction.id));
    return await this.findOneByIdAndUserId(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.findOneByIdAndUserId(id, userId);
    await this.transactionsRepository.remove(transaction);
  }

  // Both lookups throw NotFoundException: the account must belong to the current user, and the
  // activity must exist in the shared catalog.
  private async checkOwnership(fields: CreateTransactionDto, userId: number): Promise<void> {
    await this.accountsService.findOneByIdAndUserId(fields.accountId, userId);
    await this.activitiesService.findOne(fields.activityId);
  }

  // accountId/activityId are read-only @RelationId properties, so the
  // foreign keys are written through the relations instead.
  private toEntityFields(fields: CreateTransactionDto, id?: number): DeepPartial<Transaction> {
    return {
      id,
      type: fields.type,
      amount: fields.amount,
      date: fields.date,
      description: fields.description,
      account: { id: fields.accountId },
      activity: { id: fields.activityId },
    };
  }
}
