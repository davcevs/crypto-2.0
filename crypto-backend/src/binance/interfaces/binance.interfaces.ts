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

export interface BinanceKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
  ignore: string;
}

export class ExchangeInfoDto {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
  minQty: string;
  minNotional: string;
}
