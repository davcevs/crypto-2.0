import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  Maximize2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Volume2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { CryptoService } from "../services/cryptoService";

interface DetailedCryptoChartProps {
  symbol: string;
  onSymbolChange?: (symbol: string) => void;
}

const DetailedCryptoChart: React.FC<DetailedCryptoChartProps> = ({
  symbol,
  onSymbolChange,
}) => {
  const [historicalData, setHistoricalData] = useState<
    Array<{
      price: number;
      time: string;
      volume: number;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"1H" | "4H" | "1D" | "1W" | "1M">(
    "1D"
  );
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null);
  const [showStats, setShowStats] = useState(true);

  const timeframeConfig = {
    "1H": { interval: "1m", limit: 60 },
    "4H": { interval: "5m", limit: 48 },
    "1D": { interval: "1h", limit: 24 },
    "1W": { interval: "4h", limit: 42 },
    "1M": { interval: "1d", limit: 30 },
  };

  // Popular trading pairs for quick switching
  const popularPairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"];

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { interval, limit } = timeframeConfig[timeframe];
      const data = await CryptoService.getInstance().getHistoricalPrices(
        symbol,
        interval,
        limit
      );
      // Add mock volume data since our service doesn't provide it
      const enrichedData = data.map((item) => ({
        ...item,
        volume: Math.random() * 1000000 + 500000,
      }));
      setHistoricalData(enrichedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  const stats = useMemo(() => {
    if (historicalData.length === 0) return null;
    const prices = historicalData.map((d) => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const current = prices[prices.length - 1];
    const open = prices[0];
    const change = ((current - open) / open) * 100;
    const totalVolume = historicalData.reduce((sum, d) => sum + d.volume, 0);

    return { high, low, current, change, totalVolume };
  }, [historicalData]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(volume);
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-2">{symbol}</h2>
          {stats && (
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-gray-100">
                {formatPrice(stats.current)}
              </span>
              <span
                className={`flex items-center text-sm font-medium ${
                  stats.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.change >= 0 ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {Math.abs(stats.change).toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {["1H", "4H", "1D", "1W", "1M"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as typeof timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeframe === tf
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {stats && showStats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-1">
              <TrendingUp size={16} className="mr-2" />
              High
            </div>
            <div className="text-lg font-semibold text-gray-100">
              {formatPrice(stats.high)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-1">
              <TrendingDown size={16} className="mr-2" />
              Low
            </div>
            <div className="text-lg font-semibold text-gray-100">
              {formatPrice(stats.low)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-1">
              <Volume2 size={16} className="mr-2" />
              Volume
            </div>
            <div className="text-lg font-semibold text-gray-100">
              {formatVolume(stats.totalVolume)}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center text-gray-400 mb-1">
              <DollarSign size={16} className="mr-2" />
              Change
            </div>
            <div
              className={`text-lg font-semibold ${
                stats.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stats.change >= 0 ? "+" : ""}
              {stats.change.toFixed(2)}%
            </div>
          </div>
        </motion.div>
      )}

      <div className="h-[400px] mb-6">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={historicalData}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setSelectedPoint(e.activeTooltipIndex);
                }
              }}
              onMouseLeave={() => setSelectedPoint(null)}
            >
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="time"
                tick={{ fill: "#9CA3AF" }}
                tickFormatter={(time) => {
                  const date = new Date(time);
                  return timeframe === "1D"
                    ? date.getHours().toString().padStart(2, "0") + ":00"
                    : date.toLocaleDateString();
                }}
              />
              <YAxis
                tick={{ fill: "#9CA3AF" }}
                domain={["dataMin", "dataMax"]}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#9CA3AF" }}
                formatter={(value: number, name: string) => [
                  name === "price" ? formatPrice(value) : formatVolume(value),
                  name === "price" ? "Price" : "Volume",
                ]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={historicalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" tick={{ fill: "#9CA3AF" }} />
            <YAxis tick={{ fill: "#9CA3AF" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "none",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [formatVolume(value), "Volume"]}
            />
            <Bar dataKey="volume" fill="#3B82F6" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="flex space-x-2">
          {popularPairs.map((pair) => (
            <button
              key={pair}
              onClick={() => onSymbolChange?.(pair)}
              className={`px-3 py-1 text-sm rounded-lg ${
                symbol === pair
                  ? "bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {pair}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="text-gray-400 hover:text-gray-300"
        >
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default DetailedCryptoChart;
