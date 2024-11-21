// src/services/cryptoService.ts
import axios, { AxiosInstance } from "axios";

export interface CryptoPrice {
  symbol: string;
  price: number;
}

export interface CryptoStats {
  priceChange: number;
  priceChangePercent: number;
}

// Common trading pairs
export const TRADING_PAIRS = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT",
  "DOGEUSDT", "MATICUSDT", "SOLUSDT", "AVAXUSDT",
  "TRXUSDT", "LINKUSDT", "LTCUSDT", "ATOMUSDT", "NEARUSDT",
  "XLMUSDT", "ALGOUSDT", "UNIUSDT", "ICPUSDT", "FILUSDT",
  "ETCUSDT", "SANDUSDT", "MANAUSDT", "AXSUSDT", "OPUSDT",
] as const;

export type TradingPair = (typeof TRADING_PAIRS)[number];

// Mapping for minimum trade amounts based on Binance's limits
export const MINIMUM_TRADE_AMOUNTS: Record<TradingPair, number> = {
  BTCUSDT: 0.0001,
  ETHUSDT: 0.001,
  BNBUSDT: 0.01,
  XRPUSDT: 1,
  ADAUSDT: 1000,
  DOGEUSDT: 100,
  MATICUSDT: 1,
  SOLUSDT: 0.1,
  AVAXUSDT: 0.1,
  TRXUSDT: 1,
  LINKUSDT: 0.1,
  LTCUSDT: 0.01,
  ATOMUSDT: 0.1,
  NEARUSDT: 0.1,
  XLMUSDT: 1,
  ALGOUSDT: 1,
  UNIUSDT: 0.1,
  ICPUSDT: 0.1,
  FILUSDT: 0.1,
  ETCUSDT: 0.1,
  SANDUSDT: 1,
  MANAUSDT: 1,
  AXSUSDT: 0.1,
  OPUSDT: 0.1,
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window as any).ENV_API_BASE_URL ||
  "http://localhost:3000";

export class CryptoService {
  private static instance: CryptoService;
  private priceUpdateCallbacks: ((
    prices: Record<TradingPair, number>
  ) => void)[] = [];
  private currentPrices: Partial<Record<TradingPair, number>> = {};
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Set up interceptor to always include the latest token
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.startPriceUpdates();
  }

  public setAuthToken(token: string) {
    this.authToken = token;
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  public static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  private async startPriceUpdates() {
    // Initial price fetch
    await this.updateAllPrices();

    // Set up interval for price updates
    this.priceUpdateInterval = setInterval(async () => {
      await this.updateAllPrices();
    }, 10000); // Update every 10 seconds
  }

  public subscribeToPriceUpdates(
    callback: (prices: Record<TradingPair, number>) => void
  ) {
    this.priceUpdateCallbacks.push(callback);
    // Immediately send current prices to new subscriber
    if (Object.keys(this.currentPrices).length > 0) {
      callback(this.currentPrices as Record<TradingPair, number>);
    }

    // Return unsubscribe function
    return () => {
      this.priceUpdateCallbacks = this.priceUpdateCallbacks.filter(
        (cb) => cb !== callback
      );
    };
  }

  private async updateAllPrices() {
    try {
      const prices = await Promise.all(
        TRADING_PAIRS.map(async (symbol) => {
          const price = await this.getPrice(symbol);
          return { symbol, price };
        })
      );

      const priceMap = prices.reduce((acc, { symbol, price }) => {
        acc[symbol as TradingPair] = price;
        return acc;
      }, {} as Record<TradingPair, number>);

      this.currentPrices = priceMap;
      this.priceUpdateCallbacks.forEach((callback) => callback(priceMap));
    } catch (error) {
      console.error("Failed to update prices:", error);
    }
  }



  public async getPrice(symbol: string): Promise<number> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/crypto/price/${symbol}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      throw new Error(`Unable to fetch price for ${symbol}`);
    }
  }

  public async get24HrChange(symbol: string): Promise<CryptoStats> {
    try {
      const response = await axios.get(`${API_BASE_URL}/crypto/24hr/${symbol}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch 24hr change for ${symbol}:`, error);
      throw new Error(`Unable to fetch 24hr change for ${symbol}`);
    }
  }



  public async getHistoricalPrices(
    symbol: string,
    interval = "1h",
    limit = 24
  ): Promise<Array<{ price: number; time: string }>> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/crypto/historical/${symbol}`,
        { params: { interval, limit } }
      );
      return response.data.map((entry: { close: number; time: number }) => ({
        price: entry.close,
        time: new Date(entry.time).toLocaleTimeString(),
      }));
    } catch (error) {
      console.error(`Failed to fetch historical data for ${symbol}:`, error);
      throw new Error(`Unable to fetch historical data for ${symbol}`);
    }
  }

  public cleanup() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    this.priceUpdateCallbacks = [];
  }
}

export const cryptoService = CryptoService.getInstance();
