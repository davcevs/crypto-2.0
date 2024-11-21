import React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "../common/CurrencyFormatters";
import { Transaction } from "types/transaction.types";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
}) => {
  // Function to determine transaction type display and color
  const getTransactionDisplay = (tx: Transaction) => {
    switch (tx.type) {
      case "BUY":
        return {
          type: "BUY",
          color: "text-green-400",
        };
      case "SELL":
        return {
          type: "SELL",
          color: "text-red-400",
        };
      case "TRANSFER":
        return {
          type: tx.amount > 0 ? "RECEIVED" : "TRANSFER",
          color: tx.amount > 0 ? "text-green-400" : "text-yellow-400",
        };
      default:
        return {
          type: tx.type,
          color: "text-gray-400",
        };
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-y-auto max-h-64">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Asset</th>
                <th className="text-right p-2">Amount</th>
                <th className="text-right p-2">Price</th>
                <th className="text-right p-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => {
                const { type, color } = getTransactionDisplay(tx);
                return (
                  <motion.tr
                    key={tx.id}
                    className="border-t border-gray-700 hover:bg-gray-700/50"
                    whileHover={{ scale: 1.01 }}
                  >
                    <td className="p-2">
                      <span className={color}>{type}</span>
                    </td>
                    <td className="p-2 text-gray-300">{tx.symbol}</td>
                    <td className="text-right p-2 text-gray-300">
                      {formatNumber(Math.abs(tx.amount))}
                    </td>
                    <td className="text-right p-2 text-gray-300">
                      {formatCurrency(tx.price)}
                    </td>
                    <td className="text-right p-2 text-gray-300">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
