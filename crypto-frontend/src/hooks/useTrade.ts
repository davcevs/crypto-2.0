// hooks/useTrade.ts
import { useState } from 'react';
import axiosInstance from '@/common/axios-instance';
import { TradePayload, ApiError } from './../interfaces/WalletInterfaces';
import { User } from '@/interfaces/UserInterface';

export const useTrade = (user: User | null, onSuccess?: () => void) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const executeTrade = async (
    tradeType: "buy" | "sell",
    symbol: string,
    amount: string
  ): Promise<boolean> => {
    if (!user?.id || !user?.walletId) {
      setError("User not authenticated or invalid user data.");
      return false;
    }

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const payload: TradePayload = {
        userId: user.id,
        walletId: user.walletId,
        symbol: `${symbol}USDT`,
        amount: parseFloat(amount),
      };

      const response = await axiosInstance.post(
        `/wallet/${user.id}/${tradeType}`,
        payload
      );

      if (response.data.success) {
        onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.response?.data?.message ||
        apiError.message ||
        `Failed to ${tradeType} crypto`
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { executeTrade, loading, error };
};