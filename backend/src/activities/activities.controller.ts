// External imports
import { CurrentUser } from '@nestjs/authentication';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

// Internal imports
import { ActivitiesService } from './activities.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import type { Activity } from './entities/activity.entity.js';

// Exports
// Every user manages their own activities. A new user starts with a copy of the
// administrators' activities (the template), see ActivitiesService.copyTemplateToUser().
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

  @Post()
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @CurrentUser('id') userId: number,
  ): Promise<Activity> {
    return await this.activitiesService.create(createActivityDto, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @CurrentUser('id') userId: number,
  ): Promise<Activity> {
    return await this.activitiesService.update(Number(id), updateActivityDto, userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: number): Promise<void> {
    await this.activitiesService.remove(Number(id), userId);
  }
}
