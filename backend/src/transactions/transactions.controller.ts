import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import type { Transaction } from './entities/transaction.entity.js';
import { TransactionsService } from './transactions.service.js';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: number): Promise<Transaction[]> {
    return await this.transactionsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<Transaction> {
    return await this.transactionsService.findOne(Number(id), userId);
  }

  @Post()
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentUser('id') userId: number,
  ): Promise<Transaction> {
    return await this.transactionsService.create(createTransactionDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentUser('id') userId: number,
  ): Promise<Transaction> {
    return await this.transactionsService.update(Number(id), updateTransactionDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<void> {
    await this.transactionsService.remove(Number(id), userId);
  }
}
