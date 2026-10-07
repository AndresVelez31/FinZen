// External imports
import { CurrentUser } from '@nestjs/authentication';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

// Internal imports
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import type { Account } from './entities/account.entity.js';

// Exports
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAllByUserId(@CurrentUser('id') userId: number): Promise<Account[]> {
    return await this.accountsService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOneByIdAndUserId(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ): Promise<Account> {
    return await this.accountsService.findOneByIdAndUserId(Number(id), userId);
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
