import React, { useState, useEffect } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "../common/CurrencyFormatters";
import { DashboardState, HistoricalDataPoint } from "types/dashboard.types";
import axiosInstance from "@/common/axios-instance";

interface PriceChartProps {
  historicalData: DashboardState["historicalData"];
  selectedCrypto: string;
  wallet?: DashboardState["wallet"];
  user: { walletId: string };
}

export const PriceChart: React.FC<PriceChartProps> = ({
  historicalData,
  selectedCrypto,
  wallet,
  user,
}) => {
  const [chartType, setChartType] = useState<"crypto" | "cashBalance">(
    "crypto"
  );
  const [timeFrame, setTimeFrame] = useState<"24h" | "7d" | "30d">("24h");
  const [cashBalanceHistory, setCashBalanceHistory] = useState<
    HistoricalDataPoint[]
  >([]);

  useEffect(() => {
    const fetchCashBalanceHistory = async () => {
      if (!user?.walletId) return;

      try {
        const response = await axiosInstance.get(
          `/wallet/${user.walletId}/balance-history`
        );

        // Ensure the historical data is sorted by timestamp
        const sortedHistory = response.data.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        setCashBalanceHistory(sortedHistory);
      } catch (error) {
        console.error("Failed to fetch cash balance history", error);
        // Fallback to generating mock data if API fails
        const mockHistoricalData: HistoricalDataPoint[] = wallet?.cashBalance
          ? [
              {
                timestamp: new Date(
                  Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
                price: wallet.cashBalance * 0.9,
                volume: 0,
              },
              {
                timestamp: new Date().toISOString(),
                price: wallet.cashBalance,
                volume: 0,
              },
            ]
          : [];
        setCashBalanceHistory(mockHistoricalData);
      }
    };

    fetchCashBalanceHistory();

    // Set up periodic refresh for cash balance history
    const intervalId = setInterval(fetchCashBalanceHistory, 30000);
    return () => clearInterval(intervalId);
  }, [user?.walletId, wallet?.cashBalance]);

  const filterHistoricalData = (
    data: HistoricalDataPoint[],
    frame: "24h" | "7d" | "30d"
  ) => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    const filterDate = new Date();

    switch (frame) {
      case "24h":
        filterDate.setHours(now.getHours() - 24);
        break;
      case "7d":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        filterDate.setDate(now.getDate() - 30);
        break;
    }

    return data.filter((point) => new Date(point.timestamp) >= filterDate);
  };

  const PriceChartComponent = ({
    symbol,
    data,
    isCashBalance = false,
  }: {
    symbol: string;
    isCashBalance?: boolean;
    data: HistoricalDataPoint[];
  }) => {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cryptoGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient
                id="cashBalanceGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
              stroke="#6b7280"
            />
            <YAxis domain={["auto", "auto"]} stroke="#6b7280" />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value: number) => [
                isCashBalance ? formatCurrency(value) : formatCurrency(value),
                isCashBalance ? "Balance" : "Price",
              ]}
              contentStyle={{ background: "#1f2937", border: "none" }}
            />
            <Area
              type="monotone"
              dataKey={isCashBalance ? "price" : "price"}
              stroke={isCashBalance ? "#10b981" : "#3b82f6"}
              fillOpacity={1}
              fill={
                isCashBalance
                  ? "url(#cashBalanceGradient)"
                  : "url(#cryptoGradient)"
              }
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Filter historical data based on selected time frame
  const filteredCryptoData = filterHistoricalData(
    historicalData[selectedCrypto] || [],
    timeFrame
  );

  const filteredCashBalanceData = filterHistoricalData(
    cashBalanceHistory,
    timeFrame
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">
          {chartType === "crypto" ? "Price Chart" : "Cash Balance"}
        </CardTitle>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType("crypto")}
            className={`px-3 py-1 rounded ${
              chartType === "crypto"
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Crypto
          </button>
          <button
            onClick={() => setChartType("cashBalance")}
            className={`px-3 py-1 rounded ${
              chartType === "cashBalance"
                ? "bg-green-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            Cash Balance
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={timeFrame}
          onValueChange={(value: "24h" | "7d" | "30d") => setTimeFrame(value)}
          defaultValue="24h"
          className="w-full"
        >
          <TabsList className="bg-gray-700">
            <TabsTrigger
              value="24h"
              className="data-[state=active]:bg-blue-500 text-white"
            >
              24H
            </TabsTrigger>
            <TabsTrigger
              value="7d"
              className="data-[state=active]:bg-blue-500 text-white"
            >
              7D
            </TabsTrigger>
            <TabsTrigger
              value="30d"
              className="data-[state=active]:bg-blue-500 text-white"
            >
              30D
            </TabsTrigger>
          </TabsList>
          <TabsContent value="24h">
            {chartType === "crypto" && selectedCrypto ? (
              <PriceChartComponent
                symbol={selectedCrypto}
                data={filteredCryptoData}
              />
            ) : (
              <PriceChartComponent
                symbol="cashBalance"
                data={filteredCashBalanceData}
                isCashBalance={true}
              />
            )}
          </TabsContent>
          <TabsContent value="7d">
            {chartType === "crypto" && selectedCrypto ? (
              <PriceChartComponent
                symbol={selectedCrypto}
                data={filteredCryptoData}
              />
            ) : (
              <PriceChartComponent
                symbol="cashBalance"
                data={filteredCashBalanceData}
                isCashBalance={true}
              />
            )}
          </TabsContent>
          <TabsContent value="30d">
            {chartType === "crypto" && selectedCrypto ? (
              <PriceChartComponent
                symbol={selectedCrypto}
                data={filteredCryptoData}
              />
            ) : (
              <PriceChartComponent
                symbol="cashBalance"
                data={filteredCashBalanceData}
                isCashBalance={true}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
