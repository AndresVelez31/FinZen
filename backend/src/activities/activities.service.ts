// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { ActivitiesValidator } from './activities.validate.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import { Activity } from './entities/activity.entity.js';

// Exports
@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
    private readonly activitiesValidator: ActivitiesValidator,
  ) {}

  // Activities are one catalog managed by the administrators and shared by every user, so
  // unlike accounts and transactions they are not filtered by userId.
  async findAll(): Promise<Activity[]> {
    return await this.activitiesRepository.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activitiesRepository.findOneBy({ id });
    if (!activity) {
      throw new NotFoundException('La actividad no existe o no está disponible.');
    }
    return activity;
  }

  // userId is the administrator who creates the activity.
  async create(createActivityDto: CreateActivityDto, userId: number): Promise<Activity> {
    const fields = this.activitiesValidator.validate(createActivityDto);
    const activity = this.activitiesRepository.create({
      name: fields.name,
      color: fields.color,
      type: fields.type,
      targetAmount: fields.targetAmount,
      user: { id: userId },
    });
    const savedActivity = await this.activitiesRepository.save(activity);
    return await this.findOne(savedActivity.id);
  }

  async update(id: number, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    const fields = this.activitiesValidator.validate({
      name: updateActivityDto.name ?? activity.name,
      color: updateActivityDto.color ?? activity.color,
      type: updateActivityDto.type ?? activity.type,
      targetAmount: updateActivityDto.targetAmount ?? activity.targetAmount,
    });

    Object.assign(activity, fields);
    return await this.activitiesRepository.save(activity);
  }

  // The activity's transactions are removed by the database (onDelete: 'CASCADE').
  async remove(id: number): Promise<void> {
    const activity = await this.findOne(id);
    await this.activitiesRepository.remove(activity);
  }
}
