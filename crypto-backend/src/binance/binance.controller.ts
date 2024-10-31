import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { BinanceService } from './binance.service';
import {
  HistoricalPriceDto,
  PriceResponseDto,
  StatisticsResponseDto,
} from './dtos/binance.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly binanceService: BinanceService) {}

  @Get('price/:symbol')
  @ApiOperation({ summary: 'Get current price for a trading pair' })
  @ApiParam({
    name: 'symbol',
    description: 'Trading pair symbol (e.g., BTCUSDT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current price',
    type: PriceResponseDto,
  })
  async getPrice(@Param('symbol') symbol: string): Promise<number> {
    try {
      return await this.binanceService.getPrice(symbol.toUpperCase());
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch price',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('24hr/:symbol')
  @ApiOperation({ summary: 'Get 24-hour statistics for a trading pair' })
  @ApiParam({
    name: 'symbol',
    description: 'Trading pair symbol (e.g., BTCUSDT)',
  })
  @ApiResponse({
    status: 200,
    description: '24-hour statistics',
    type: StatisticsResponseDto,
  })
  async get24HrChange(
    @Param('symbol') symbol: string,
  ): Promise<StatisticsResponseDto> {
    try {
      return await this.binanceService.get24HrChange(symbol.toUpperCase());
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch 24hr statistics',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('historical/:symbol')
  @ApiOperation({ summary: 'Get historical prices for a trading pair' })
  @ApiParam({
    name: 'symbol',
    description: 'Trading pair symbol (e.g., BTCUSDT)',
  })
  @ApiParam({
    name: 'interval',
    description: 'Kline interval (e.g., 1h, 4h, 1d)',
    required: false,
  })
  @ApiParam({
    name: 'limit',
    description: 'Number of data points to return',
    required: false,
  })
  async getHistoricalPrices(
    @Param('symbol') symbol: string,
    @Query('interval') interval?: string,
    @Query('limit') limit?: number,
  ): Promise<HistoricalPriceDto[]> {
    try {
      return await this.binanceService.getHistoricalPrices(
        symbol.toUpperCase(),
        interval,
        limit,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch historical prices',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
