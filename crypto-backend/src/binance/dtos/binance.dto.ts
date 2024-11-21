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

export class CandlestickDto {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
  takerBuyBaseVolume: number;
  takerBuyQuoteVolume: number;
}