import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BinanceService } from './binance.service';
import { CryptoController } from './binance.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  controllers: [CryptoController],
  providers: [BinanceService],
  exports: [BinanceService],
})
export class BinanceModule {}
