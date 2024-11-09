// Types for wallet data
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
  message: string;
  statusCode: number;
}
