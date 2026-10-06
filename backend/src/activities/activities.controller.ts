// External imports
import { CurrentUser } from '@nestjs/authentication';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

// Internal imports
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from '../users/enums/role.enum.js';
import { ActivitiesService } from './activities.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import type { Activity } from './entities/activity.entity.js';

// Exports
// Every user reads their own activities (the transaction form needs them),
// but only admins manage them, mirroring the admin-only /activities routes.
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAllByUserId(@CurrentUser('id') userId: number): Promise<Activity[]> {
    return await this.activitiesService.findAllByUserId(userId);
  }

  @Get(':id')
  async findOneByIdAndUserId(
    @Param('id') id: string,
    @CurrentUser('id') userId: number,
  ): Promise<Activity> {
    return await this.activitiesService.findOneByIdAndUserId(Number(id), userId);
  }

  @Roles(Role.Admin)
  @Post()
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('id') userId: number,
  ): Promise<Activity> {
    return await this.activitiesService.create(createActivityDto, userId);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('id') userId: number,
  ): Promise<Activity> {
    return await this.activitiesService.update(Number(id), updateActivityDto, userId);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<void> {
    await this.activitiesService.remove(Number(id), userId);
  }
}
