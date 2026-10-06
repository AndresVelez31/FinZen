// External imports
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';

// Internal imports
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { User } from './entities/user.entity.js';
import { Role } from './enums/role.enum.js';
import { UsersService } from './users.service.js';

// Exports
@Roles(Role.Admin)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser('id') currentUserId: number,
  ): Promise<User> {
    return await this.usersService.update(Number(id), updateUserDto, currentUserId);
  }
}
