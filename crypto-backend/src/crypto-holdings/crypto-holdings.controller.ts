// crypto-holdings.controller.ts
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CryptoHoldingsService } from './crypto-holdings.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('crypto-holdings')
// @UseGuards(JwtAuthGuard)
export class CryptoHoldingsController {
  constructor(private readonly cryptoHoldingsService: CryptoHoldingsService) {}

  @Get(':walletId/holdings')
  async getHoldings(@Param('walletId') walletId: string) {
    return this.cryptoHoldingsService.getHoldings(walletId);
  }

  @Get(':walletId/transactions')
  async getTransactions(@Param('walletId') walletId: string) {
    return this.cryptoHoldingsService.getTransactionHistory(walletId);
  }
}
