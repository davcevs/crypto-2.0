// components/QuickTradePanel.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpCircle, ArrowDownCircle, RefreshCcw } from "lucide-react";
import {
  cryptoService,
  TRADING_PAIRS,
  MINIMUM_TRADE_AMOUNTS,
  type TradingPair,
  BuySellCryptoDto,
} from "../services/cryptoService";
import { WalletData } from "@/interfaces/WalletInterfaces";

interface QuickTradePanelProps {
  onTradeComplete: () => void;
  wallet: WalletData;
  userId: string;
}

const QuickTradePanel = ({
  onTradeComplete,
  wallet,
  userId,
}: QuickTradePanelProps) => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<TradingPair, number>>(
    {} as Record<TradingPair, number>
  );
  const [stats, setStats] = useState<
    Record<TradingPair, { priceChangePercent: number }>
  >({} as Record<TradingPair, { priceChangePercent: number }>);

  useEffect(() => {
    const unsubscribe = cryptoService.subscribeToPriceUpdates((newPrices) => {
      setPrices(newPrices);
    });

    const fetchStats = async () => {
      const newStats: Record<TradingPair, { priceChangePercent: number }> =
        {} as Record<TradingPair, { priceChangePercent: number }>;
      for (const symbol of TRADING_PAIRS) {
        try {
          const stat = await cryptoService.get24HrChange(symbol);
          newStats[symbol] = { priceChangePercent: stat.priceChangePercent };
        } catch (error) {
          console.error(`Failed to fetch stats for ${symbol}:`, error);
        }
      }
      setStats(newStats);
    };
    fetchStats();

    return () => {
      unsubscribe();
    };
  }, []);

  const validateTrade = (type: "buy" | "sell", symbol: TradingPair) => {
    if (type === "buy") {
      const cost = prices[symbol] * MINIMUM_TRADE_AMOUNTS[symbol];
      if (cost > wallet.cashBalance) {
        throw new Error(
          `Insufficient funds. Need ${formatPrice(
            cost
          )} USDT, available: ${formatPrice(wallet.cashBalance)}`
        );
      }
    }
  };

  const handleTrade = async (type: "buy" | "sell", symbol: TradingPair) => {
    setLoading((prev) => ({ ...prev, [`${type}_${symbol}`]: true }));
    setError(null);
    setSuccess(null);

    try {
      if (type === "buy") {
        validateTrade(type, symbol);
      }

      const tradeDto: BuySellCryptoDto = {
        userId,
        symbol,
        amount: MINIMUM_TRADE_AMOUNTS[symbol],
      };

      if (type === "buy") {
        await cryptoService.buyCrypto(tradeDto);
      } else {
        await cryptoService.sellCrypto(tradeDto);
      }

      onTradeComplete();
      setSuccess(
        `Successfully ${type === "buy" ? "bought" : "sold"} ${
          MINIMUM_TRADE_AMOUNTS[symbol]
        } ${symbol}`
      );
    } catch (err: any) {
      console.error(`Trade error (${type} ${symbol}):`, err);
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading((prev) => ({ ...prev, [`${type}_${symbol}`]: false }));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900 shadow-md rounded-lg p-4 mb-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Quick Trade</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TRADING_PAIRS.map((symbol) => (
          <div key={symbol} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-bold">
                {symbol.replace("USDT", "")}
              </span>
              <div className="text-right">
                <div className="text-gray-200">
                  {prices[symbol] ? formatPrice(prices[symbol]) : "--"}
                </div>
                {stats[symbol] && (
                  <div
                    className={`text-sm ${
                      stats[symbol].priceChangePercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {stats[symbol].priceChangePercent >= 0 ? "+" : ""}
                    {stats[symbol].priceChangePercent.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center mt-2 gap-2">
              <button
                onClick={() => handleTrade("buy", symbol)}
                disabled={loading[`buy_${symbol}`] || !prices[symbol]}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading[`buy_${symbol}`] ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUpCircle className="h-4 w-4" />
                )}
                Buy {MINIMUM_TRADE_AMOUNTS[symbol]}
              </button>
              <button
                onClick={() => handleTrade("sell", symbol)}
                disabled={loading[`sell_${symbol}`] || !prices[symbol]}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md py-2 px-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading[`sell_${symbol}`] ? (
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownCircle className="h-4 w-4" />
                )}
                Sell {MINIMUM_TRADE_AMOUNTS[symbol]}
              </button>
            </div>
          </div>
        ))}
      </div>

      {(error || success) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`mt-4 p-3 rounded ${
            error
              ? "bg-red-500/10 text-red-500"
              : "bg-green-500/10 text-green-500"
          }`}
        >
          {error || success}
        </motion.div>
      )}
    </motion.div>
  );
};

export default QuickTradePanel;
