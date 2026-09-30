var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from './accounts/accounts.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { AuthModule } from './auth/auth.module.js';
import { dataSourceOptions } from './database/data-source.js';
import { HomeModule } from './home/home.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [
            TypeOrmModule.forRoot({
                ...dataSourceOptions,
                autoLoadEntities: true,
                migrationsRun: true,
            }),
            AuthenticationModule.forRoot({
                accessToken: {
                    key: process.env.JWT_SECRET ?? 'finzen-local-development-secret-change-me',
                    issuer: 'finzen-api',
                    audience: 'finzen-spa',
                    ttl: '15m',
                },
                refreshToken: {
                    ttl: '7d',
                    absoluteTtl: '30d',
                },
                allowInMemoryStorage: true,
            }),
            HomeModule,
            AuthModule,
            UsersModule,
            AccountsModule,
            ActivitiesModule,
            TransactionsModule,
        ],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map