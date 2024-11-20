import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuySellCryptoDto, TransferCryptoDto } from '../auth/dto/wallet.dto';
import { CryptoHoldingsService } from 'src/crypto-holdings/crypto-holdings.service';

@ApiTags('Wallet')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(
    private walletService: WalletService,
    private readonly cryptoHoldingsService: CryptoHoldingsService,
  ) { }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet details' })
  getWallet(@Param('userId') id: string) {
    return this.walletService.getUserWallet(id);
  }

  @Get('user/:walletId')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get wallet by wallet ID' })
  async getWalletByUserId(@Param('walletId') userId: string) {
    return this.walletService.getWalletById(userId);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get wallet statistics' })
  getWalletStats(@Param('walletId') id: string) {
    return this.walletService.getWalletStats(id);
  }
  @Post(':id/buy')
  async buyCrypto(
    @Param('id') userId: string,
    @Body() buyCryptoDto: BuySellCryptoDto
  ) {
    try {
      console.log('Controller received userId:', userId);

      // Use the userId from the URL parameter
      const fullDto = {
        ...buyCryptoDto,
        userId  // Changed from walletId to userId
      };

      return await this.walletService.buyCrypto(fullDto);
    } catch (error) {
      console.error('Buy Crypto Error:', error);
      throw error;
    }
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
