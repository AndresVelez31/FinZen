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
import { Account } from './entities/account.entity.js';
let AccountsService = class AccountsService {
    accountsRepository;
    constructor(accountsRepository) {
        this.accountsRepository = accountsRepository;
    }
    async findAll(userId) {
        return await this.accountsRepository.find({
            where: { user: { id: userId } },
            order: { id: 'ASC' },
        });
    }
    async findOne(id, userId) {
        const account = await this.accountsRepository.findOneBy({ id, user: { id: userId } });
        if (!account) {
            throw new NotFoundException('La cuenta no existe o no está disponible.');
        }
        return account;
    }
    async create(createAccountDto, userId) {
        const fields = this.validate(createAccountDto);
        const account = this.accountsRepository.create({
            name: fields.name,
            type: fields.type,
            balance: fields.balance,
            user: { id: userId },
        });
        const savedAccount = await this.accountsRepository.save(account);
        return await this.findOne(savedAccount.id, userId);
    }
    async update(id, updateAccountDto, userId) {
        const account = await this.findOne(id, userId);
        const fields = this.validate({
            name: updateAccountDto.name ?? account.name,
            type: updateAccountDto.type ?? account.type,
            balance: updateAccountDto.balance ?? account.balance,
        });
        Object.assign(account, fields);
        return await this.accountsRepository.save(account);
    }
    async remove(id, userId) {
        const account = await this.findOne(id, userId);
        await this.accountsRepository.remove(account);
    }
    validate(accountDto) {
        const name = accountDto.name?.trim();
        if (!name) {
            throw new BadRequestException('El nombre de la cuenta es obligatorio.');
        }
        if (!accountDto.type) {
            throw new BadRequestException('El tipo de cuenta es obligatorio.');
        }
        if (!Number.isFinite(accountDto.balance) || accountDto.balance < 0) {
            throw new BadRequestException('El saldo inicial debe ser mayor o igual a 0.');
        }
        return { name, type: accountDto.type, balance: accountDto.balance };
    }
};
AccountsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Account)),
    __metadata("design:paramtypes", [Repository])
], AccountsService);
export { AccountsService };
//# sourceMappingURL=accounts.service.js.map