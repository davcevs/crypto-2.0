// src/services/cryptoService.ts
import axios, { AxiosInstance } from "axios";
import { WalletData } from "../interfaces/WalletInterfaces";
import cryptoHoldingsService from "./cryptoHoldingsService";

export interface CryptoPrice {
  symbol: string;
  price: number;
}

export interface BuySellCryptoDto {
  userId: string;
  walletId: string;
  symbol: string;
  amount: number | string; // Allow both number and string for flexibility
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
  ADAUSDT: 1000,
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
      const userData = this.getUserData();
      const walletId = await this.getWalletId();

      // Get the basic wallet data
      const response = await this.axiosInstance.get(`/wallet/${walletId}`);

      // Get the crypto holdings
      const holdings = await cryptoHoldingsService.getCryptoHoldings(walletId);

      console.log("Raw wallet response:", response.data);
      console.log("Current holdings:", holdings);

      // Ensure the response data has the expected structure
      const walletData: WalletData = {
        walletId: response.data.walletId,
        userId: userData.id,
        holdings: holdings, // Use the holdings from cryptoHoldingsService
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
      const walletId = await this.getWalletId();
      const currentPrice = await this.getPrice(dto.symbol);

      // Process the transaction first
      const requestBody = {
        userId: dto.userId,
        walletId: walletId,
        symbol: dto.symbol,
        amount: dto.amount,
        price: currentPrice,
      };

      await this.axiosInstance.post(`/wallet/${walletId}/buy`, requestBody);

      // Update the holdings with the new transaction
      await cryptoHoldingsService.updateHolding({
        walletId,
        symbol: dto.symbol,
        amount: dto.amount, // Send just the new transaction amount
        transactionType: "BUY",
        price: currentPrice,
      });

      // Invalidate the cache
      this.cachedWalletId = null;
    } catch (error: any) {
      console.error("Buy error details:", error.response?.data);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 401) {
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
          "Invalid buy request. Please check your input parameters."
        );
      }
      throw new Error(
        "Unable to process your trade at this time. Please try again later."
      );
    }
  }

  public async sellCrypto(dto: BuySellCryptoDto): Promise<void> {
    try {
      const walletId = await this.getWalletId();
      const currentPrice = await this.getPrice(dto.symbol);

      // Ensure amount is a valid number and properly formatted
      let numericAmount: number;
      if (typeof dto.amount === 'string') {
        // Remove any non-numeric characters except the first decimal point
        const sanitizedAmount = dto.amount.replace(/[^\d.]/g, '')
          .replace(/(\..*?)\./g, '$1'); // Keep only the first decimal point
        numericAmount = parseFloat(sanitizedAmount);
      } else {
        numericAmount = dto.amount;
      }

      // Validate the parsed amount
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error('Invalid amount: Amount must be a positive number');
      }

      // Format to a fixed number of decimal places based on the trading pair
      const decimals = 8; // You can adjust this based on your needs
      numericAmount = Number(numericAmount.toFixed(decimals));

      // Get current holdings first
      const holdings = await cryptoHoldingsService.getCryptoHoldings(walletId);
      const existingHolding = holdings.find(h => h.symbol === dto.symbol);

      if (!existingHolding) {
        throw new Error(`No holdings found for ${dto.symbol}`);
      }

      // Parse existing holding amount carefully
      const currentAmount = typeof existingHolding.amount === 'string'
        ? parseFloat(existingHolding.amount.replace(/[^\d.]/g, '').replace(/(\..*?)\./g, '$1'))
        : existingHolding.amount;

      if (isNaN(currentAmount)) {
        throw new Error(`Invalid holding amount for ${dto.symbol}`);
      }

      if (currentAmount < numericAmount) {
        throw new Error(`Insufficient balance. You only have ${currentAmount.toFixed(8)} ${dto.symbol}`);
      }

      // Format the request body
      const requestBody = {
        userId: dto.userId,
        walletId: walletId,
        symbol: dto.symbol,
        amount: numericAmount,
        price: currentPrice
      };

      console.log('Sending sell request with body:', requestBody);

      // Send the request to sell crypto
      const response = await this.axiosInstance.post(
        `/wallet/${walletId}/sell`,
        requestBody
      );

      if (response.status === 200 || response.status === 201) {
        // Update holdings
        await cryptoHoldingsService.updateHolding({
          walletId,
          symbol: dto.symbol,
          amount: numericAmount,
          transactionType: "SELL",
          price: currentPrice
        });

        // Invalidate the cache
        this.cachedWalletId = null;
      }

      return response.data;
    } catch (error: any) {
      console.error('Sell request failed:', error);

      if (error.response?.status === 401) {
        this.cachedWalletId = null;
        localStorage.removeItem("token");
        throw new Error("Unauthorized: Please log in again.");
      } else if (error.response?.status === 404) {
        this.cachedWalletId = null;
        throw new Error("Wallet not found. Please ensure you have created a wallet.");
      } else if (error.response?.status === 400) {
        throw new Error(error.response?.data?.message || "Invalid sell request. Please check your input parameters.");
      } else if (error.response?.status === 500) {
        throw new Error("Server error occurred. Please try again.");
      }

      throw new Error(error.message || "Unable to process your trade at this time. Please try again later.");
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
