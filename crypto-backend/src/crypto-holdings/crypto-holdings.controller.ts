// crypto-holdings.controller.ts
import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { CryptoHoldingsService } from './crypto-holdings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateHoldingDto } from '../crypto-holdings/dto/update-holding.dto';

@Controller('crypto-holdings')
@UseGuards(JwtAuthGuard)
export class CryptoHoldingsController {
  constructor(private readonly cryptoHoldingsService: CryptoHoldingsService) {}

  @Get(':walletId/holdings')
  async getHoldings(@Param('walletId') walletId: string) {
    const holdings = await this.cryptoHoldingsService.getHoldings(walletId);
    return { holdings };
  }

  @Put(':walletId/holdings/:symbol')
  async updateHolding(
    @Param('walletId') walletId: string,
    @Param('symbol') symbol: string,
    @Body() updateHoldingDto: UpdateHoldingDto,
  ) {
    return await this.cryptoHoldingsService.updateHoldingAmount(
      walletId,
      symbol,
      updateHoldingDto.amount,
      updateHoldingDto.price,
      updateHoldingDto.type,
    );
  }
}
