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
// Every user reads the shared activity catalog (the transaction form needs it),
// but only admins manage it, mirroring the admin-only /activities routes.
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async findAll(): Promise<Activity[]> {
    return await this.activitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Activity> {
    return await this.activitiesService.findOne(Number(id));
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
  ): Promise<Activity> {
    return await this.activitiesService.update(Number(id), updateActivityDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.activitiesService.remove(Number(id));
  }
}
