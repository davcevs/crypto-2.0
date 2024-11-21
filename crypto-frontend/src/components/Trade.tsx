import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Loader2,
  CreditCard,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axiosInstance from "@/common/axios-instance";
import { useWallet } from "../hooks/useWallet";
import { useTrade } from "../hooks/useTrade";
import { TradeForm } from "../components/TradeForm";
import { CandlestickChart } from "../components/CandlestickChart";
import { User } from "./../interfaces/UserInterface";

interface CryptoTradingProps {
  onTradeComplete?: () => void;
}

const Trade: React.FC<CryptoTradingProps> = ({ onTradeComplete }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC");
  const [selectedInterval, setSelectedInterval] = useState("1m");

  const {
    wallet,
    error: walletError,
    isFetchingWallet,
    fetchWallet,
  } = useWallet(user);
  const {
    executeTrade,
    loading,
    error: tradeError,
  } = useTrade(user, () => {
    if (user) {
      handleRefreshWallet();
      onTradeComplete?.();
    }
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, []);

  const handleRefreshWallet = async () => {
    if (user) {
      setIsRefreshing(true);
      await fetchWallet(user.id, user.walletId);
      setIsRefreshing(false);
    }
  };

  const fetchCurrentPrice = async (symbol: string): Promise<void> => {
    try {
      const response = await axiosInstance.get<number>(
        `/crypto/price/${symbol}USDT`
      );
      setCurrentPrice(response.data);
    } catch (err) {
      setCurrentPrice(null);
      console.error(`Failed to fetch price for ${symbol}`, err);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    setSelectedSymbol(symbol);
    fetchCurrentPrice(symbol);
  };

  const cashBalance = wallet?.balance ?? wallet?.cashBalance ?? 0;
  const error = walletError || tradeError;

  if (isFetchingWallet) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#161A1E]">
        <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#161A1E] text-white p-4">
      {error && (
        <Alert
          variant="destructive"
          className="mb-4 bg-red-900/20 border-red-600"
        >
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Left Sidebar - Market List */}
        <div className="col-span-2 bg-[#1E2329] rounded-lg">
          <div className="p-4 border-b border-gray-800">
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-[#2B3139] text-sm rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>

          <div className="flex border-b border-gray-800">
            <button className="flex-1 py-2 text-sm text-yellow-500 border-b-2 border-yellow-500">
              USDT
            </button>
            <button className="flex-1 py-2 text-sm text-gray-400 hover:text-white">
              BUSD
            </button>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-240px)]">
            {["BTC", "ETH", "BNB", "SOL"].map((symbol) => (
              <div
                key={symbol}
                onClick={() => handleSymbolChange(symbol)}
                className={`p-4 cursor-pointer hover:bg-[#2B3139] ${
                  selectedSymbol === symbol ? "bg-[#2B3139]" : ""
                }`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{symbol}/USDT</span>
                  <span className="text-green-500">
                    $
                    {symbol === selectedSymbol && currentPrice
                      ? currentPrice.toFixed(2)
                      : "0.00"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Chart */}
        <div className="col-span-7 bg-[#1E2329] rounded-lg">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    {selectedSymbol}/USDT
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <span className="text-2xl font-bold text-green-500">
                  ${currentPrice?.toFixed(2) ?? "Loading..."}
                </span>
              </div>

              <Tabs defaultValue={selectedInterval} className="w-fit">
                <TabsList className="bg-[#2B3139]">
                  {["1m", "5m", "15m", "1h", "4h", "1d"].map((interval) => (
                    <TabsTrigger
                      key={interval}
                      value={interval}
                      onClick={() => setSelectedInterval(interval)}
                      className={`${
                        selectedInterval === interval
                          ? "bg-yellow-500 text-black"
                          : "text-gray-400"
                      }`}
                    >
                      {interval}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="h-[600px]">
            <CandlestickChart
              symbol={selectedSymbol}
              interval={selectedInterval}
            />
          </div>
        </div>

        {/* Right Sidebar - Trading Form */}
        <div className="col-span-3 bg-[#1E2329] rounded-lg">
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-yellow-500" />
                <span>Balance</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefreshWallet}
                      disabled={isRefreshing}
                      className="hover:bg-[#2B3139]"
                    >
                      {isRefreshing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh Balance</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-2xl font-bold text-yellow-500 mt-2">
              ${Number(wallet?.balance ?? wallet?.cashBalance ?? 0).toFixed(2)}
            </div>
          </div>

          <div className="p-4">
            <TradeForm
              onSubmit={executeTrade}
              loading={loading}
              currentPrice={currentPrice}
              onSymbolChange={handleSymbolChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
