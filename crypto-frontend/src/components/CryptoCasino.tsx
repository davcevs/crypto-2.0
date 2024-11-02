import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle2, History, Wallet, TrendingUp } from "lucide-react";
import {
  getWallet,
  getWalletStats,
  updateWallet,
  WalletData,
  WalletStats,
} from "../services/walletService";
import GameCard from "./GameCard";
import SlotMachine from "./SlotMachine";
import Roulette from "./Roulette";
import Blackjack from "./Blackjack";

// Define the available games
const games = [
  {
    title: "Slots of Fortune",
    imageSrc: "/api/placeholder/400/320",
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

const WalletPanel = ({ wallet, stats, onClose }) => {
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

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">Holdings</h3>
          <div className="space-y-2">
            {wallet.holdings.map((holding) => (
              <div key={holding.symbol} className="flex justify-between">
                <span className="text-gray-400">{holding.symbol}</span>
                <span className="text-white">{holding.amount}</span>
              </div>
            ))}
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

  const fetchWalletData = async () => {
    try {
      const walletData = await getWallet();
      const stats = await getWalletStats();
      setWallet(walletData);
      setWalletStats(stats);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const updateBalance = async (amount) => {
    try {
      await updateWallet();
      await fetchWalletData();
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
              Balance:{" "}
              <span className="text-green-400 font-bold">
                ${wallet.cashBalance}
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
              balance: wallet?.cashBalance || 0,
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
