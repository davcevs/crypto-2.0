import { useState, useCallback } from "react";
import {
  Transaction,
  TransactionStats,
  CreateTransactionDto,
} from "../../types/transaction.types";
import { transactionService } from "../services/transactionService";
import { useToast } from "../hooks/useToast";

export const useTransactions = (walletId: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await transactionService.getWalletTransactions(walletId);
      setTransactions(data);
    } catch (err) {
      setError("Failed to fetch transactions");
      showToast("error", "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, [walletId]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await transactionService.getTransactionStats(walletId);
      setStats(data);
    } catch (err) {
      showToast("error", "Failed to fetch transaction stats");
    }
  }, [walletId]);

  const createTransaction = async (
    data: Omit<CreateTransactionDto, "walletId">
  ) => {
    try {
      setLoading(true);
      await transactionService.createTransaction({
        ...data,
        walletId,
      });
      showToast("success", "Transaction created successfully");
      await fetchTransactions();
      await fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create transaction");
      showToast(
        "error",
        err.response?.data?.message || "Failed to create transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    transactions,
    stats,
    loading,
    error,
    fetchTransactions,
    fetchStats,
    createTransaction,
  };
};
