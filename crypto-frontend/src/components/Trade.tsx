import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Loader2,
  CreditCard,
  RefreshCw,
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
import axiosInstance from "@/common/axios-instance";
import { useWallet } from "../hooks/useWallet";
import { useTrade } from "../hooks/useTrade";
import { TradeForm } from "../components/TradeForm";
import { User } from "./../interfaces/UserInterface";

interface CryptoTradingProps {
  onTradeComplete?: () => void;
}

const Trade: React.FC<CryptoTradingProps> = ({ onTradeComplete }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleTrade = async (
    tradeType: "buy" | "sell",
    symbol: string,
    amount: string
  ) => {
    const success = await executeTrade(tradeType, symbol, amount);
    if (success) {
      setCurrentPrice(null);
    }
  };

  const handleSymbolChange = (symbol: string) => {
    fetchCurrentPrice(symbol);
  };

  // Safe balance extraction
  const cashBalance = wallet?.balance ?? wallet?.cashBalance ?? 0;

  if (isFetchingWallet) {
    return (
      <Card className="w-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading wallet data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const error = walletError || tradeError;

  if (!wallet) {
    return (
      <Card className="w-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <TrendingUp className="w-5 h-5" />
            Crypto Trading
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {error}
                {(error === "Session expired. Please log in again." ||
                  error === "User not authenticated") && (
                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                  >
                    Go to Login
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-xl">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center justify-between text-primary">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Crypto Trading
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefreshWallet}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Wallet</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-secondary/50 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Available Balance:</span>
          </div>
          <span className="text-lg font-bold text-primary">
            ${Number(cashBalance).toFixed(2)}
          </span>
        </div>

        <TradeForm
          onSubmit={handleTrade}
          loading={loading}
          currentPrice={currentPrice}
          onSymbolChange={handleSymbolChange}
        />
      </CardContent>
    </Card>
  );
};

export default Trade;
