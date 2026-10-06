// External imports
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Internal imports
import { User } from './entities/user.entity.js';
import { MeController } from './me.controller.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

// Exports
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, MeController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
