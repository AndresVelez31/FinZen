var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn, } from 'typeorm';
import { Account } from '../../accounts/entities/account.entity.js';
import { Activity } from '../../activities/entities/activity.entity.js';
let Transaction = class Transaction {
    id;
    type;
    amount;
    date;
    description;
    updatedAt;
    account;
    accountId;
    activity;
    activityId;
};
__decorate([
    PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Transaction.prototype, "id", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], Transaction.prototype, "type", void 0);
__decorate([
    Column({ type: 'decimal', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    Column({ type: 'date' }),
    __metadata("design:type", String)
], Transaction.prototype, "date", void 0);
__decorate([
    Column({ type: 'varchar' }),
    __metadata("design:type", String)
], Transaction.prototype, "description", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], Transaction.prototype, "updatedAt", void 0);
__decorate([
    ManyToOne(() => Account, (account) => account.transactions, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    JoinColumn({ name: 'accountId' }),
    __metadata("design:type", Object)
], Transaction.prototype, "account", void 0);
__decorate([
    RelationId((transaction) => transaction.account),
    __metadata("design:type", Number)
], Transaction.prototype, "accountId", void 0);
__decorate([
    ManyToOne(() => Activity, (activity) => activity.transactions, {
        onDelete: 'CASCADE',
        nullable: false,
    }),
    JoinColumn({ name: 'activityId' }),
    __metadata("design:type", Object)
], Transaction.prototype, "activity", void 0);
__decorate([
    RelationId((transaction) => transaction.activity),
    __metadata("design:type", Number)
], Transaction.prototype, "activityId", void 0);
Transaction = __decorate([
    Entity()
], Transaction);
export { Transaction };
//# sourceMappingURL=transaction.entity.js.map