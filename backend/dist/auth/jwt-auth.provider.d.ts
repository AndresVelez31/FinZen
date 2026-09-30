import { AuthenticationRegistry, JwtBearerProvider } from '@nestjs/authentication';
import type { JwtClaims } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';
export declare class JwtAuthProvider extends JwtBearerProvider<User> {
    private readonly usersService;
    constructor(usersService: UsersService, registry: AuthenticationRegistry);
    protected validate({ sub }: JwtClaims): Promise<User | null>;
}
