var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './entities/activity.entity.js';
const ACTIVITY_TYPES = ['expense', 'savings'];
let ActivitiesService = class ActivitiesService {
    activitiesRepository;
    constructor(activitiesRepository) {
        this.activitiesRepository = activitiesRepository;
    }
    async findAll(userId) {
        return await this.activitiesRepository.find({
            where: { user: { id: userId } },
            order: { id: 'ASC' },
        });
    }
    async findOne(id, userId) {
        const activity = await this.activitiesRepository.findOneBy({ id, user: { id: userId } });
        if (!activity) {
            throw new NotFoundException('La actividad no existe o no está disponible.');
        }
        return activity;
    }
    async create(createActivityDto, userId) {
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
    async update(id, updateActivityDto, userId) {
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
    async remove(id, userId) {
        const activity = await this.findOne(id, userId);
        await this.activitiesRepository.remove(activity);
    }
    validate(activityDto) {
        const name = activityDto.name?.trim();
        if (!name) {
            throw new BadRequestException('El nombre de la actividad es obligatorio.');
        }
        if (!ACTIVITY_TYPES.includes(activityDto.type)) {
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
};
ActivitiesService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Activity)),
    __metadata("design:paramtypes", [Repository])
], ActivitiesService);
export { ActivitiesService };
//# sourceMappingURL=activities.service.js.map