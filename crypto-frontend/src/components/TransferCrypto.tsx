import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/interfaces/UserInterface";
import { CryptoHolding, ApiError } from "@/interfaces/WalletInterfaces";
import axiosInstance from "@/common/axios-instance";
import { toast } from "sonner";
import { formatNumber } from "@/common/CurrencyFormatters";

interface TransferCryptoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  holdings: CryptoHolding[];
  selectedCrypto?: string | null;
  onTransferSuccess?: () => void;
}

export const TransferCryptoModal: React.FC<TransferCryptoModalProps> = ({
  isOpen,
  onClose,
  user,
  holdings,
  selectedCrypto: initialSelectedCrypto,
  onTransferSuccess,
}) => {
  const [recipient, setRecipient] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update selected crypto when prop changes
  useEffect(() => {
    setSelectedCrypto(initialSelectedCrypto ?? null);
  }, [initialSelectedCrypto]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setRecipient("");
      setAmount("");
      setError("");
    }
  }, [isOpen]);

  const handleTransfer = async () => {
    // Validate user and walletId
    if (!user || !user.walletId) {
      setError("User information is missing");
      return;
    }

    // Input validation
    if (!recipient) {
      setError("Please enter a username or email");
      return;
    }
    if (!selectedCrypto) {
      setError("Please select a cryptocurrency");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    // Find the selected holding to check balance
    const holding = holdings.find((h) => h.symbol === selectedCrypto);
    if (!holding || holding.amount < parsedAmount) {
      setError("Insufficient balance");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(
        `/wallet/${user.walletId}/transfer`,
        {
          recipient,
          symbol: selectedCrypto,
          amount: parsedAmount,
        }
      );

      if (response.data.success) {
        toast.success("Transfer successful!", {
          description: `Transferred ${parsedAmount} ${selectedCrypto}`,
        });
        onTransferSuccess?.();
        onClose();
      }
    } catch (err) {
      const apiError = err as ApiError;
      console.error("Full Transfer Error:", err);
      const errorMsg = apiError.response?.data?.message || "Transfer failed";
      setError(errorMsg);
      toast.error("Transfer failed", {
        description: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Crypto</DialogTitle>
          <DialogDescription>
            Transfer cryptocurrency to another user
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">Recipient</label>
            <Input
              placeholder="Enter username or email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm">Cryptocurrency</label>
            <Select
              value={selectedCrypto || ""}
              onValueChange={(value) => setSelectedCrypto(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select crypto" />
              </SelectTrigger>
              <SelectContent>
                {holdings.map((holding) => (
                  <SelectItem key={holding.symbol} value={holding.symbol}>
                    {holding.symbol} (Available: {formatNumber(holding.amount)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block mb-2 text-sm">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.00000001"
            />
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleTransfer} disabled={loading}>
            {loading ? "Transferring..." : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
