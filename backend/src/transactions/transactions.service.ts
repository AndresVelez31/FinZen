import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { DeepPartial } from 'typeorm';
import { AccountsService } from '../accounts/accounts.service.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';

const TRANSACTION_TYPES = ['income', 'expense'];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// A transaction has no userId: it belongs to whoever owns its account.
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    private readonly accountsService: AccountsService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async findAll(userId: number): Promise<Transaction[]> {
    return await this.transactionsRepository.find({
      where: { account: { user: { id: userId } } },
      order: { date: 'DESC', id: 'DESC' },
    });
  }

  async findOne(id: number, userId: number): Promise<Transaction> {
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
    const fields = await this.validate(createTransactionDto, userId);
    const savedTransaction = await this.transactionsRepository.save(this.toEntityFields(fields));
    return await this.findOne(savedTransaction.id, userId);
  }

  async update(
    id: number,
    updateTransactionDto: UpdateTransactionDto,
    userId: number,
  ): Promise<Transaction> {
    const transaction = await this.findOne(id, userId);
    const fields = await this.validate(
      {
        type: updateTransactionDto.type ?? transaction.type,
        amount: updateTransactionDto.amount ?? transaction.amount,
        date: updateTransactionDto.date ?? transaction.date,
        description: updateTransactionDto.description ?? transaction.description,
        accountId: updateTransactionDto.accountId ?? transaction.accountId,
        activityId: updateTransactionDto.activityId ?? transaction.activityId,
      },
      userId,
    );

    await this.transactionsRepository.save(this.toEntityFields(fields, transaction.id));
    return await this.findOne(id, userId);
  }

  async remove(id: number, userId: number): Promise<void> {
    const transaction = await this.findOne(id, userId);
    await this.transactionsRepository.remove(transaction);
  }

  private async validate(
    transactionDto: CreateTransactionDto,
    userId: number,
  ): Promise<CreateTransactionDto> {
    if (!TRANSACTION_TYPES.includes(transactionDto.type)) {
      throw new BadRequestException('El tipo de transacción no es válido.');
    }
    if (!Number.isFinite(transactionDto.amount) || transactionDto.amount <= 0) {
      throw new BadRequestException('El monto de la transacción debe ser mayor que 0.');
    }
    if (!ISO_DATE_PATTERN.test(transactionDto.date ?? '')) {
      throw new BadRequestException('La fecha de la transacción no es válida.');
    }

    const description = transactionDto.description?.trim();
    if (!description) {
      throw new BadRequestException('La descripción es obligatoria.');
    }

    // Both lookups throw NotFoundException when the account or activity
    // does not belong to the current user.
    await this.accountsService.findOne(transactionDto.accountId, userId);
    await this.activitiesService.findOne(transactionDto.activityId, userId);

    return {
      type: transactionDto.type,
      amount: transactionDto.amount,
      date: transactionDto.date,
      description,
      accountId: transactionDto.accountId,
      activityId: transactionDto.activityId,
    };
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
