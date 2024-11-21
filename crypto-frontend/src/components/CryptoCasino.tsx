import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../common/axios-instance";
import { games } from "./Games";
import GameCard from "../components/GameCard";
import WalletPanel from "./CasinoWalletPanel";

import {
  WalletData,
  WalletStats,
  ApiError,
  TradePayload,
  CryptoHolding,
} from "../interfaces/WalletInterfaces";
import { User } from "../interfaces/UserInterface";

const CryptoCasino = () => {
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletId, setWalletId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch current crypto price
  const fetchCryptoPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await axiosInstance.get<{ price: number }>(
        `/crypto/price/${symbol}`
      );
      return response.data.price || 0;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return 0;
    }
  };

  const fetchUserData = useCallback(async (): Promise<User | null> => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userIdFromUrl = urlParams.get("userId");

      if (!userIdFromUrl) {
        throw new Error("No user ID provided in URL");
      }

      const response = await axiosInstance.get<User>(
        `/auth/user/${userIdFromUrl}`
      );

      if (!response.data) {
        throw new Error("User not found");
      }

      setUserId(response.data.id);
      setWalletId(response.data.walletId);
      return response.data;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.message || "An error occurred");
      console.error("Error fetching user data:", err);
      navigate("/login");
      return null;
    }
  }, [navigate]);

  // Fetch wallet data with more comprehensive details
  const fetchWalletData = useCallback(async (walletId: string) => {
    try {
      const [walletResponse, statsResponse] = await Promise.all([
        axiosInstance.get<WalletData>(`/wallet/${walletId}`),
        axiosInstance.get<WalletStats>(`/wallet/${walletId}/stats`),
      ]);

      // Safely process wallet holdings
      const safeHoldings = (walletResponse.data.holdings || []).map(
        (holding: any) => ({
          ...holding,
          currentPrice: 1, // Default price
          amount: holding.amount || 0,
        })
      );

      const updatedHoldings = await Promise.all(
        safeHoldings.map(async (holding: CryptoHolding) => {
          const symbol = holding.symbol.endsWith("USDT")
            ? holding.symbol
            : `${holding.symbol}USDT`;

          const currentPrice = await fetchCryptoPrice(symbol);
          return {
            ...holding,
            currentPrice: currentPrice || 1,
          };
        })
      );

      // Explicitly parse cash balance
      const cashBalance = parseFloat(
        String(walletResponse.data.cashBalance || 0)
      );

      // Create updated wallet object that matches WalletData interface
      const updatedWallet: WalletData = {
        id: walletResponse.data.id,
        balance: cashBalance,
        cashBalance: cashBalance,
        holdings: updatedHoldings,
        transactions: walletResponse.data.transactions || [],
      };

      setWallet(updatedWallet);
      setWalletStats(statsResponse.data);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || "Error fetching wallet");
      console.error("Wallet fetch error:", err);
    }
  }, []);

  // Update balance after game
  const updateBalance = async (amount: number) => {
    try {
      if (userId && walletId) {
        if (amount > 0) {
          // Winnings logic
          const winningsPayload = { userId, walletId, amount };
          const winningsResponse = await axiosInstance.patch(
            "wallet/cash-balance/win",
            winningsPayload
          );

          // Parse the new balance as a number
          const newBalance = parseFloat(winningsResponse.data.cashBalance);

          // Update wallet state immediately
          setWallet((prevWallet) => ({
            ...prevWallet!,
            balance: newBalance,
            cashBalance: newBalance,
          }));

          setRewardAmount(amount);
          setShowReward(true);

          // Fetch updated wallet data after state update
          await fetchWalletData(walletId);

          return true;
        } else {
          const absoluteAmount = Math.abs(amount);
          const withdrawalPayload = {
            userId,
            walletId,
            amount: absoluteAmount,
            type: "WITHDRAWAL",
          };

          const withdrawalResponse = await axiosInstance.post(
            "wallet/cash-balance/update",
            withdrawalPayload
          );

          // Update wallet state immediately
          const newBalance = withdrawalResponse.data.cashBalance;
          setWallet((prevWallet) => ({
            ...prevWallet!,
            balance: newBalance,
            cashBalance: newBalance,
          }));

          // Fetch updated wallet data after state update
          await fetchWalletData(walletId);

          return true;
        }
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Transaction Error:", apiError.response?.data);
      setError(apiError.response?.data?.message || "Transaction failed");
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const user = await fetchUserData();
      if (user?.walletId) {
        await fetchWalletData(user.walletId);
      }
    };

    initializeData();

    const walletUpdateInterval = setInterval(async () => {
      if (walletId) {
        await fetchWalletData(walletId);
      }
    }, 30000);

    return () => {
      clearInterval(walletUpdateInterval);
    };
  }, [fetchUserData, fetchWalletData, walletId]);

  // Calculate total balance including crypto
  const getTotalBalance = () => {
    if (!wallet) return "0.00";

    // Safely calculate crypto value with error handling
    const cryptoValue = (wallet.holdings || []).reduce((total, holding) => {
      const value = Number(holding.amount) * Number(holding.currentPrice || 0);
      return isNaN(value) ? total : total + value;
    }, 0);

    const baseBalance = Number(wallet.cashBalance || 0);
    return (baseBalance + cryptoValue).toFixed(2);
  };

  // Reward popup timer
  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  return (
    <div className="flex overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-black min-h-screen">
      <div className="flex-1 overflow-y-auto p-6 relative">
        <header className="mb-8 bg-black bg-opacity-50 p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500">
              Crypto Casino Royale
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWallet(!showWallet)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-lg text-white flex items-center space-x-2"
            >
              <Wallet className="w-5 h-5" />
              <span>Wallet</span>
            </motion.button>
          </div>
          {wallet && (
            <p className="text-gray-300 text-lg mt-2">
              Total Balance:{" "}
              <span className="text-green-400 font-bold">
                ${getTotalBalance()}
              </span>
            </p>
          )}
        </header>

        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg"
            >
              You won ${rewardAmount}!
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500 text-white p-4 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {selectedGame ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
          >
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300"
            >
              ← Back to Games
            </button>
            {React.createElement(selectedGame.component, {
              updateBalance,
              balance: getTotalBalance(),
              cryptoBalances: wallet?.holdings || [],
              userId,
              walletId,
            })}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {games.map((game) => (
              <GameCard
                key={game.title}
                {...game}
                onClick={() => setSelectedGame(game)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {showWallet && wallet && walletStats && (
            <WalletPanel
              wallet={wallet}
              stats={walletStats}
              onClose={() => setShowWallet(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CryptoCasino;
