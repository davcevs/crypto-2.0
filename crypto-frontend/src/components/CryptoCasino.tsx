import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import GameCard from "./GameCard";
import SlotMachine from "./SlotMachine";
import Roulette from "./Roulette";
import Blackjack from "./Blackjack";
import { motion, AnimatePresence } from "framer-motion";

const CryptoCasino = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [balance, setBalance] = useState(1000);
  const [showReward, setShowReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const games = [
    {
      title: "Slots of Fortune",
      imageSrc: "./src/assets/imgs/1.png.webp",
      category: "Slots",
      bgColor: "from-yellow-400 to-red-500",
      component: SlotMachine,
    },
    {
      title: "Roulette Royale",
      imageSrc: "./src/assets/imgs/3.png.webp",
      category: "Table Games",
      bgColor: "from-green-400 to-blue-500",
      component: Roulette,
    },
    {
      title: "Blackjack Pro",
      imageSrc: "./src/assets/imgs/4.png.webp",
      category: "Table Games",
      bgColor: "from-purple-400 to-pink-500",
      component: Blackjack,
    },
  ];

  const updateBalance = (amount: number) => {
    setBalance((prev) => prev + amount);
    if (amount > 0) {
      setRewardAmount(amount);
      setShowReward(true);
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
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-6 relative">
        <header className="mb-8 bg-black bg-opacity-50 p-4 rounded-lg shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-2">
            Crypto Casino Royale
          </h1>
          <p className="text-gray-300 text-lg">
            Your balance:{" "}
            <span className="text-green-400 font-bold">${balance}</span>
          </p>
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

        {selectedGame ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700"
          >
            <button
              onClick={() => setSelectedGame(null)}
              className="mb-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              ← Back to Games
            </button>
            {React.createElement(
              games.find((game) => game.title === selectedGame)?.component ||
                (() => null),
              {
                updateBalance,
                balance,
              }
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {games.map((game) => (
              <GameCard
                key={game.title}
                title={game.title}
                imageSrc={game.imageSrc}
                category={game.category}
                bgColor={`bg-gradient-to-br ${game.bgColor}`}
                onClick={() => setSelectedGame(game.title)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoCasino;
