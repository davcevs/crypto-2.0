// transaction.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from '../transactions/dtos/transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTransaction(
    @Body(new ValidationPipe()) createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Get('wallet/:walletId')
  @ApiOperation({ summary: 'Get all transactions for a wallet' })
  @ApiResponse({ status: 200, description: 'Returns all transactions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getWalletTransactions(@Param('walletId') walletId: string) {
    return this.transactionService.getTransactionsByWallet(walletId);
  }

  @Get('stats/:walletId')
  @ApiOperation({ summary: 'Get transaction statistics for a wallet' })
  @ApiResponse({ status: 200, description: 'Returns transaction statistics' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTransactionStats(@Param('walletId') walletId: string) {
    return this.transactionService.getTransactionStats(walletId);
  }
}
