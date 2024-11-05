import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, History, Wallet, TrendingUp } from "lucide-react";
import axios from "axios";
import GameCard from "./GameCard";
import SlotMachine from "./SlotMachine";
import Roulette from "./Roulette";
import Blackjack from "./Blackjack";
import { cryptoService } from "../services/cryptoService";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

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

const WalletPanel = ({ wallet, stats, onClose, cryptoBalances }) => {
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

const CryptoCasino = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [walletStats, setWalletStats] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [error, setError] = useState(null);
  const [cryptoBalances, setCryptoBalances] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const userIdFromUrl = urlParams.get("userId");

      if (!userIdFromUrl) {
        throw new Error("No user ID provided in URL");
      }

      const response = await axios.get(
        `${API_BASE_URL}/auth/user/${userIdFromUrl}`
      );

      if (!response.data) {
        throw new Error("User not found");
      }

      setUserId(response.data.id);
      return response.data.id;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user data:", err);
      // Redirect to login or home page if there's an error
      navigate("/login");
      return null;
    }
  }, [navigate]);

  const fetchWalletData = useCallback(async (uid) => {
    try {
      // Get wallet using user ID
      const walletResponse = await axios.get(
        `${API_BASE_URL}/wallet/user/${uid}`
      );
      const walletId = walletResponse.data.walletId;

      // Get wallet details
      const detailsResponse = await axios.get(
        `${API_BASE_URL}/wallet/${walletId}`
      );
      const statsResponse = await axios.get(
        `${API_BASE_URL}/wallet/${walletId}/stats`
      );

      setWallet(detailsResponse.data);
      setWalletStats(statsResponse.data);

      // Update crypto balances with current prices
      const balancesWithPrices = await Promise.all(
        detailsResponse.data.holdings.map(async (holding) => {
          // Check if the symbol already ends with USDT
          const symbol = holding.symbol.endsWith("USDT")
            ? holding.symbol
            : `${holding.symbol}USDT`;

          try {
            const price = await cryptoService.getPrice(symbol);
            return {
              ...holding,
              price,
            };
          } catch (error) {
            console.error(`Failed to fetch price for ${symbol}:`, error);
            return {
              ...holding,
              price: 0, // Use a fallback price or the last known price
            };
          }
        })
      );

      setCryptoBalances(balancesWithPrices);
      setError(null);
    } catch (err) {
      setError(err.message);
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

    // Set up crypto price updates
    const unsubscribe = cryptoService.subscribeToPriceUpdates((prices) => {
      if (cryptoBalances.length > 0) {
        const updatedBalances = cryptoBalances.map((balance) => ({
          ...balance,
          price: prices[`${balance.symbol}USDT`] || balance.price,
        }));
        setCryptoBalances(updatedBalances);
      }
    });

    return () => {
      unsubscribe();
      cryptoService.cleanup();
    };
  }, [fetchUserData, fetchWalletData]);

  const updateBalance = async (amount) => {
    try {
      await fetchWalletData(userId);
      if (amount > 0) {
        setRewardAmount(amount);
        setShowReward(true);
      }
    } catch (err) {
      setError(err.message);
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
