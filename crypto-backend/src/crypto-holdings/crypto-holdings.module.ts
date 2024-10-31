/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptoHolding } from 'src/entities/crypto-holding.entity';
import { Wallet } from 'src/entities/wallet.entity';
import { CryptoHoldingsController } from './crypto-holdings.controller';
import { CryptoHoldingsService } from './crypto-holdings.service';
import { Transaction } from 'src/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CryptoHolding, Transaction, Wallet])],
  providers: [CryptoHoldingsService],
  controllers: [CryptoHoldingsController],
  exports: [CryptoHoldingsService],
})
export class CryptoHoldingsModule {}
