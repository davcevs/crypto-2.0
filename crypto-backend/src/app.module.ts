import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { AuthModule } from './auth/auth.module';
import { BinanceModule } from './binance/binance.module';
import { WalletModule } from './wallet/wallet.module';
import { User } from './entities/user.entity';
import { Wallet } from './entities/wallet.entity';
import { Transaction } from './entities/transaction.entity';
import { CryptoHolding } from './entities/crypto-holding.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'crypto_simulator',
      entities: [User, Wallet, Transaction, CryptoHolding],
      synchronize: true,
    }),
    AuthModule,
    WalletModule,
    BinanceModule,
  ],
})
export class AppModule {}
