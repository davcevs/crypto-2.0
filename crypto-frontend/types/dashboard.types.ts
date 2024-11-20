import { User } from "../src/interfaces/UserInterface";
import {
  CryptoHolding,
  WalletData,
  WalletStats
} from "../src/interfaces/WalletInterfaces";
import { Transaction } from "./transaction.types";

export interface MarketData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

export interface DashboardState {
  user: User;
  wallet: WalletData | null;
  holdings: CryptoHolding[];
  transactions: Transaction[];
  walletStats: WalletStats | null;
  marketData: Record<string, MarketData>;
  historicalData: Record<string, HistoricalDataPoint[]>;
  isLoading: boolean;
  error: string;
}