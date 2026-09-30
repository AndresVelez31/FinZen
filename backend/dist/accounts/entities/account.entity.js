var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId, UpdateDateColumn, } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { User } from '../../users/entities/user.entity.js';
let Account = class Account {
    id;
    name;
    type;
    balance;
    createdAt;
    updatedAt;
    user;
    userId;
    transactions;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], Account.prototype, "name", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], Account.prototype, "type", void 0);
__decorate([
    Column({ type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Account.prototype, "balance", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], Account.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Account.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => User, (user) => user.accounts, { onDelete: 'CASCADE', nullable: false }),
    JoinColumn({ name: 'userId' }),
    __metadata("design:type", Object)
], Account.prototype, "user", void 0);
__decorate([
    RelationId((account) => account.user),
    __metadata("design:type", Number)
], Account.prototype, "userId", void 0);
__decorate([
    OneToMany(() => Transaction, (transaction) => transaction.account),
    __metadata("design:type", Object)
], Account.prototype, "transactions", void 0);
Account = __decorate([
    Entity()
], Account);
export { Account };
//# sourceMappingURL=account.entity.js.map