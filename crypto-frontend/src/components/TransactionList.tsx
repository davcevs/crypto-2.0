import React, { useEffect } from "react";
import { Transaction } from "../../types/transaction.types";
import { format } from "date-fns";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading,
}) => {
  if (isLoading) {
    return <div>Loading transactions...</div>;
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className={`p-4 border rounded ${
            transaction.type === "BUY" ? "border-green-500" : "border-red-500"
          }`}
        >
          <div className="flex justify-between">
            <span className="font-bold">{transaction.symbol}</span>
            <span
              className={`${
                transaction.type === "BUY" ? "text-green-500" : "text-red-500"
              }`}
            >
              {transaction.type}
            </span>
          </div>
          <div className="mt-2">
            <p>Amount: {transaction.amount}</p>
            <p>Price: ${transaction.price}</p>
            <p>Total: ${transaction.total}</p>
            <p className="text-sm text-gray-500">
              {format(new Date(transaction.createdAt), "PPpp")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
