import React from "react";
import { TransactionStats as Stats } from "../..//types/transaction.types";

interface TransactionStatsProps {
  stats: Stats | null;
  isLoading: boolean;
}

export const TransactionStats: React.FC<TransactionStatsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading || !stats) {
    return <div>Loading stats...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-lg shadow">
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">Total Bought</h3>
        <p className="text-2xl text-green-500">
          ${stats.totalBought.toFixed(2)}
        </p>
      </div>
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">Total Sold</h3>
        <p className="text-2xl text-red-500">${stats.totalSold.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">Trading Volume</h3>
        <p className="text-2xl">${stats.tradingVolume.toFixed(2)}</p>
      </div>
      <div className="p-4 bg-gray-50 rounded">
        <h3 className="text-lg font-semibold">Total Transactions</h3>
        <p className="text-2xl">{stats.transactions}</p>
      </div>
    </div>
  );
};
