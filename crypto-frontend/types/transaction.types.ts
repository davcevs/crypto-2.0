export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  createdAt: Date;
}

export interface TransactionStats {
  totalBought: number;
  totalSold: number;
  tradingVolume: number;
  transactions: number;
}

export interface CreateTransactionDto {
  walletId: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  amount: number;
  price: number;
}