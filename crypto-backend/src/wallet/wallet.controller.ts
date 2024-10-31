import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuySellCryptoDto, TransferCryptoDto } from '../auth/dto/wallet.dto';

@ApiTags('Wallet')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet details' })
  getWallet(@Param('userId') id: string) {
    return this.walletService.getUserWallet(id);
  }

  @Get('user/:userId')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet by user ID' })
  async getWalletByUserId(@Param('walletId') userId: string) {
    return this.walletService.getWalletById(userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get wallet statistics' })
  getWalletStats(@Param('walletId') id: string) {
    return this.walletService.getWalletStats(id);
  }

  @Post(':id/buy')
  @ApiOperation({ summary: 'Buy crypto' })
  async buyCrypto(@Body() buyCryptoDto: BuySellCryptoDto) {
    await this.walletService.buyCrypto(buyCryptoDto);
    return { success: true };
  }

  @Post(':id/sell')
  @ApiOperation({ summary: 'Sell crypto' })
  sellCrypto(
    @Param('walletId') id: string,
    @Body() sellCryptoDto: BuySellCryptoDto,
  ) {
    return this.walletService.sellCrypto(
      id,
      sellCryptoDto.symbol,
      sellCryptoDto.amount,
    );
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer crypto to another wallet' })
  transferCrypto(
    @Param('id') id: string,
    @Body() transferDto: TransferCryptoDto,
  ) {
    return this.walletService.transferCrypto(
      id,
      transferDto.toWalletId,
      transferDto.symbol,
      transferDto.amount,
    );
  }
}
