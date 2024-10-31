import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from '../entities/wallet.entity';
import { CryptoHolding } from '../entities/crypto-holding.entity';
import { Transaction } from '../entities/transaction.entity';
import { BinanceModule } from '../binance/binance.module';
import { AuthModule } from 'src/auth/auth.module';
import { WalletController } from './wallet.controller';
import { CryptoHoldingsService } from 'src/crypto-holdings/crypto-holdings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, CryptoHolding, Transaction]),
    forwardRef(() => AuthModule), // Adjust according to your project structure
    BinanceModule,
  ],
  controllers: [WalletController], // Ensure WalletController is listed here
  providers: [WalletService, CryptoHoldingsService],
  exports: [WalletService],
})
export class WalletModule {}
