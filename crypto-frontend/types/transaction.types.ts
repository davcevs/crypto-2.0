// transaction.types.ts
export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  symbol: string;
  amount: number;
  price: number;
  total: number;
  createdAt: Date;
  description?: string;
  toWallet?: string;
}

export interface TransactionStats {
  totalBought: number;
  totalSold: number;
  tradingVolume: number;
  transactions: number;
}

export interface CreateTransactionDto {
  walletId: string;
  type: 'BUY' | 'SELL' | 'TRANSFER' | 'WIN' | 'LOSS';
  symbol: string;
  amount: number;
  price: number;
}