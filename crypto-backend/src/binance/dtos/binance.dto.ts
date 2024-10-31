export class PriceResponseDto {
  symbol: string;
  price: number;
}

export class StatisticsResponseDto {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
}

export class HistoricalPriceDto {
  close: number;
  time: number;
}
