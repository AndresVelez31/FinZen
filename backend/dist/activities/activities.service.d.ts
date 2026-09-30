import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';
import { Activity } from './entities/activity.entity.js';
export declare class ActivitiesService {
    private readonly activitiesRepository;
    constructor(activitiesRepository: Repository<Activity>);
    findAll(userId: number): Promise<Activity[]>;
    findOne(id: number, userId: number): Promise<Activity>;
    create(createActivityDto: CreateActivityDto, userId: number): Promise<Activity>;
    update(id: number, updateActivityDto: UpdateActivityDto, userId: number): Promise<Activity>;
    remove(id: number, userId: number): Promise<void>;
    private validate;
}
