import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BuySellCryptoDto, TransferCryptoDto, UpdateCashBalanceDto } from '../auth/dto/wallet.dto';
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

  @Post(':walletId/transfer')
  @ApiOperation({ summary: 'Transfer crypto to another user' })
  async transferCrypto(
    @Param('walletId') fromWalletId: string,
    @Body() transferDto: {
      recipient: string; // username or email
      symbol: string;
      amount: number;
    }
  ) {
    try {
      console.log('Transfer Request:', {
        fromWalletId,
        recipient: transferDto.recipient,
        symbol: transferDto.symbol,
        amount: transferDto.amount
      });

      const result = await this.walletService.transferCrypto(
        fromWalletId,
        transferDto.recipient,
        transferDto.symbol,
        transferDto.amount
      );

      return result;
    } catch (error) {
      console.error('Transfer Controller Error:', error);
      throw error;
    }
  }

  @Post('cash-balance/update')
  @ApiOperation({ summary: 'Update cash balance for wallet' })
  async updateCashBalance(
    @Body() payload: UpdateCashBalanceDto
  ) {
    try {
      return await this.walletService.updateCashBalance(
        payload.userId,
        payload.walletId,
        payload.amount,
        payload.type
      );
    } catch (error) {
      console.error('Cash Balance Update Error:', error);
      throw error;
    }
  }
}
