// SlotMachine.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const symbols = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣", "🍀"];

interface SlotMachineProps {
  updateBalance: (amount: number) => void;
  balance: number;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  updateBalance,
  balance,
}) => {
  const [reels, setReels] = useState<string[][]>([
    ["❓", "❓", "❓"],
    ["❓", "❓", "❓"],
    ["❓", "❓", "❓"],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [bet, setBet] = useState(10);

  const spin = () => {
    if (balance < bet) return;

    setSpinning(true);
    updateBalance(-bet);
    setMessage("");

    const newReels = reels.map(() =>
      Array(3)
        .fill(null)
        .map(() => symbols[Math.floor(Math.random() * symbols.length)])
    );

    const spinDuration = 1000;
    const intervalDuration = spinDuration / 10;

    let currentSpin = 0;
    const spinInterval = setInterval(() => {
      setReels((prevReels) =>
        prevReels.map((reel, i) => {
          const newReel = [...reel];
          newReel[currentSpin % 3] = newReels[i][currentSpin % 3];
          return newReel;
        })
      );
      currentSpin++;
      if (currentSpin >= 30) {
        clearInterval(spinInterval);
        setSpinning(false);
        checkWin(newReels);
      }
    }, intervalDuration);
  };

  const checkWin = (newReels: string[][]) => {
    let winAmount = 0;

    for (let i = 0; i < 3; i++) {
      if (
        newReels[0][i] === newReels[1][i] &&
        newReels[1][i] === newReels[2][i]
      ) {
        winAmount += (symbols.indexOf(newReels[0][i]) + 1) * bet;
      }
    }

    if (
      newReels[0][0] === newReels[1][1] &&
      newReels[1][1] === newReels[2][2]
    ) {
      winAmount += (symbols.indexOf(newReels[0][0]) + 1) * bet;
    }
    if (
      newReels[0][2] === newReels[1][1] &&
      newReels[1][1] === newReels[2][0]
    ) {
      winAmount += (symbols.indexOf(newReels[0][2]) + 1) * bet;
    }

    if (winAmount > 0) {
      updateBalance(winAmount);
      setMessage(`You won $${winAmount}!`);
    } else {
      setMessage("Try again!");
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg p-8 max-w-md mx-auto text-center">
      <h2 className="text-3xl font-bold text-white mb-6">Slots of Fortune</h2>
      <div className="flex justify-center mb-6">
        {reels.map((reel, reelIndex) => (
          <div key={reelIndex} className="mx-2">
            {reel.map((symbol, symbolIndex) => (
              <motion.div
                key={symbolIndex}
                className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-4xl shadow-lg mb-2"
                animate={{ rotateX: spinning ? 360 : 0 }}
                transition={{ duration: 0.5, repeat: spinning ? Infinity : 0 }}
              >
                {symbol}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div className="mb-4">
        <label className="text-white mr-2">Bet:</label>
        <input
          type="number"
          value={bet}
          onChange={(e) => setBet(Math.max(1, parseInt(e.target.value)))}
          className="w-20 px-2 py-1 text-black rounded-lg"
        />
      </div>
      <button
        onClick={spin}
        disabled={spinning || balance < bet}
        className={`w-full py-3 rounded-lg text-xl font-semibold transition duration-300 ${
          spinning || balance < bet
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-white text-yellow-600 hover:bg-gray-100"
        }`}
      >
        {spinning ? "Spinning..." : `Spin ($${bet})`}
      </button>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-white text-xl font-bold"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default SlotMachine;
