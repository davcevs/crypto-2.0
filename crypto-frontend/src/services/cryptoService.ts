// src/services/cryptoService.ts
import axios, { AxiosInstance } from "axios";
import { WalletData } from "../interfaces/WalletInterfaces";

export interface CryptoPrice {
  symbol: string;
  price: number;
}

export interface BuySellCryptoDto {
  userId: string; // Add userId to the interface
  walletId: string;
  symbol: string;
  amount: number;
}

export interface CryptoStats {
  priceChange: number;
  priceChangePercent: number;
}

export interface BuySellCryptoDto {
  walletId: string;
  symbol: string;
  amount: number;
}

export interface TransferCryptoDto {
  toWalletId: string;
  symbol: string;
  amount: number;
}

// Common trading pairs
export const TRADING_PAIRS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "MATICUSDT",
  "SOLUSDT",
] as const;

export type TradingPair = (typeof TRADING_PAIRS)[number];

// Mapping for minimum trade amounts based on Binance's limits
export const MINIMUM_TRADE_AMOUNTS: Record<TradingPair, number> = {
  BTCUSDT: 0.0001,
  ETHUSDT: 0.001,
  BNBUSDT: 0.01,
  XRPUSDT: 1,
  ADAUSDT: 1,
  DOGEUSDT: 100,
  MATICUSDT: 1,
  SOLUSDT: 0.1,
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
  private cachedWalletId: string | null = null;

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

  private getUserData() {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.user?.id) {
      throw new Error("User data not found. Please login again.");
    }
    return userData.user;
  }

  public async createWallet(userId: string): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/wallet`, { userId });
      return response.data.walletId;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw new Error("Failed to create wallet");
    }
  }

  public async getWalletId(): Promise<string> {
    try {
      // Return cached wallet ID if available
      if (this.cachedWalletId) {
        return this.cachedWalletId;
      }

      // First get user data
      const userData = this.getUserData();

      // Get wallet details using user ID - note the updated endpoint
      const response = await this.axiosInstance.get(
        `/wallet/user/${userData.id}`
      );

      if (!response.data?.walletId) {
        throw new Error("No wallet ID found in response");
      }

      // Cache the wallet ID
      this.cachedWalletId = response.data.walletId;
      return this.cachedWalletId;
    } catch (error: any) {
      console.error("Error fetching wallet ID:", error);
      if (error.response?.status === 404) {
        throw new Error(
          "Wallet not found. Please ensure you have created a wallet."
        );
      }
      throw new Error(
        "Failed to fetch wallet ID. Please ensure you are logged in."
      );
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

  public async getUserWalletId(): Promise<string> {
    try {
      const userData = this.getUserData();
      const response = await axios.get(
        `${API_BASE_URL}/wallet/user/${userData.id}`
      );
      return response.data.walletId;
    } catch (error) {
      console.error("Error fetching wallet ID:", error);
      throw new Error("Failed to fetch wallet ID");
    }
  }

  public async getWalletData(): Promise<WalletData> {
    try {
      const walletId = await this.getWalletId();
      const response = await this.axiosInstance.get(`/wallet/${walletId}`);

      console.log("Raw wallet response:", response.data);

      // Ensure the response data has the expected structure
      const walletData: WalletData = {
        walletId: response.data.walletId,
        userId: response.data.userId,
        holdings: Array.isArray(response.data.holdings)
          ? response.data.holdings
          : [],
        cashBalance: parseFloat(response.data.cashBalance),
        balances: Array.isArray(response.data.balances)
          ? response.data.balances
          : [],
      };

      return walletData;
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      throw new Error("Failed to fetch wallet data");
    }
  }

  public async buyCrypto(dto: BuySellCryptoDto): Promise<void> {
    try {
      // Get the wallet ID first
      const walletId = await this.getWalletId();

      if (!dto.userId) {
        throw new Error("User ID is required");
      }

      const response = await this.axiosInstance.post(
        `/wallet/${walletId}/buy`,
        {
          userId: dto.userId,
          symbol: dto.symbol,
          amount: dto.amount,
          walletId: walletId, // Add walletId to the request payload
        }
      );

      // Invalidate the cache after a successful purchase
      this.cachedWalletId = null;

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.cachedWalletId = null;
        localStorage.removeItem("token");
        throw new Error("Unauthorized: Please log in again.");
      } else if (error.response?.status === 404) {
        this.cachedWalletId = null;
        throw new Error(
          "Wallet not found. Please ensure you have created a wallet."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Invalid buy request parameters."
        );
      }
      throw new Error(
        error.response?.data?.message ||
          "Unable to process your trade at this time."
      );
    }
  }

  public async sellCrypto(dto: BuySellCryptoDto): Promise<void> {
    try {
      // Get the wallet ID first
      const walletId = await this.getWalletId();

      if (!dto.userId) {
        throw new Error("User ID is required");
      }

      // Check if we have sufficient balance before attempting to sell
      const walletData = await this.getWalletData();
      const symbol = dto.symbol.replace("USDT", "");

      // Find the balance for the specific crypto
      const cryptoBalance = walletData.balances.find(
        (balance) => balance.symbol === symbol
      );

      console.log("Wallet Data:", walletData);
      console.log("Looking for symbol:", symbol);
      console.log("Found balance:", cryptoBalance);

      if (!cryptoBalance || cryptoBalance.free < dto.amount) {
        throw new Error(
          `Insufficient ${symbol} balance. Available: ${
            cryptoBalance ? cryptoBalance.free : 0
          }`
        );
      }

      const response = await this.axiosInstance.post(
        `/wallet/${walletId}/sell`,
        {
          userId: dto.userId,
          walletId: walletId,
          symbol: dto.symbol,
          amount: dto.amount,
        }
      );

      // Invalidate the cache after a successful sale
      this.cachedWalletId = null;

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.cachedWalletId = null;
        throw new Error("Unauthorized: Please log in again.");
      } else if (error.response?.status === 404) {
        throw new Error(
          "Wallet not found. Please ensure you have created a wallet."
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Invalid sell parameters."
        );
      } else if (error.response?.status === 500) {
        console.error("Server error details:", error.response.data);
        throw new Error(
          "Server error: Unable to process sell order. Please try again later."
        );
      }
      // If it's a custom error we threw (like insufficient balance)
      if (error.message && !error.response) {
        throw error;
      }
      throw new Error(
        error.response?.data?.message || "Failed to sell crypto."
      );
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
