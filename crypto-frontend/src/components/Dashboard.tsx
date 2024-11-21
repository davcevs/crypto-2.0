import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import axiosInstance from "@/common/axios-instance";
import { User } from "@/interfaces/UserInterface";
import {
  ApiError,
  CryptoHoldingsResponse,
} from "@/interfaces/WalletInterfaces";

import { PortfolioCards } from "./PortfolioCards";
import { PriceChart } from "./PriceChart";
import { RecentTransactions } from "./RecentTransactions";
import { DashboardState } from "types/dashboard.types";
import { AssetsTable } from "./AssetTable";
import { TransferCryptoModal } from "./TransferCrypto";

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [state, setState] = useState<DashboardState>({
    user,
    wallet: null,
    holdings: [],
    transactions: [],
    walletStats: null,
    marketData: {},
    historicalData: {},
    isLoading: true,
    error: "",
  });

  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!user?.walletId) return;

    try {
      if (!state.wallet) {
        setState((prev) => ({ ...prev, isLoading: true }));
      }
      setState((prev) => ({ ...prev, error: "" }));

      const [walletRes, statsRes, holdingsRes, transactionsRes] =
        await Promise.all([
          axiosInstance.get(`/wallet/user/${user.walletId}`),
          axiosInstance.get(`/wallet/${user.walletId}/stats`),
          axiosInstance.get<CryptoHoldingsResponse>(
            `/crypto-holdings/${user.walletId}/holdings`
          ),
          axiosInstance.get(`/transactions/wallet/${user.walletId}`),
        ]);

      const marketPromises = holdingsRes.data.holdings.map(async (holding) => {
        const [price24h, historical] = await Promise.all([
          axiosInstance.get(`/crypto/24hr/${holding.symbol}`),
          axiosInstance.get(`/crypto/historical/${holding.symbol}`),
        ]);

        return {
          symbol: holding.symbol,
          marketData: price24h.data,
          historical: historical.data,
        };
      });

      const marketResults = await Promise.all(marketPromises);

      const marketDataObj = {};
      const historicalObj = {};

      marketResults.forEach((result) => {
        marketDataObj[result.symbol] = result.marketData;
        historicalObj[result.symbol] = result.historical;
      });

      setState((prev) => ({
        ...prev,
        wallet: walletRes.data,
        walletStats: statsRes.data,
        holdings: holdingsRes.data.holdings,
        transactions: transactionsRes.data,
        marketData: marketDataObj,
        historicalData: historicalObj,
        isLoading: false,
      }));

      if (!selectedCrypto && holdingsRes.data.holdings.length > 0) {
        setSelectedCrypto(holdingsRes.data.holdings[0].symbol);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        error: apiError.response?.message || "Failed to fetch data",
        isLoading: false,
      }));
    }
  }, [user?.walletId, state.wallet, selectedCrypto]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoRefresh) {
      intervalId = setInterval(fetchAllData, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchAllData, isAutoRefresh]);

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center space-x-2">
        <RefreshCw className="w-6 h-6 animate-spin text-yellow-500" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2329] text-white p-8 space-y-10">
      {state.error && (
        <Alert variant="destructive" className="mb-6 bg-red-800 text-red-200">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <PortfolioCards
        wallet={state.wallet}
        walletStats={state.walletStats}
        transactions={state.transactions}
      />

      <TransferCryptoModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        user={user}
        holdings={state.holdings}
        onTransferSuccess={fetchAllData}
      />

      <AssetsTable
        user={user}
        holdings={state.holdings}
        marketData={state.marketData}
        fetchAllData={fetchAllData}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-[85%] mx-auto">
        <PriceChart
          historicalData={state.historicalData}
          selectedCrypto={selectedCrypto}
        />

        <RecentTransactions transactions={state.transactions} />
      </div>
    </div>
  );
};

export default Dashboard;
