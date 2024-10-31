import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Loader2 } from "lucide-react";
import { CryptoService } from "../services/cryptoService";

interface CryptoCoin {
  symbol: string;
  price: number;
  priceChangePercent: number;
  logo: string;
}

const CryptoCoinCard: React.FC<{ coin: CryptoCoin }> = ({ coin }) => {
  const [historicalData, setHistoricalData] = useState<
    { price: number; time: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");

  const timeframeMap = {
    "24h": { interval: "1h", limit: 24 },
    "7d": { interval: "4h", limit: 42 },
    "30d": { interval: "1d", limit: 30 },
  };

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        const { interval, limit } = timeframeMap[timeframe];
        const data = await CryptoService.getInstance().getHistoricalPrices(
          coin.symbol,
          interval,
          limit
        );
        setHistoricalData(data);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }
      setIsLoading(false);
    };

    fetchHistoricalData();
  }, [coin.symbol, timeframe]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const chartColor = coin.priceChangePercent >= 0 ? "#10B981" : "#EF4444";
  const gradientId = `gradient-${coin.symbol.toLowerCase()}`;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            src={coin.logo}
            alt={coin.symbol}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <h3 className="font-semibold text-gray-100">{coin.symbol}</h3>
            <p className="text-sm text-gray-400">USDT</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-100">
            {formatPrice(coin.price)}
          </p>
          <div
            className={`flex items-center justify-end text-sm font-medium ${
              coin.priceChangePercent >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {coin.priceChangePercent >= 0 ? "↑" : "↓"}
            {Math.abs(coin.priceChangePercent).toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="h-[120px] mb-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "#6B7280" }}
                tickFormatter={(time) => {
                  const date = new Date(time);
                  return timeframe === "24h"
                    ? date.getHours().toString().padStart(2, "0") + ":00"
                    : date.getDate() + "/" + (date.getMonth() + 1);
                }}
              />
              <YAxis domain={["dataMin", "dataMax"]} hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "6px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#9CA3AF" }}
                formatter={(value: number) => [formatPrice(value), "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex justify-center space-x-2">
        {(["24h", "7d", "30d"] as const).map((period) => (
          <button
            key={period}
            onClick={() => setTimeframe(period)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              timeframe === period
                ? "bg-blue-500 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {period}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default CryptoCoinCard;
