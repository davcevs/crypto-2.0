// Blackjack.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface BlackjackProps {
  updateBalance: (amount: number) => void;
  balance: number;
}

const Blackjack: React.FC<BlackjackProps> = ({ updateBalance, balance }) => {
  const [playerHand, setPlayerHand] = useState<number[]>([]);
  const [dealerHand, setDealerHand] = useState<number[]>([]);
  const [bet, setBet] = useState(10);
  const [gameState, setGameState] = useState<
    "betting" | "playing" | "finished"
  >("betting");
  const [result, setResult] = useState<string | null>(null);

  const drawCard = () => Math.min(10, Math.floor(Math.random() * 13) + 1);

  const calculateHandValue = (hand: number[]) =>
    hand.reduce((sum, card) => sum + card, 0);

  const startGame = () => {
    if (balance < bet) return;

    updateBalance(-bet);
    setPlayerHand([drawCard(), drawCard()]);
    setDealerHand([drawCard()]);
    setGameState("playing");
    setResult(null);
  };

  const hit = () => {
    setPlayerHand((prev) => [...prev, drawCard()]);
  };

  const stand = () => {
    let newDealerHand = [...dealerHand];
    while (calculateHandValue(newDealerHand) < 17) {
      newDealerHand.push(drawCard());
    }
    setDealerHand(newDealerHand);
    setGameState("finished");
  };

  useEffect(() => {
    if (gameState === "playing") {
      const playerValue = calculateHandValue(playerHand);
      if (playerValue > 21) {
        setGameState("finished");
        setResult("Player busts! Dealer wins.");
      } else if (playerValue === 21) {
        stand();
      }
    } else if (gameState === "finished") {
      const playerValue = calculateHandValue(playerHand);
      const dealerValue = calculateHandValue(dealerHand);

      if (playerValue > 21) {
        setResult("Player busts! Dealer wins.");
      } else if (dealerValue > 21) {
        const winAmount = bet * 2;
        setResult(`Dealer busts! Player wins $${winAmount}!`);
        updateBalance(winAmount);
      } else if (playerValue > dealerValue) {
        const winAmount = bet * 2;
        setResult(`Player wins $${winAmount}!`);
        updateBalance(winAmount);
      } else if (dealerValue > playerValue) {
        setResult("Dealer wins!");
      } else {
        setResult("It's a tie! Bet returned.");
        updateBalance(bet);
      }
    }
  }, [playerHand, dealerHand, gameState]);

  return (
    <div className="text-white bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Blackjack Pro</h2>
      {gameState === "betting" ? (
        <div className="flex items-center mb-4">
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(1, parseInt(e.target.value)))}
            className="w-24 px-2 py-1 text-black rounded-l-lg"
          />
          <motion.button
            onClick={startGame}
            disabled={balance < bet}
            className={`px-4 py-2 rounded-r-lg font-semibold ${
              balance < bet
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-yellow-400 text-black hover:bg-yellow-500"
            } transition duration-300`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Game
          </motion.button>
        </div>
      ) : (
        <>
          <div className="mb-4 bg-purple-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold">Player's Hand:</h3>
            <motion.div
              className="flex mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {playerHand.map((card, index) => (
                <motion.div
                  key={index}
                  className="w-12 h-16 bg-white text-black rounded-lg flex items-center justify-center mr-2"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {card}
                </motion.div>
              ))}
            </motion.div>
            <p>Total: {calculateHandValue(playerHand)}</p>
          </div>
          <div className="mb-4 bg-purple-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold">Dealer's Hand:</h3>
            <motion.div
              className="flex mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {dealerHand.map((card, index) => (
                <motion.div
                  key={index}
                  className="w-12 h-16 bg-white text-black rounded-lg flex items-center justify-center mr-2"
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {card}
                </motion.div>
              ))}
            </motion.div>
            <p>Total: {calculateHandValue(dealerHand)}</p>
          </div>
          {gameState === "playing" && (
            <div className="flex space-x-4">
              <motion.button
                onClick={hit}
                className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hit
              </motion.button>
              <motion.button
                onClick={stand}
                className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Stand
              </motion.button>
            </div>
          )}
          {result && (
            <motion.p
              className="text-2xl font-bold mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {result}
            </motion.p>
          )}
          {gameState === "finished" && (
            <motion.button
              onClick={() => setGameState("betting")}
              className="mt-4 px-4 py-2 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              New Game
            </motion.button>
          )}
        </>
      )}
    </div>
  );
};

export default Blackjack;
