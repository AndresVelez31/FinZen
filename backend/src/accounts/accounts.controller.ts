// Imports
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import type { Account } from './entities/account.entity.js';

// Exports
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: number): Promise<Account[]> {
    return await this.accountsService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<Account> {
    return await this.accountsService.findOne(Number(id), userId);
  }

  @Post()
  async create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentUser('id') userId: number,
  ): Promise<Account> {
    return await this.accountsService.create(createAccountDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser('id') userId: number,
  ): Promise<Account> {
    return await this.accountsService.update(Number(id), updateAccountDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<void> {
    await this.accountsService.remove(Number(id), userId);
  }
}
