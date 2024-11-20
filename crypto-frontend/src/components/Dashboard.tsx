import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, History, Wallet } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/interfaces/UserInterface";
import {
  ApiError,
  CryptoHolding,
  CryptoHoldingsResponse,
  WalletData,
  WalletStats,
} from "@/interfaces/WalletInterfaces";
import axiosInstance from "@/common/axios-instance";
import { Transaction } from "types/transaction.types";

interface DashboardProps {
  user: User;
}

interface MarketData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [holdings, setHoldings] = useState<CryptoHolding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
  const [historicalData, setHistoricalData] = useState<
    Record<string, HistoricalDataPoint[]>
  >({});
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("24h");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedCrypto, setSelectedCrypto] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 8): string => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const fetchAllData = useCallback(async () => {
    if (!user?.walletId) return;

    try {
      // Instead of setting loading state to true, we'll only show loading
      // on initial load
      if (!wallet) {
        setIsLoading(true);
      }
      setError("");

      const [walletRes, statsRes, holdingsRes, transactionsRes] =
        await Promise.all([
          axiosInstance.get<WalletData>(`/wallet/user/${user.walletId}`),
          axiosInstance.get<WalletStats>(`/wallet/${user.walletId}/stats`),
          axiosInstance.get<CryptoHoldingsResponse>(
            `/crypto-holdings/${user.walletId}/holdings`
          ),
          axiosInstance.get<Transaction[]>(
            `/transactions/wallet/${user.walletId}`
          ),
        ]);

      setWallet(walletRes.data);
      setWalletStats(statsRes.data);
      setHoldings(holdingsRes.data.holdings);
      setTransactions(transactionsRes.data);

      // Fetch market data for each holding
      const marketPromises = holdingsRes.data.holdings.map(async (holding) => {
        const [price24h, historical] = await Promise.all([
          axiosInstance.get(`/crypto/24hr/${holding.symbol}`),
          axiosInstance.get(`/crypto/historical/${holding.symbol}`),
        ]);

        return {
          symbol: holding.symbol,
          marketData: price24h.data,
          historical: historical.data,
        };
      });

      const marketResults = await Promise.all(marketPromises);

      const marketDataObj: Record<string, MarketData> = {};
      const historicalObj: Record<string, HistoricalDataPoint[]> = {};

      marketResults.forEach((result) => {
        marketDataObj[result.symbol] = result.marketData;
        historicalObj[result.symbol] = result.historical;
      });

      setMarketData(marketDataObj);
      setHistoricalData(historicalObj);
      setLastUpdated(new Date());
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.response?.message || "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [user?.walletId, wallet]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isAutoRefresh) {
      intervalId = setInterval(fetchAllData, 30000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchAllData, isAutoRefresh]);

  const PriceChart: React.FC<{ symbol: string }> = ({ symbol }) => {
    const data = historicalData[symbol] || [];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            <YAxis domain={["auto", "auto"]} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [formatCurrency(value), "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="mr-2" />
              Portfolio Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletStats?.totalValue || 0)}
            </div>
            <div className="text-sm text-gray-500">
              Cash Balance: {formatCurrency(wallet?.cashBalance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" />
              24h Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                walletStats?.dailyChange >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatCurrency(walletStats?.dailyChange || 0)}
              <span className="text-lg ml-2">
                ({formatNumber(walletStats?.dailyChangePercentage || 0, 2)}%)
              </span>
            </div>
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
            <div className="text-2xl font-bold">{transactions.length}</div>
            <div className="text-sm text-gray-500">Total Transactions</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Assets</CardTitle>
            <Button onClick={fetchAllData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Asset</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">24h Change</th>
                  <th className="text-right p-2">Value</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const market = marketData[holding.symbol];
                  const value = holding.amount * (market?.price || 0);

                  return (
                    <tr key={holding.symbol} className="border-t">
                      <td className="p-2">
                        <div className="font-medium">{holding.symbol}</div>
                      </td>
                      <td className="text-right p-2">
                        {formatNumber(holding.amount)}
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(market?.price || 0)}
                      </td>
                      <td className="text-right p-2">
                        <span
                          className={
                            market?.priceChangePercent24h >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {formatNumber(market?.priceChangePercent24h || 0, 2)}%
                        </span>
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(value)}
                      </td>
                      <td className="text-right p-2">
                        <Button variant="outline" size="sm" className="mr-2">
                          Buy
                        </Button>
                        <Button variant="outline" size="sm">
                          Sell
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="24h" className="w-full">
              <TabsList>
                <TabsTrigger value="24h">24H</TabsTrigger>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
              </TabsList>
              <TabsContent value="24h">
                {selectedCrypto && <PriceChart symbol={selectedCrypto} />}
              </TabsContent>
              <TabsContent value="7d">
                {selectedCrypto && <PriceChart symbol={selectedCrypto} />}
              </TabsContent>
              <TabsContent value="30d">
                {selectedCrypto && <PriceChart symbol={selectedCrypto} />}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-y-auto max-h-64">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Asset</th>
                    <th className="text-right p-2">Amount</th>
                    <th className="text-right p-2">Price</th>
                    <th className="text-right p-2">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-t">
                      <td className="p-2">
                        <span
                          className={
                            tx.type === "BUY"
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="p-2">{tx.symbol}</td>
                      <td className="text-right p-2">
                        {formatNumber(tx.amount)}
                      </td>
                      <td className="text-right p-2">
                        {formatCurrency(tx.price)}
                      </td>
                      <td className="text-right p-2">
                        {new Date(tx.createdAt).toUTCString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
