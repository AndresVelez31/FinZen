// External imports
import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Internal imports
import type { User } from '../users/entities/user.entity.js';
import type { Role } from '../users/enums/role.enum.js';
import { ROLES_KEY } from './decorators/roles.decorator.js';

// Exports
// Runs after the global AuthenticationGuard of @nestjs/authentication, which
// leaves the user loaded by JwtAuthProvider in request.user. Routes without
// @Roles() are open to any authenticated user.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: User | null }>();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para realizar esta acción.');
    }

    return true;
  }
}
