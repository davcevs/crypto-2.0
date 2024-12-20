// Types for wallet data
// WalletInterfaces.ts
export interface Holding {
  symbol: string;
  amount: number;
  currentPrice?: number;
  totalValue?: number;
}

// Extended version for the full crypto holding data from backend
export interface CryptoHolding extends Holding {
  id: string;
  averageBuyPrice: number;
  walletId?: string;
}
export interface WalletBalance {
  symbol: string;
  free: number;
  locked: number;
}
export interface TradePayload {
  userId: string;
  walletId: string;
  symbol: string;
  amount: number;
  type: 'BUY' | 'SELL';
  price: number;
}

export interface WalletData {
  id: string;
  balance: number;
  cashBalance: number;
  holdings: {
    symbol: string;
    amount: number;
    currentPrice?: number;
  }[];
  transactions: {
    id: string;
    type: string;
    symbol: string;
    amount: number;
    price: number;
    timestamp: string;
  }[];
}

export interface TradePayload {
  userId: string;
  walletId: string;
  symbol: string;
  amount: number;
  type: 'BUY' | 'SELL';
  price: number;
}

export interface WalletStats {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
}

export interface CryptoHoldingsResponse {
  holdings: CryptoHolding[];
  success: boolean;
  message?: string;
}

export interface ApiError {
  response?: {
    status: number;
    data?: {
      message: string;
    };
  };
  message?: string;
}