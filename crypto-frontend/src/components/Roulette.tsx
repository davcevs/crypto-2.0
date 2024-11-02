// Roulette.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";

interface RouletteProps {
  updateBalance: (amount: number) => void;
  balance: number;
}

const Roulette: React.FC<RouletteProps> = ({ updateBalance, balance }) => {
  const [bet, setBet] = useState(10);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [result, setResult] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");

  const spin = () => {
    if (balance < bet || selectedNumber === null) return;

    setSpinning(true);
    updateBalance(-bet);
    setMessage("");

    setTimeout(() => {
      const spinResult = Math.floor(Math.random() * 37);
      setResult(spinResult);
      setSpinning(false);

      if (spinResult === selectedNumber) {
        const winAmount = bet * 35;
        updateBalance(winAmount);
        setMessage(`You won $${winAmount}!`);
      } else {
        setMessage("Better luck next time!");
      }
    }, 5000);
  };

  return (
    <div className="text-white bg-gradient-to-br from-green-600 to-blue-600 rounded-lg p-8">
      <h2 className="text-3xl font-bold mb-6">Roulette Royale</h2>
      <div className="flex justify-center mb-6">
        <motion.div
          className="w-64 h-64 rounded-full bg-green-800 flex items-center justify-center"
          animate={{ rotate: spinning ? 1800 : 0 }}
          transition={{ duration: 5, ease: "easeInOut" }}
        >
          {result !== null ? (
            <span className="text-4xl font-bold">{result}</span>
          ) : (
            <span className="text-4xl">?</span>
          )}
        </motion.div>
      </div>
      <div className="flex flex-wrap justify-center mb-6">
        {Array.from({ length: 37 }, (_, i) => (
          <motion.button
            key={i}
            onClick={() => setSelectedNumber(i)}
            className={`w-10 h-10 m-1 rounded-full ${
              selectedNumber === i
                ? "bg-yellow-400 text-black"
                : "bg-green-500 hover:bg-green-400"
            } transition duration-300`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {i}
          </motion.button>
        ))}
      </div>
      <div className="flex justify-center items-center mb-6">
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(1, parseInt(e.target.value)))}
          className="w-24 px-2 py-1 text-black rounded-l-lg"
        />
        <motion.button
          onClick={spin}
          disabled={spinning || balance < bet || selectedNumber === null}
          className={`px-4 py-2 rounded-r-lg font-semibold ${
            spinning || balance < bet || selectedNumber === null
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-yellow-400 text-black hover:bg-yellow-500"
          } transition duration-300`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {spinning ? "Spinning..." : "Spin"}
        </motion.button>
      </div>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default Roulette;
