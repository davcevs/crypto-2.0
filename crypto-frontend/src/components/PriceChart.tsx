import React from "react";
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
import { DashboardState } from "types/dashboard.types";

interface PriceChartProps {
  historicalData: DashboardState["historicalData"];
  selectedCrypto: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  historicalData,
  selectedCrypto,
}) => {
  const PriceChartComponent = ({ symbol }: { symbol: string }) => {
    const data = historicalData[symbol] || [];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              formatter={(value: number) => [formatCurrency(value), "Price"]}
              contentStyle={{ background: "#1f2937", border: "none" }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="24h" className="w-full">
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
            {selectedCrypto && <PriceChartComponent symbol={selectedCrypto} />}
          </TabsContent>
          <TabsContent value="7d">
            {selectedCrypto && <PriceChartComponent symbol={selectedCrypto} />}
          </TabsContent>
          <TabsContent value="30d">
            {selectedCrypto && <PriceChartComponent symbol={selectedCrypto} />}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
