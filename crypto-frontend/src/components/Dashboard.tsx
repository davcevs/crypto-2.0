import React, { useState, useEffect } from "react";
import { RefreshCw, Send, TrendingUp, DollarSign, History } from "lucide-react";
import axiosInstance from "./../common/axios-instance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  WalletData,
  WalletStats,
  CryptoHolding,
  ApiError,
} from "../interfaces/WalletInterfaces";
import { User } from "@/interfaces/UserInterface";

interface TransferData {
  toWalletId: string;
  symbol: string;
  amount: string;
}

interface WalletDashboardProps {
  user?: User;
}

const Dashboard: React.FC<WalletDashboardProps> = ({ user }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [transferData, setTransferData] = useState<TransferData>({
    toWalletId: "",
    symbol: "",
    amount: "",
  });
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const fetchWalletData = async () => {
    if (!user?.id || !user.walletId || typeof user.walletId !== "string") {
      setError("Invalid user or wallet information");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const walletRes = await axiosInstance.get<WalletData>(
        `/wallet/user/${user.walletId}`
      );
      console.log("Wallet Response Data:", walletRes.data);

      // Check if the user and user.id are available in the response
      if (!walletRes.data || !walletRes.data.user || !walletRes.data.user.id) {
        console.warn("API response missing critical fields:", walletRes.data);
        setError("Wallet data is incomplete. Please try again later.");
        return;
      }

      setWallet(walletRes.data);
    } catch (err) {
      console.error("Fetch Wallet Error:", err);
      setError("Failed to fetch wallet data.");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrices = async () => {
    if (!wallet?.id) return;

    if (holdings.length > 0) {
      try {
        setError("");
        const updatedHoldings = await Promise.all(
          holdings.map(async (holding) => {
            try {
              const price = await axiosInstance.get<number>(
                `/crypto/price/${holding.symbol}`
              );
              return {
                ...holding,
                currentPrice: price.data,
                totalValue: holding.amount * price.data,
              };
            } catch (err) {
              // If individual price fetch fails, return holding with current values
              return holding;
            }
          })
        );
        setHoldings(updatedHoldings);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to update prices");
      }
    }
  };

  useEffect(() => {
    fetchWalletData();
    return () => {
      // Cleanup
    };
  }, [user?.id]);

  useEffect(() => {
    if (wallet?.id) {
      const interval = setInterval(updatePrices, 30000);
      return () => clearInterval(interval);
    }
  }, [wallet?.id]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.id) {
      setError("Wallet information is missing");
      return;
    }

    try {
      setError("");
      await axiosInstance.post(`/wallet/${wallet.id}/transfer`, transferData);
      setIsTransferOpen(false);
      fetchWalletData();
      setTransferData({ toWalletId: "", symbol: "", amount: "" });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Transfer failed");
    }
  };

  const getTotalPortfolioValue = (): number => {
    const cryptoValue = holdings.reduce(
      (sum, holding) => sum + (holding.totalValue || 0),
      0
    );
    return (wallet?.cashBalance || 0) + cryptoValue;
  };

  if (!user?.id) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            User information is missing. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading wallet data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2" />
              Total Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">${getTotalPortfolioValue()}</h3>
            <p className="text-sm text-gray-500">
              Cash: ${wallet?.cashBalance || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl font-bold">
              {stats && (
                <>
                  ${stats.dailyChange.toFixed(2)} (
                  {stats.dailyChangePercentage.toFixed(2)}%)
                </>
              )}
            </h3>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{wallet?.transactions?.length || 0} Total Transactions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Crypto Holdings</CardTitle>
          <div className="flex gap-2">
            <Button onClick={updatePrices} size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Crypto</DialogTitle>
                  <DialogDescription>
                    Send crypto to another wallet
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTransfer} className="space-y-4">
                  <Input
                    placeholder="Recipient Wallet ID"
                    value={transferData.toWalletId}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        toWalletId: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="Symbol (e.g., BTC)"
                    value={transferData.symbol}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        symbol: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        amount: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" className="w-full">
                    Transfer
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-right p-2">Current Price</th>
                  <th className="text-right p-2">Total Value</th>
                  <th className="text-right p-2">Avg. Buy Price</th>
                  <th className="text-right p-2">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const profitLoss = holding.currentPrice
                    ? (holding.currentPrice - holding.averageBuyPrice) *
                      holding.amount
                    : 0;
                  const profitLossPercentage = holding.averageBuyPrice
                    ? (((holding.currentPrice || 0) - holding.averageBuyPrice) /
                        holding.averageBuyPrice) *
                      100
                    : 0;

                  return (
                    <tr key={holding.id}>
                      <td className="p-2">{holding.symbol}</td>
                      <td className="text-right p-2">
                        {holding.amount.toFixed(8)}
                      </td>
                      <td className="text-right p-2">
                        ${holding.currentPrice?.toFixed(2) || "N/A"}
                      </td>
                      <td className="text-right p-2">
                        ${holding.totalValue?.toFixed(2) || "N/A"}
                      </td>
                      <td className="text-right p-2">
                        ${holding.averageBuyPrice.toFixed(2)}
                      </td>
                      <td className="text-right p-2">
                        <span
                          className={
                            profitLoss >= 0 ? "text-green-500" : "text-red-500"
                          }
                        >
                          ${profitLoss.toFixed(2)} (
                          {profitLossPercentage.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Type</th>
                  <th className="text-left p-2">Symbol</th>
                  <th className="text-right p-2">Amount</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {wallet?.transactions?.map((tx) => (
                  <tr key={tx.id}>
                    <td className="p-2">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <span
                        className={
                          tx.type === "BUY" ? "text-green-500" : "text-red-500"
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-2">{tx.symbol}</td>
                    <td className="text-right p-2">{tx.amount.toFixed(8)}</td>
                    <td className="text-right p-2">${tx.price.toFixed(2)}</td>
                    <td className="text-right p-2">
                      ${(tx.amount * tx.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
