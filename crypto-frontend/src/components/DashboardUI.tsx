import { motion } from "framer-motion";
import { WalletData, WalletStats } from "../interfaces/WalletInterfaces";

interface DashboardUIProps {
  wallet: WalletData;
  stats: WalletStats | null;
}

const DashboardUI = ({ wallet, stats }: DashboardUIProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatChange = (
    change: number | undefined,
    percentage: number | undefined
  ) => {
    if (typeof change === "undefined" || typeof percentage === "undefined") {
      return "N/A";
    }
    const sign = change >= 0 ? "+" : "";
    return `${sign}${formatCurrency(change)} (${sign}${percentage.toFixed(
      2
    )}%)`;
  };

  return (
    <>
      <h2 className="text-2xl mb-4 text-center font-bold">Wallet Dashboard</h2>

      {/* Wallet Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 shadow-md rounded-lg p-4"
      >
        <h3 className="text-lg font-semibold text-white">Wallet Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
          <div>
            <p className="text-sm font-medium text-gray-400">Balance</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(wallet.balance)}
            </p>
          </div>
          {stats && (
            <>
              <div>
                <p className="text-sm font-medium text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">
                  Daily Change
                </p>
                <p
                  className={`text-2xl font-bold ${
                    stats.dailyChange >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formatChange(
                    stats?.dailyChange,
                    stats?.dailyChangePercentage
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Holdings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 shadow-md rounded-lg p-4"
      >
        <h3 className="text-lg font-semibold text-white">Holdings</h3>
        <div className="mt-4">
          {wallet.holdings.length > 0 ? (
            <div className="grid gap-4">
              {wallet.holdings.map((holding) => (
                <div
                  key={holding.symbol}
                  className="border rounded bg-gray-800 p-3"
                >
                  <div>
                    <span className="font-bold text-white">
                      {holding.symbol}:
                    </span>{" "}
                    <span className="text-gray-400">
                      {holding.amount} units
                    </span>
                  </div>
                  {holding.currentPrice && (
                    <div className="text-right">
                      <p className="font-medium text-white">
                        {formatCurrency(holding.currentPrice)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Total:{" "}
                        {formatCurrency(holding.amount * holding.currentPrice)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No holdings available</p>
          )}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 shadow-md rounded-lg p-4"
      >
        <h3 className="text-lg font-semibold text-white">
          Recent Transactions
        </h3>
        <div className="mt-4">
          {wallet.transactions && wallet.transactions.length > 0 ? (
            <div className="divide-y">
              {wallet.transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-white">
                      {transaction.type} {transaction.symbol}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(transaction.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">
                      {transaction.amount} units
                    </p>
                    <p className="text-sm text-gray-400">
                      @ {formatCurrency(transaction.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No transactions available</p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default DashboardUI;
