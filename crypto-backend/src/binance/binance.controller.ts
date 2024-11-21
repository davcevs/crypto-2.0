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
  CandlestickDto,
  HistoricalPriceDto,
  PriceResponseDto,
  StatisticsResponseDto,
} from './dtos/binance.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly binanceService: BinanceService) { }

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

  @Get('candlestick/:symbol')
  @ApiOperation({ summary: 'Get candlestick data for a trading pair' })
  @ApiParam({
    name: 'symbol',
    description: 'Trading pair symbol (e.g., BTCUSDT)',
  })
  @ApiParam({
    name: 'interval',
    description: 'Kline interval (1m,3m,5m,15m,30m,1h,2h,4h,6h,8h,12h,1d,3d,1w,1M)',
    required: false,
  })
  @ApiParam({
    name: 'limit',
    description: 'Number of candles to return (default 500, max 1000)',
    required: false,
  })
  async getCandlestickData(
    @Param('symbol') symbol: string,
    @Query('interval') interval = '1m',
    @Query('limit') limit = 500,
  ): Promise<CandlestickDto[]> {
    try {
      return await this.binanceService.getCandlestickData(
        symbol.toUpperCase(),
        interval,
        limit,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch candlestick data',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('exchangeInfo')
  @ApiOperation({ summary: 'Get all trading pairs and their details' })
  @ApiResponse({
    status: 200,
    description: 'List of trading pairs and details',
    schema: {
      example: [
        {
          symbol: 'BTCUSDT',
          baseAsset: 'BTC',
          quoteAsset: 'USDT',
          status: 'TRADING',
          minQty: '0.0001',
          minNotional: '10'
        }
      ]
    }
  })
  async getExchangeInfo() {
    try {
      // Ensure this method is implemented in your BinanceService
      const exchangeInfo = await this.binanceService.getExchangeInfo();
      return exchangeInfo;
    } catch (error) {
      console.error('Exchange Info Fetch Error:', error);
      throw new HttpException(
        {
          status: 'error',
          message: 'Failed to fetch exchange information',
          details: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }


}
