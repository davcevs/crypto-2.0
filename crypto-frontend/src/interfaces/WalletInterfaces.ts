// Types for wallet data

export interface Transaction {
  id: string;
  type: "BUY" | "SELL";
  amount: number;
  symbol: string;
  price: number;
  timestamp: string;
}

export interface Holding {
  symbol: string;
  amount: number;
  currentPrice?: number;
  totalValue?: number;
}

// export interface WalletData {
//   walletId: string;
//   cashBalance: number;
//   holdings: Holding[];
//   transactions: Transaction[];
// }

export interface WalletBalance {
  symbol: string;
  free: number;
  locked: number;
}

export interface WalletData {
  walletId: string;
  userId: string;
  cashBalance: number;
  holdings: Holding[];
  balances: WalletBalance[];
}

export interface WalletStats {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
}
