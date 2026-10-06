// External imports
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Internal imports
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import { Activity } from './entities/activity.entity.js';
import { ActivityType } from './enums/activity-type.enum.js';

// Exports
@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async findAll(userId: number): Promise<Activity[]> {
    return await this.activitiesRepository.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  // Another user's activity behaves exactly like a missing one.
  async findOne(id: number, userId: number): Promise<Activity> {
    const activity = await this.activitiesRepository.findOneBy({ id, user: { id: userId } });
    if (!activity) {
      throw new NotFoundException('La actividad no existe o no está disponible.');
    }
    return activity;
  }

  async create(createActivityDto: CreateActivityDto, userId: number): Promise<Activity> {
    const fields = this.validate(createActivityDto);
    const activity = this.activitiesRepository.create({
      name: fields.name,
      color: fields.color,
      type: fields.type,
      targetAmount: fields.targetAmount,
      user: { id: userId },
    });
    const savedActivity = await this.activitiesRepository.save(activity);
    return await this.findOne(savedActivity.id, userId);
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
    userId: number,
  ): Promise<Activity> {
    const activity = await this.findOne(id, userId);
    const fields = this.validate({
      name: updateActivityDto.name ?? activity.name,
      color: updateActivityDto.color ?? activity.color,
      type: updateActivityDto.type ?? activity.type,
      targetAmount: updateActivityDto.targetAmount ?? activity.targetAmount,
    });

    Object.assign(activity, fields);
    return await this.activitiesRepository.save(activity);
  }

  // The activity's transactions are removed by the database (onDelete: 'CASCADE').
  async remove(id: number, userId: number): Promise<void> {
    const activity = await this.findOne(id, userId);
    await this.activitiesRepository.remove(activity);
  }

  // Picks only the editable fields, so a request body can never change the owner.
  private validate(activityDto: CreateActivityDto): CreateActivityDto {
    const name = activityDto.name?.trim();
    if (!name) {
      throw new BadRequestException('El nombre de la actividad es obligatorio.');
    }
    if (!Object.values(ActivityType).includes(activityDto.type)) {
      throw new BadRequestException('El tipo de actividad no es válido.');
    }
    if (!activityDto.color) {
      throw new BadRequestException('El color de la actividad es obligatorio.');
    }
    if (!Number.isFinite(activityDto.targetAmount) || activityDto.targetAmount <= 0) {
      throw new BadRequestException('El monto objetivo debe ser mayor que 0.');
    }

    return {
      name,
      color: activityDto.color,
      type: activityDto.type,
      targetAmount: activityDto.targetAmount,
    };
  }
}
