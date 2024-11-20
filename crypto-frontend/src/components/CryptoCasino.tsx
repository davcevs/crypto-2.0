import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, History, Wallet } from "lucide-react";
import GameCard from "./GameCard";
import SlotMachine from "./SlotMachine";
import Roulette from "./Roulette";
import Blackjack from "./Blackjack";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../common/axios-instance";
import {
  WalletData,
  WalletStats,
  CryptoHolding,
  ApiError,
  CryptoHoldingsResponse,
} from "@/interfaces/WalletInterfaces";
import { User } from "@/interfaces/UserInterface";

interface WalletPanelProps {
  wallet: WalletData;
  stats: WalletStats;
  onClose: () => void;
  cryptoBalances: CryptoHolding[];
}

// Define the available games
const games = [
  {
    title: "Slots of Fortune",
    imageSrc: "../src/assets/1.png.webp",
    category: "Slots",
    bgColor: "bg-gradient-to-br from-yellow-400 to-red-500",
    component: SlotMachine,
  },
  {
    title: "Roulette Royale",
    imageSrc: "/api/placeholder/400/320",
    category: "Table Games",
    bgColor: "bg-gradient-to-br from-green-600 to-blue-600",
    component: Roulette,
  },
  {
    title: "Blackjack Pro",
    imageSrc: "/api/placeholder/400/320",
    category: "Card Games",
    bgColor: "bg-gradient-to-br from-purple-600 to-pink-600",
    component: Blackjack,
  },
];

const WalletPanel: React.FC<WalletPanelProps> = ({
  wallet,
  stats,
  onClose,
  cryptoBalances,
}) => {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-0 h-full w-80 bg-gray-900 p-6 shadow-2xl overflow-y-auto"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        ×
      </button>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">Wallet Balance</h3>
          <p className="text-2xl text-green-400">${wallet.cashBalance}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">Crypto Holdings</h3>
          <div className="space-y-2">
            {cryptoBalances.map((holding) => (
              <div
                key={holding.symbol}
                className="flex justify-between items-center"
              >
                <span className="text-gray-400">{holding.symbol}</span>
                <div className="text-right">
                  <div className="text-white">{holding.amount}</div>
                  <div className="text-sm text-gray-400">
                    ${(holding.amount * holding.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">Statistics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Value:</span>
              <span className="text-white">${stats.totalValue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Daily Change:</span>
              <span
                className={
                  stats.dailyChange >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                ${stats.dailyChange} ({stats.dailyChangePercentage}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CryptoCasino: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<(typeof games)[0] | null>(
    null
  );
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cryptoBalances, setCryptoBalances] = useState<CryptoHolding[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async (): Promise<string | null> => {
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
      return response.data.id;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.message || "An error occurred");
      console.error("Error fetching user data:", err);
      navigate("/login");
      return null;
    }
  }, [navigate]);

  const fetchCryptoPrice = async (symbol: string): Promise<number> => {
    try {
      const response = await axiosInstance.get<{ price: number }>(
        `/crypto/price/${symbol}`
      );
      return response.data.price;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return 0;
    }
  };

  const fetchWalletData = useCallback(async (walletId: string) => {
    try {
      // Get wallet details using wallet ID
      const walletResponse = await axiosInstance.get<{ walletId: string }>(
        `/wallet/user/${walletId}`
      );
      const wallet = walletResponse.data;

      // Get wallet details
      const [detailsResponse, statsResponse, holdingsResponse] =
        await Promise.all([
          axiosInstance.get<WalletData>(`/wallet/${wallet.walletId}`),
          axiosInstance.get<WalletStats>(`/wallet/${wallet.walletId}/stats`),
          axiosInstance.get<CryptoHoldingsResponse>(
            `/crypto-holdings/${wallet.walletId}/holdings`
          ),
        ]);

      setWallet(detailsResponse.data);
      setWalletStats(statsResponse.data);

      // Update crypto balances with current prices
      const balancesWithPrices = await Promise.all(
        holdingsResponse.data.holdings.map(async (holding) => {
          const symbol = holding.symbol.endsWith("USDT")
            ? holding.symbol
            : `${holding.symbol}USDT`;

          const price = await fetchCryptoPrice(symbol);
          return {
            ...holding,
            currentPrice: price,
            totalValue: holding.amount * price,
          };
        })
      );

      setCryptoBalances(balancesWithPrices);
      setError(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.message || "An error occurred");
      console.error("Error fetching wallet data:", err);
    }
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      const uid = await fetchUserData();
      if (uid) {
        await fetchWalletData(uid);
      }
    };

    initializeData();

    // Set up periodic price updates
    const priceUpdateInterval = setInterval(async () => {
      if (cryptoBalances.length > 0) {
        const updatedBalances = await Promise.all(
          cryptoBalances.map(async (balance) => {
            const symbol = balance.symbol.endsWith("USDT")
              ? balance.symbol
              : `${balance.symbol}USDT`;
            const price = await fetchCryptoPrice(symbol);
            return {
              ...balance,
              currentPrice: price,
              totalValue: balance.amount * price,
            };
          })
        );
        setCryptoBalances(updatedBalances);
      }
    }, 30000);

    return () => {
      clearInterval(priceUpdateInterval);
    };
  }, [fetchUserData, fetchWalletData]);

  const updateBalance = async (amount: number) => {
    try {
      if (userId) {
        await fetchWalletData(userId);
        if (amount > 0) {
          setRewardAmount(amount);
          setShowReward(true);
        }
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.message || "An error occurred");
    }
  };

  useEffect(() => {
    if (showReward) {
      const timer = setTimeout(() => setShowReward(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showReward]);

  const getTotalBalance = () => {
    if (!wallet || !cryptoBalances.length) {
      return Number(wallet?.cashBalance || 0).toFixed(2);
    }

    const cryptoValue = cryptoBalances.reduce(
      (total, holding) =>
        total + Number(holding.amount) * Number(holding.price),
      0
    );

    return (Number(wallet.cashBalance) + cryptoValue).toFixed(2);
  };

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
              cryptoBalances,
              userId,
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
              cryptoBalances={cryptoBalances}
              onClose={() => setShowWallet(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CryptoCasino;
