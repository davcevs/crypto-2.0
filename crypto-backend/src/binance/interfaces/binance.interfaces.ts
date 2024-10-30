export interface BinanceTickerPrice {
  symbol: string;
  price: string;
}

export interface Binance24HrStats {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  lastPrice: string;
  volume: string;
}
