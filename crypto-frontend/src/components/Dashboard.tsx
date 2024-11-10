import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  DollarSign,
  Wallet,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cryptoService } from "../services/cryptoService";
import { WalletData } from "../interfaces/WalletInterfaces";

const CryptoWalletDashboard = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [priceData, setPriceData] = useState<Record<string, number>>({});
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const wallet = await cryptoService.getWalletData();
        setWalletData(wallet);

        // Subscribe to price updates
        const unsubscribe = cryptoService.subscribeToPriceUpdates((prices) => {
          setPriceData(prices);
        });

        // Fetch historical data for portfolio value
        const historicalPrices = await cryptoService.getHistoricalPrices(
          "BTCUSDT"
        );
        setHistoricalData(historicalPrices);

        setLoading(false);
        return () => unsubscribe();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load wallet data"
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculatePortfolioValue = () => {
    if (!walletData?.holdings || !priceData) return 0;

    return walletData.holdings.reduce((total, holding) => {
      const price = priceData[`${holding.symbol}USDT`] || 0;
      return total + holding.amount * price;
    }, walletData.cashBalance);
  };

  const calculateProfitLoss = () => {
    const currentValue = calculatePortfolioValue();
    return currentValue - 100000; // Initial value of $100,000
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
    );
  }

  const profitLoss = calculateProfitLoss();
  const portfolioValue = calculatePortfolioValue();

  return (
    <div className="p-6 space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Portfolio Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${portfolioValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${walletData?.cashBalance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            {profitLoss >= 0 ? (
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                profitLoss >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ${Math.abs(profitLoss).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletData?.holdings.length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Value Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Holdings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Crypto Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Coin</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Current Price</th>
                  <th className="px-6 py-3">Value</th>
                </tr>
              </thead>
              <tbody>
                {walletData?.holdings.map((holding) => {
                  const price = priceData[`${holding.symbol}USDT`] || 0;
                  const value = holding.amount * price;

                  return (
                    <tr key={holding.symbol} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium">
                        {holding.symbol}
                      </td>
                      <td className="px-6 py-4">{holding.amount}</td>
                      <td className="px-6 py-4">${price.toLocaleString()}</td>
                      <td className="px-6 py-4">${value.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoWalletDashboard;
