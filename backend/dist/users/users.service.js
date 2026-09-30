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
import { User } from './entities/user.entity.js';
import { Role } from './enums/role.enum.js';
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async findAll() {
        return await this.usersRepository.find({ order: { id: 'ASC' } });
    }
    async findOne(id) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new NotFoundException('El usuario no existe.');
        }
        return user;
    }
    async findActive(id) {
        return await this.usersRepository.findOneBy({ id, active: true });
    }
    async findCredentials(email) {
        const row = await this.usersRepository.findOne({
            where: { email },
            select: {
                id: true,
                name: true,
                role: true,
                email: true,
                password: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!row) {
            return null;
        }
        const { password: passwordHash, ...user } = row;
        return { user, passwordHash };
    }
    async update(id, updateUserDto, currentUserId) {
        if (id === currentUserId) {
            throw new BadRequestException('No puedes modificar tu propio usuario.');
        }
        const user = await this.findOne(id);
        if (updateUserDto.role !== undefined) {
            if (!Object.values(Role).includes(updateUserDto.role)) {
                throw new BadRequestException('El rol no es válido.');
            }
            user.role = updateUserDto.role;
        }
        if (updateUserDto.active !== undefined) {
            if (typeof updateUserDto.active !== 'boolean') {
                throw new BadRequestException('El estado del usuario no es válido.');
            }
            user.active = updateUserDto.active;
        }
        return await this.usersRepository.save(user);
    }
};
UsersService = __decorate([
    Injectable(),
    __param(0, InjectRepository(User)),
    __metadata("design:paramtypes", [Repository])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map