// External imports
import { BadRequestException, Injectable } from '@nestjs/common';

// Internal imports
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { TransactionType } from './enums/transaction-type.enum.js';

// Exports
// Checks and picks the editable fields of a request body, so the service only handles
// persistence and ownership; a body can never change the owner.
@Injectable()
export class TransactionsValidator {
  private static readonly ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

  validate(transactionDto: CreateTransactionDto): CreateTransactionDto {
    if (!Object.values(TransactionType).includes(transactionDto.type)) {
      throw new BadRequestException('El tipo de transacción no es válido.');
    }
    if (!Number.isFinite(transactionDto.amount) || transactionDto.amount <= 0) {
      throw new BadRequestException('El monto de la transacción debe ser mayor que 0.');
    }
    if (!TransactionsValidator.ISO_DATE_PATTERN.test(transactionDto.date ?? '')) {
      throw new BadRequestException('La fecha de la transacción no es válida.');
    }

    const description = transactionDto.description?.trim();
    if (!description) {
      throw new BadRequestException('La descripción es obligatoria.');
    }

    return {
      type: transactionDto.type,
      amount: transactionDto.amount,
      date: transactionDto.date,
      description,
      accountId: transactionDto.accountId,
      activityId: transactionDto.activityId,
    };
  }
}
