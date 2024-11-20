import { useState, useEffect } from 'react';
import axiosInstance from '@/common/axios-instance';
import { WalletData, ApiError } from './../interfaces/WalletInterfaces';
import { User } from '@/interfaces/UserInterface';

export const useWallet = (user: User | null) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [error, setError] = useState<string>("");
  const [isFetchingWallet, setIsFetchingWallet] = useState<boolean>(true);

  const fetchWallet = async (userId: string, walletId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found");
      setIsFetchingWallet(false);
      return;
    }

    try {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axiosInstance.get<WalletData>(`/wallet/user/${walletId}`);

      if (response.data) {
        setWallet(response.data);
        setError("");
      } else {
        throw new Error("No wallet data received");
      }
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else if (apiError.response?.status === 404) {
        setError("Wallet not found. Please contact support.");
      } else {
        setError(apiError.message || "Failed to fetch wallet data. Please try again.");
      }
    } finally {
      setIsFetchingWallet(false);
    }
  };

  useEffect(() => {
    if (user?.walletId) {
      fetchWallet(user.id, user.walletId);
    }
  }, [user]);

  return { wallet, error, isFetchingWallet, fetchWallet };
};