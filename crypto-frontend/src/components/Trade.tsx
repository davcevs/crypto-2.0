import React, { useState, useEffect } from "react";
import { DollarSign, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/interfaces/UserInterface";
import { ApiError, WalletData } from "@/interfaces/WalletInterfaces";
import axiosInstance from "./../common/axios-instance";

interface TradePayload {
  userId: string;
  walletId: string;
  symbol: string;
  amount: number;
}

interface CryptoTradingProps {
  onTradeComplete?: () => void;
}

const Trade: React.FC<CryptoTradingProps> = ({ onTradeComplete }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [symbol, setSymbol] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isFetchingWallet, setIsFetchingWallet] = useState<boolean>(true);

  const supportedSymbols = ["BTC", "ETH", "BNB", "SOL", "DOT"];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Log the user data to verify
        console.log("Loaded user data:", parsedUser);

        // Immediately fetch wallet if we have user data
        if (parsedUser?.walletId) {
          fetchWallet(parsedUser.id, parsedUser.walletId);
        } else {
          setError("No wallet ID found in user data");
          setIsFetchingWallet(false);
        }
      } catch (err) {
        setError("Invalid user data");
        console.error("Failed to parse user data:", err);
        setIsFetchingWallet(false);
      }
    } else {
      setError("User data not found");
      setIsFetchingWallet(false);
    }
  }, []);

  const fetchWallet = async (userId: string, walletId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setIsFetchingWallet(false);
      return;
    }

    try {
      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      // Changed to use the correct endpoint /wallet/user/{walletId}
      const response = await axiosInstance.get<WalletData>(
        `/wallet/user/${walletId}`
      );

      if (response.data) {
        setWallet(response.data);
        setError("");
        console.log("Fetched wallet data:", response.data);
      } else {
        throw new Error("No wallet data received");
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (apiError.response?.status === 404) {
        setError("Wallet not found. Please contact support.");
      } else {
        setError(
          apiError.message || "Failed to fetch wallet data. Please try again."
        );
      }
      console.error("Wallet fetch error:", apiError);
    } finally {
      setIsFetchingWallet(false);
    }
  };

  const fetchCurrentPrice = async (selectedSymbol: string): Promise<void> => {
    try {
      const response = await axiosInstance.get<number>(
        `/crypto/price/${selectedSymbol}USDT`
      );
      setCurrentPrice(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch current price");
      setCurrentPrice(null);
    }
  };

  const handleSymbolChange = (value: string): void => {
    setSymbol(value);
    fetchCurrentPrice(value);
  };

  const handleTrade = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!user?.id || !user?.walletId) {
      setError("User not authenticated or invalid user data.");
      return;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!symbol) {
      setError("Please select a cryptocurrency");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      const payload: TradePayload = {
        userId: user.id,
        walletId: user.walletId,
        symbol: `${symbol}USDT`,
        amount: parseFloat(amount),
      };

      // Log the payload for debugging
      console.log("Trade payload:", payload);

      // Use the walletId in the URL path and send the payload in the body
      const response = await axiosInstance.post(
        `/wallet/${user.id}/${tradeType}`, // Changed to use userId in the path
        payload
      );

      console.log("Trade response:", response.data);

      if (response.data.success) {
        await fetchWallet(user.id, user.walletId);
        setAmount("");
        setSymbol("");
        setCurrentPrice(null);

        if (onTradeComplete) {
          onTradeComplete();
        }
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Trade error:", apiError.response?.data || apiError);
      setError(
        apiError.response?.data?.message ||
          apiError.message ||
          `Failed to ${tradeType} crypto`
      );
    } finally {
      setLoading(false);
    }
  };

  const estimatedTotal = currentPrice
    ? (parseFloat(amount) * currentPrice).toFixed(2)
    : "0.00";

  if (isFetchingWallet) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading wallet data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Crypto Trading
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 p-4 bg-secondary rounded">
          <div className="flex justify-between items-center mb-2">
            <span>Available Balance:</span>
            <span className="font-semibold">${wallet.cashBalance}</span>
          </div>
        </div>

        <form onSubmit={handleTrade} className="space-y-4">
          <div className="flex gap-4">
            <Button
              type="button"
              variant={tradeType === "buy" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTradeType("buy")}
            >
              Buy
            </Button>
            <Button
              type="button"
              variant={tradeType === "sell" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setTradeType("sell")}
            >
              Sell
            </Button>
          </div>

          <div className="space-y-2">
            <Select value={symbol} onValueChange={handleSymbolChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Crypto" />
              </SelectTrigger>
              <SelectContent>
                {supportedSymbols.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.00000001"
            />
          </div>

          {currentPrice && (
            <div className="flex justify-between items-center p-2 bg-secondary rounded">
              <span>Current Price:</span>
              <span className="font-semibold">${currentPrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center p-2 bg-secondary rounded">
            <span>Estimated Total:</span>
            <span className="font-semibold">
              <DollarSign className="w-4 h-4 inline" />
              {estimatedTotal}
            </span>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!symbol || !amount || loading || !currentPrice}
          >
            {loading
              ? "Processing..."
              : `${tradeType.toUpperCase()} ${symbol || "Crypto"}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Trade;
