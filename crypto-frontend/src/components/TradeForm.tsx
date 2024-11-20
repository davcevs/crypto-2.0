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
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <Input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="0"
        step="0.00000001"
      />

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
  );
};
