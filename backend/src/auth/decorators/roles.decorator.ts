// Imports
import { SetMetadata } from '@nestjs/common';
import type { Role } from '../../users/enums/role.enum.js';

// Exports
export const ROLES_KEY = 'roles';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
