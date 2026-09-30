import { ActivitiesService } from './activities.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import type { Activity } from './entities/activity.entity.js';
export declare class ActivitiesController {
    private readonly activitiesService;
    constructor(activitiesService: ActivitiesService);
    findAll(userId: number): Promise<Activity[]>;
    findOne(id: string, userId: number): Promise<Activity>;
    create(createActivityDto: CreateActivityDto, userId: number): Promise<Activity>;
    update(id: string, updateActivityDto: UpdateActivityDto, userId: number): Promise<Activity>;
    remove(id: string, userId: number): Promise<void>;
}
