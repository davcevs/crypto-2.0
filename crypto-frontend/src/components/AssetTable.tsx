import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Coins, TrendingUp, TrendingDown } from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../common/CurrencyFormatters";

import { DashboardState } from "types/dashboard.types";
import { TransferCryptoModal } from "./TransferCrypto";

interface AssetsTableProps {
  holdings: DashboardState["holdings"];
  marketData: DashboardState["marketData"];
  user: DashboardState["user"];
  fetchAllData: () => void;
}

export const AssetsTable: React.FC<AssetsTableProps> = ({
  holdings,
  marketData,
  user,
  fetchAllData,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [selectedHolding, setSelectedHolding] = useState<
    DashboardState["holdings"][number] | null
  >(null);

  const openTransferModal = (holding: DashboardState["holdings"][number]) => {
    setSelectedHolding(holding);
    setSelectedCrypto(holding.symbol);
    setIsTransferModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-gray-900 border-gray-800 rounded-xl shadow-lg">
        <CardHeader className="border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6 text-blue-500" />
              <CardTitle className="text-white text-xl">My Assets</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={fetchAllData}
                variant="outline"
                size="sm"
                className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border-blue-500/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr className="text-gray-400 text-sm">
                  <th className="text-left p-4">Asset</th>
                  <th className="text-right p-4">Balance</th>
                  <th className="text-right p-4">Price</th>
                  <th className="text-right p-4">24h Change</th>
                  <th className="text-right p-4">Value</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const market = marketData[holding.symbol];
                  const value = holding.amount * (market?.price || 0);
                  const isPositive = (market?.priceChangePercent24h || 0) >= 0;

                  return (
                    <motion.tr
                      key={holding.symbol}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="font-semibold text-white">
                            {holding.symbol}
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-4 text-gray-300">
                        {formatNumber(holding.amount, 4)}
                      </td>
                      <td className="text-right p-4 text-gray-300">
                        {formatCurrency(market?.price || 0)}
                      </td>
                      <td className="text-right p-4">
                        <div
                          className={`flex items-center justify-end space-x-1 ${
                            isPositive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                          <span>
                            {formatPercentage(
                              market?.priceChangePercent24h || 0
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="text-right p-4 text-gray-300">
                        {formatCurrency(value)}
                      </td>
                      <td className="text-right p-4 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-green-500/10 hover:bg-green-500/20 text-green-300 border-green-500/30"
                          onClick={() => openTransferModal(holding)}
                        >
                          Transfer
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <TransferCryptoModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        user={user}
        holdings={holdings}
        selectedCrypto={selectedCrypto}
        onTransferSuccess={fetchAllData}
      />
    </motion.div>
  );
};
