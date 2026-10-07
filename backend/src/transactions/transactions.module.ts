// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { AccountsModule } from '../accounts/accounts.module.js';
import { ActivitiesModule } from '../activities/activities.module.js';
import { Transaction } from './entities/transaction.entity.js';
import { TransactionsController } from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';
import { TransactionsValidator } from './transactions.validate.js';

// Exports
@Module({
  imports: [TypeOrmModule.forFeature([Transaction]), AccountsModule, ActivitiesModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsValidator],
})
export class TransactionsModule {}
