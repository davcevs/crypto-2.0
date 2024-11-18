import { useState, useEffect } from "react";
import { RefreshCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  cryptoService,
  TRADING_PAIRS,
  MINIMUM_TRADE_AMOUNTS,
} from "../services/cryptoService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CryptoTrading = () => {
  const [selectedPair, setSelectedPair] = useState<string>(TRADING_PAIRS[0]);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [priceChanges, setPriceChanges] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState<string>("");
  const [total, setTotal] = useState<string>("");
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const wallet = await cryptoService.getWalletData();
        setWalletData(wallet);

        // Subscribe to price updates
        const unsubscribe = cryptoService.subscribeToPriceUpdates(
          (newPrices) => {
            setPrices(newPrices);
          }
        );

        // Fetch historical data
        const history = await cryptoService.getHistoricalPrices(selectedPair);
        setHistoricalData(history);

        // Fetch 24h changes
        const changes = await Promise.all(
          TRADING_PAIRS.map(async (pair) => {
            const stats = await cryptoService.get24HrChange(pair);
            return [pair, stats.priceChangePercent];
          })
        );
        setPriceChanges(Object.fromEntries(changes));

        return () => unsubscribe();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load trading data"
        );
      }
    };

    fetchInitialData();
  }, []);

  // Update historical data when pair changes
  useEffect(() => {
    const fetchHistory = async () => {
      const history = await cryptoService.getHistoricalPrices(selectedPair);
      setHistoricalData(history);
    };
    fetchHistory();
  }, [selectedPair]);

  const handleBuy = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!amount || !total) {
        throw new Error("Please enter amount and total");
      }

      if (!walletData?.userId) {
        throw new Error("User data not found. Please log in again.");
      }

      const numAmount = parseFloat(amount);
      const currentPrice = prices[selectedPair];

      if (!currentPrice) {
        throw new Error("Current price not available");
      }

      if (parseFloat(total) > (walletData.cashBalance || 0)) {
        throw new Error("Insufficient USDT balance");
      }

      await cryptoService.buyCrypto({
        userId: walletData.userId,
        walletId: walletData.walletId,
        symbol: selectedPair,
        amount: numAmount,
      });

      // Refresh wallet data
      const updatedWallet = await cryptoService.getWalletData();
      setWalletData(updatedWallet);
      setAmount("");
      setTotal("");
    } catch (err) {
      console.error("Buy error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to execute buy order"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!amount || !total) {
        throw new Error("Please enter amount and total");
      }

      if (!walletData?.userId) {
        throw new Error("User data not found. Please log in again.");
      }

      // Parse and validate amount
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Invalid amount. Please enter a valid number");
      }

      // Format to a reasonable number of decimal places based on the trading pair
      const formattedAmount = Number(numAmount.toFixed(8));

      const holding = walletData.holdings?.find(
        (h) => h.symbol === selectedPair
      );

      if (!holding) {
        throw new Error(`No ${selectedPair} holdings found`);
      }

      // Parse holding amount and ensure it's a valid number
      const currentHoldingAmount = parseFloat(holding.amount.toString());
      if (isNaN(currentHoldingAmount)) {
        throw new Error("Invalid holding amount in wallet");
      }

      if (formattedAmount > currentHoldingAmount) {
        throw new Error(
          `Insufficient ${selectedPair.replace(
            "USDT",
            ""
          )} balance. You have: ${currentHoldingAmount}`
        );
      }

      // Send the formatted amount to the service
      await cryptoService.sellCrypto({
        userId: walletData.userId,
        walletId: walletData.walletId,
        symbol: selectedPair,
        amount: formattedAmount  // Send the properly formatted number
      });

      // Refresh wallet data
      const updatedWallet = await cryptoService.getWalletData();
      setWalletData(updatedWallet);
      setAmount("");
      setTotal("");
    } catch (err) {
      console.error("Sell error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to execute sell order"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleAmountChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const formattedValue = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitizedValue;

    // Convert to number and validate
    const numValue = parseFloat(formattedValue);
    if (!isNaN(numValue) || formattedValue === "") {
      setAmount(formattedValue);
      const currentPrice = prices[selectedPair] || 0;
      const calculatedTotal = (parseFloat(formattedValue || "0") * currentPrice);
      setTotal(calculatedTotal.toFixed(2));
    }
  };

  const handleTotalChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const formattedValue = parts.length > 2 
      ? `${parts[0]}.${parts.slice(1).join('')}`
      : sanitizedValue;

    setTotal(formattedValue);
    const currentPrice = prices[selectedPair] || 0;
    if (currentPrice > 0) {
      const calculatedAmount = (parseFloat(formattedValue || "0") / currentPrice);
      setAmount(calculatedAmount.toFixed(8));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      {/* Left Column - Trading Pairs */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Trading Pairs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {TRADING_PAIRS.map((pair) => (
              <div
                key={pair}
                onClick={() => setSelectedPair(pair)}
                className={`flex justify-between items-center p-3 rounded cursor-pointer hover:bg-gray-100 ${
                  selectedPair === pair ? "bg-gray-100" : ""
                }`}
              >
                <span className="font-medium">{pair}</span>
                <div className="flex flex-col items-end">
                  <span>${prices[pair]?.toFixed(2) || "0.00"}</span>
                  <span
                    className={`text-sm ${
                      (priceChanges[pair] || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {(priceChanges[pair] || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Middle Column - Chart and Trading */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{selectedPair} Chart</CardTitle>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                ${prices[selectedPair]?.toFixed(2) || "0.00"}
              </span>
              <span
                className={`text-sm ${
                  (priceChanges[selectedPair] || 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {(priceChanges[selectedPair] || 0).toFixed(2)}%
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Price Chart */}
          <div className="h-[300px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trading Interface */}
          <Tabs defaultValue="buy">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="buy">Buy</TabsTrigger>
              <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>

            <TabsContent value="buy">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      {selectedPair.replace("USDT", "")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Total</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={total}
                      onChange={(e) => handleTotalChange(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      USDT
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={handleBuy}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Buy"
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="sell">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm">Amount</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      {selectedPair.replace("USDT", "")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">Total</label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={total}
                      onChange={(e) => handleTotalChange(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-2 text-gray-500">
                      USDT
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-red-500 hover:bg-red-600"
                  onClick={handleSell}
                  disabled={loading}
                >
                  {loading ? (
                    <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Sell"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptoTrading;
