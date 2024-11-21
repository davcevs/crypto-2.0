// src/components/WalletPanel.tsx
import React from "react";
import { motion } from "framer-motion";
import { WalletData, WalletStats } from "@/interfaces/WalletInterfaces";

interface WalletPanelProps {
  wallet: WalletData;
  stats: WalletStats;
  onClose: () => void;
}

const CasinoWalletPanel: React.FC<WalletPanelProps> = ({
  wallet,
  stats,
  onClose,
}) => {
  // Helper function to safely format numbers
  const formatNumber = (value: number | undefined): string => {
    return (value ?? 0).toFixed(2);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-0 h-full w-80 bg-gray-900 p-6 shadow-2xl overflow-y-auto mt-10"
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
          <p className="text-2xl text-green-400">${wallet.cashBalance ?? 0}</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-xl font-bold text-white mb-2">Crypto Holdings</h3>
          <div className="space-y-2">
            {wallet.holdings.map((holding) => (
              <div
                key={holding.symbol}
                className="flex justify-between items-center"
              >
                <span className="text-gray-400">{holding.symbol}</span>
                <div className="text-right">
                  <div className="text-white">{holding.amount ?? 0}</div>
                  <div className="text-sm text-gray-400">
                    $
                    {formatNumber(
                      (holding.amount ?? 0) * (holding.currentPrice ?? 0)
                    )}
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
              <span className="text-white">
                ${formatNumber(stats.totalValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Daily Change:</span>
              <span
                className={
                  (stats.dailyChange ?? 0) >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                ${formatNumber(stats.dailyChange)} (
                {formatNumber(stats.dailyChangePercentage)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CasinoWalletPanel;
