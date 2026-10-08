// External imports
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

// Internal imports
import { Role } from '../users/enums/role.enum.js';
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

  async findAllByUserId(userId: number): Promise<Activity[]> {
    return await this.activitiesRepository.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' },
    });
  }

  // Another user's activity behaves exactly like a missing one.
  async findOneByIdAndUserId(id: number, userId: number): Promise<Activity> {
    const activity = await this.activitiesRepository.findOneBy({ id, user: { id: userId } });
    if (!activity) {
      throw new NotFoundException('La actividad no existe o no está disponible.');
    }
    return activity;
  }

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
    return await this.findOneByIdAndUserId(savedActivity.id, userId);
  }

  async update(
    id: number,
    updateActivityDto: UpdateActivityDto,
    userId: number,
  ): Promise<Activity> {
    const activity = await this.findOneByIdAndUserId(id, userId);
    const fields = this.activitiesValidator.validate({
      name: updateActivityDto.name ?? activity.name,
      color: updateActivityDto.color ?? activity.color,
      type: updateActivityDto.type ?? activity.type,
      targetAmount: updateActivityDto.targetAmount ?? activity.targetAmount,
    });

    Object.assign(activity, fields);
    return await this.activitiesRepository.save(activity);
  }

  // The administrators' activities are the template: every new user starts with a copy of them
  // and then owns and edits those copies. It runs inside the sign-up transaction, so a user is
  // never left without activities.
  async copyTemplateToUser(userId: number, manager: EntityManager): Promise<void> {
    const repository = manager.getRepository(Activity);
    const template = await repository.find({
      where: { user: { role: Role.Admin } },
      order: { id: 'ASC' },
    });
    const copies = template.map((activity) =>
      repository.create({
        name: activity.name,
        color: activity.color,
        type: activity.type,
        targetAmount: activity.targetAmount,
        user: { id: userId },
      }),
    );
    await repository.save(copies);
  }

  // The activity's transactions are removed by the database (onDelete: 'CASCADE').
  async remove(id: number, userId: number): Promise<void> {
    const activity = await this.findOneByIdAndUserId(id, userId);
    await this.activitiesRepository.remove(activity);
  }
}
