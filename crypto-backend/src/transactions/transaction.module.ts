// transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from 'src/entities/transaction.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { CryptoHolding } from 'src/entities/crypto-holding.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Wallet, CryptoHolding])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
