// External imports
import { BadRequestException, Injectable } from '@nestjs/common';

// Internal imports
import { CreateAccountDto } from './dto/create-account.dto.js';

// Exports
// Checks and picks the editable fields of a request body, so the service only handles
// persistence and ownership; a body can never change the owner.
@Injectable()
export class AccountsValidator {
  validate(accountDto: CreateAccountDto): CreateAccountDto {
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
}
