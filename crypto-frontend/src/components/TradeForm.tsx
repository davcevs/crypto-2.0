import React, { useState } from "react";
import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TradeFormProps {
  onSubmit: (
    tradeType: "buy" | "sell",
    symbol: string,
    amount: string
  ) => Promise<void>;
  onSymbolChange: (symbol: string) => void;
  loading: boolean;
  currentPrice: number | null;
}

export const TradeForm: React.FC<TradeFormProps> = ({
  onSubmit,
  onSymbolChange,
  loading,
  currentPrice,
}) => {
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");
  const [symbol, setSymbol] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const supportedSymbols = ["BTC", "ETH", "BNB", "SOL", "DOT"];
  const estimatedTotal = currentPrice
    ? (parseFloat(amount || "0") * currentPrice).toFixed(2)
    : "0.00";

  const handleSymbolChange = (value: string) => {
    setSymbol(value);
    onSymbolChange(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(tradeType, symbol, amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex bg-[#2B3139] rounded-lg p-1">
        <Button
          type="button"
          variant="ghost"
          className={`flex-1 rounded-md ${
            tradeType === "buy"
              ? "bg-green-500 text-white hover:bg-green-600"
              : "text-gray-400 hover:text-white hover:bg-[#363C45]"
          }`}
          onClick={() => setTradeType("buy")}
        >
          Buy
        </Button>
        <Button
          type="button"
          variant="ghost"
          className={`flex-1 rounded-md ${
            tradeType === "sell"
              ? "bg-red-500 text-white hover:bg-red-600"
              : "text-gray-400 hover:text-white hover:bg-[#363C45]"
          }`}
          onClick={() => setTradeType("sell")}
        >
          Sell
        </Button>
      </div>

      <div className="space-y-4">
        <Select value={symbol} onValueChange={handleSymbolChange}>
          <SelectTrigger className="w-full bg-[#2B3139] border-0 text-white hover:bg-[#363C45] focus:ring-1 focus:ring-yellow-500">
            <SelectValue placeholder="Select Crypto" />
          </SelectTrigger>
          <SelectContent className="bg-[#2B3139] border-gray-700">
            {supportedSymbols.map((sym) => (
              <SelectItem
                key={sym}
                value={sym}
                className="text-white hover:bg-[#363C45] focus:bg-[#363C45] focus:text-white"
              >
                {sym}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Amount</span>
            <span>Available: 0.00 USDT</span>
          </div>
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.00000001"
            className="bg-[#2B3139] border-0 text-white placeholder-gray-500 focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        <div className="space-y-3">
          {currentPrice && (
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>Current Price</span>
              <span className="text-white">${currentPrice.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm text-gray-400">
            <span>Estimated Total</span>
            <span className="text-white">
              <DollarSign className="w-4 h-4 inline" />
              {estimatedTotal}
            </span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className={`w-full h-12 font-bold ${
          tradeType === "buy"
            ? "bg-green-500 hover:bg-green-600"
            : "bg-red-500 hover:bg-red-600"
        }`}
        disabled={!symbol || !amount || loading || !currentPrice}
      >
        {loading
          ? "Processing..."
          : `${tradeType.toUpperCase()} ${symbol || "Crypto"}`}
      </Button>

      <div className="grid grid-cols-4 gap-2 pt-4">
        {[25, 50, 75, 100].map((percentage) => (
          <button
            key={percentage}
            type="button"
            className="p-1 text-sm bg-[#2B3139] text-gray-400 rounded hover:bg-[#363C45] hover:text-white"
            onClick={() => {
              // Add percentage calculation logic here if needed
            }}
          >
            {percentage}%
          </button>
        ))}
      </div>
    </form>
  );
};
