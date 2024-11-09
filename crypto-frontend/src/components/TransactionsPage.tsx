import React, { useEffect, useState } from "react";
import { useTransactions } from "../hooks/useTransactions";
import { TransactionForm } from "../components/TransactionForm";
import { TransactionList } from "../components/TransactionList";
import { TransactionStats } from "../components/TransactionStats";
import { getWallet } from "../services/walletService";
import { useToast } from "../hooks/useToast";
import { WalletData } from "@/interfaces/WalletInterfaces";

export const TransactionsPage = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setIsLoading(true);
        const walletData = await getWallet();
        setWallet(walletData);
      } catch (error: any) {
        showToast("error", error.message || "Failed to fetch wallet data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWalletData();
  }, []);

  const {
    transactions,
    stats,
    loading: transactionsLoading,
    createTransaction,
    fetchTransactions,
    fetchStats,
  } = useTransactions(wallet?.walletId || "");

  useEffect(() => {
    if (wallet?.walletId) {
      fetchTransactions();
      fetchStats();
    }
  }, [wallet?.walletId, fetchTransactions, fetchStats]);

  if (isLoading || !wallet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-gray-600">
          Available Balance: ${Number(wallet.balance).toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">New Transaction</h2>
          <TransactionForm
            onSubmit={createTransaction}
            isLoading={transactionsLoading}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Statistics</h2>
          <TransactionStats stats={stats} isLoading={transactionsLoading} />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <TransactionList
          transactions={transactions}
          isLoading={transactionsLoading}
        />
      </div>
    </div>
  );
};
