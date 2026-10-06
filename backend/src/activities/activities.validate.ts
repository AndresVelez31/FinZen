// External imports
import { BadRequestException, Injectable } from '@nestjs/common';

// Internal imports
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { ActivityType } from './enums/activity-type.enum.js';

// Exports
// Checks and picks the editable fields of a request body, so the service only handles
// persistence and ownership; a body can never change the owner.
@Injectable()
export class ActivitiesValidator {
  validate(activityDto: CreateActivityDto): CreateActivityDto {
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
