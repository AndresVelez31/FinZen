import type { User } from '../users/entities/user.entity.js';
declare module '@nestjs/authentication' {
    interface AuthenticationTypes {
        user: User;
    }
}
