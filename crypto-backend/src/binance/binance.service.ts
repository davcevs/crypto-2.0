import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, catchError } from 'rxjs';
import {
  BinanceTickerPrice,
  Binance24HrStats,
} from './interfaces/binance.interfaces';
import { CandlestickDto, HistoricalPriceDto, StatisticsResponseDto } from './dtos/binance.dto';

@Injectable()
export class BinanceService {
  private readonly logger = new Logger(BinanceService.name);
  private readonly apiUrl = 'https://api.binance.com/api/v3';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) { }

  async getPrice(symbol: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<BinanceTickerPrice>(`${this.apiUrl}/ticker/price`, {
            params: { symbol },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                `Failed to fetch price for ${symbol}: ${error.message}`,
              );
              throw new HttpException(
                `Unable to fetch price for ${symbol}`,
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );
      return parseFloat(response.data.price);
    } catch (error) {
      this.logger.error(`Error in getPrice: ${error.message}`);
      throw error;
    }
  }

  async get24HrChange(symbol: string): Promise<StatisticsResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<Binance24HrStats>(`${this.apiUrl}/ticker/24hr`, {
            params: { symbol },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                `Failed to fetch 24hr stats for ${symbol}: ${error.message}`,
              );
              throw new HttpException(
                `Unable to fetch 24hr change for ${symbol}`,
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );

      return {
        symbol,
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
      };
    } catch (error) {
      this.logger.error(`Error in get24HrChange: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalPrices(
    symbol: string,
    interval = '1h',
    limit = 24,
  ): Promise<HistoricalPriceDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<any[]>(`${this.apiUrl}/klines`, {
            params: { symbol, interval, limit },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                `Failed to fetch historical data for ${symbol}: ${error.message}`,
              );
              throw new HttpException(
                `Unable to fetch historical data for ${symbol}`,
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );

      return response.data.map((kline) => ({
        close: parseFloat(kline[4]), // Close price is at index 4
        time: kline[0], // Open time is at index 0
      }));
    } catch (error) {
      this.logger.error(`Error in getHistoricalPrices: ${error.message}`);
      throw error;
    }
  }

  async getCandlestickData(
    symbol: string,
    interval = '1m',
    limit = 500,
  ): Promise<CandlestickDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .get<any[]>(`${this.apiUrl}/klines`, {
            params: { symbol, interval, limit },
          })
          .pipe(
            catchError((error) => {
              this.logger.error(
                `Failed to fetch candlestick data for ${symbol}: ${error.message}`,
              );
              throw new HttpException(
                `Unable to fetch candlestick data for ${symbol}`,
                HttpStatus.BAD_REQUEST,
              );
            }),
          ),
      );

      return response.data.map((kline) => ({
        openTime: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteVolume: parseFloat(kline[7]),
        trades: kline[8],
        takerBuyBaseVolume: parseFloat(kline[9]),
        takerBuyQuoteVolume: parseFloat(kline[10]),
      }));
    } catch (error) {
      this.logger.error(`Error in getCandlestickData: ${error.message}`);
      throw error;
    }
  }
}
