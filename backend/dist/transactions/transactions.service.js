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
import { AccountsService } from '../accounts/accounts.service.js';
import { ActivitiesService } from '../activities/activities.service.js';
import { Transaction } from './entities/transaction.entity.js';
const TRANSACTION_TYPES = ['income', 'expense'];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
let TransactionsService = class TransactionsService {
    transactionsRepository;
    accountsService;
    activitiesService;
    constructor(transactionsRepository, accountsService, activitiesService) {
        this.transactionsRepository = transactionsRepository;
        this.accountsService = accountsService;
        this.activitiesService = activitiesService;
    }
    async findAll(userId) {
        return await this.transactionsRepository.find({
            where: { account: { user: { id: userId } } },
            order: { date: 'DESC', id: 'DESC' },
        });
    }
    async findOne(id, userId) {
        const transaction = await this.transactionsRepository.findOneBy({
            id,
            account: { user: { id: userId } },
        });
        if (!transaction) {
            throw new NotFoundException('La transacción no existe o no está disponible.');
        }
        return transaction;
    }
    async create(createTransactionDto, userId) {
        const fields = await this.validate(createTransactionDto, userId);
        const savedTransaction = await this.transactionsRepository.save(this.toEntityFields(fields));
        return await this.findOne(savedTransaction.id, userId);
    }
    async update(id, updateTransactionDto, userId) {
        const transaction = await this.findOne(id, userId);
        const fields = await this.validate({
            type: updateTransactionDto.type ?? transaction.type,
            amount: updateTransactionDto.amount ?? transaction.amount,
            date: updateTransactionDto.date ?? transaction.date,
            description: updateTransactionDto.description ?? transaction.description,
            accountId: updateTransactionDto.accountId ?? transaction.accountId,
            activityId: updateTransactionDto.activityId ?? transaction.activityId,
        }, userId);
        await this.transactionsRepository.save(this.toEntityFields(fields, transaction.id));
        return await this.findOne(id, userId);
    }
    async remove(id, userId) {
        const transaction = await this.findOne(id, userId);
        await this.transactionsRepository.remove(transaction);
    }
    async validate(transactionDto, userId) {
        if (!TRANSACTION_TYPES.includes(transactionDto.type)) {
            throw new BadRequestException('El tipo de transacción no es válido.');
        }
        if (!Number.isFinite(transactionDto.amount) || transactionDto.amount <= 0) {
            throw new BadRequestException('El monto de la transacción debe ser mayor que 0.');
        }
        if (!ISO_DATE_PATTERN.test(transactionDto.date ?? '')) {
            throw new BadRequestException('La fecha de la transacción no es válida.');
        }
        const description = transactionDto.description?.trim();
        if (!description) {
            throw new BadRequestException('La descripción es obligatoria.');
        }
        await this.accountsService.findOne(transactionDto.accountId, userId);
        await this.activitiesService.findOne(transactionDto.activityId, userId);
        return {
            type: transactionDto.type,
            amount: transactionDto.amount,
            date: transactionDto.date,
            description,
            accountId: transactionDto.accountId,
            activityId: transactionDto.activityId,
        };
    }
    toEntityFields(fields, id) {
        return {
            id,
            type: fields.type,
            amount: fields.amount,
            date: fields.date,
            description: fields.description,
            account: { id: fields.accountId },
            activity: { id: fields.activityId },
        };
    }
};
TransactionsService = __decorate([
    Injectable(),
    __param(0, InjectRepository(Transaction)),
    __metadata("design:paramtypes", [Repository,
        AccountsService,
        ActivitiesService])
], TransactionsService);
export { TransactionsService };
//# sourceMappingURL=transactions.service.js.map