import api from "./api";
import {
  Transaction,
  TransactionStats,
  CreateTransactionDto,
} from "../../types/transaction.types";
import CryptoHoldingsService from "./cryptoHoldingsService";

const holdingsService = new CryptoHoldingsService();

export const transactionService = {
  createTransaction: async (
    data: CreateTransactionDto
  ): Promise<Transaction> => {
    // First create the transaction
    const response = await api.post("/transactions", data);

    // Then update the holdings
    await holdingsService.updateHolding({
      walletId: data.walletId,
      symbol: data.symbol,
      amount: data.amount,
      transactionType: data.type,
    });

    return response.data;
  },

  getWalletTransactions: async (walletId: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/wallet/${walletId}`);
    return response.data;
  },

  getTransactionStats: async (walletId: string): Promise<TransactionStats> => {
    const response = await api.get(`/transactions/stats/${walletId}`);
    return response.data;
  },
};
