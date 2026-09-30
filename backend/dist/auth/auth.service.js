var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
let AuthService = class AuthService {
    usersService;
    passwordHasher;
    tokenService;
    constructor(usersService, passwordHasher, tokenService) {
        this.usersService = usersService;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async signIn(loginDto) {
        const user = await this.verifyCredentials(loginDto);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas.');
        }
        if (!user.active) {
            throw new UnauthorizedException('Tu cuenta se encuentra inactiva.');
        }
        return await this.tokenService.issue(String(user.id), {
            method: 'password',
            claims: { amr: ['pwd'] },
        });
    }
    async refresh(refreshToken) {
        return await this.tokenService.refresh(refreshToken ?? '');
    }
    async revoke(refreshToken) {
        await this.tokenService.revoke(refreshToken ?? '');
    }
    async verifyCredentials({ email, password, }) {
        const credentials = await this.usersService.findCredentials(email?.trim().toLowerCase() ?? '');
        const passwordMatches = await this.passwordHasher.verify(password ?? '', credentials?.passwordHash);
        return passwordMatches && credentials ? credentials.user : null;
    }
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        PasswordHasher,
        TokenService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map