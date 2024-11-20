import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, History } from "lucide-react";
import { formatCurrency, formatNumber } from "../common/CurrencyFormatters";
import { DashboardState } from "../../types/dashboard.types";

interface PortfolioCardsProps {
  wallet: DashboardState["wallet"];
  walletStats: DashboardState["walletStats"];
  transactions: DashboardState["transactions"];
}

export const PortfolioCards: React.FC<PortfolioCardsProps> = ({
  wallet,
  walletStats,
  transactions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Wallet className="mr-2 text-blue-400" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatCurrency(walletStats?.totalValue || 0)}
            </div>
            <div className="text-sm text-gray-400">
              Cash Balance: {formatCurrency(wallet?.cashBalance || 0)}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <TrendingUp className="mr-2 text-blue-400" />
              24h Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                walletStats?.dailyChange >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(walletStats?.dailyChange || 0)}
              <span className="text-lg ml-2">
                ({formatNumber(walletStats?.dailyChangePercentage || 0, 2)}%)
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <History className="mr-2 text-blue-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {transactions.length}
            </div>
            <div className="text-sm text-gray-400">Total Transactions</div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
