// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { AccountsController } from './accounts.controller.js';
import { AccountsService } from './accounts.service.js';
import { AccountsValidator } from './accounts.validate.js';
import { Account } from './entities/account.entity.js';

// Exports
@Module({
  imports: [TypeOrmModule.forFeature([Account])],
  controllers: [AccountsController],
  providers: [AccountsService, AccountsValidator],
  exports: [AccountsService],
})
export class AccountsModule {}
