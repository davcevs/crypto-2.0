// DashboardLogic.ts
import { useEffect, useState, useCallback } from "react";
import { getWallet, getWalletStats } from "../services/walletService";
import { useNavigate } from "react-router-dom";
import { WalletData, WalletStats } from "../interfaces/WalletInterfaces";
import { getCurrentUser } from "../services/authService";

const DashboardLogic = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const checkAuth = useCallback(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
      return false;
    }
    return true;
  }, [navigate]);

  const fetchWalletData = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      const [walletData, walletStats] = await Promise.all([
        getWallet(),
        getWalletStats().catch(() => null),
      ]);

      setWallet(walletData);
      setStats(walletStats);
      setError(null);
    } catch (err: any) {
      console.error("Dashboard error:", err);

      let errorMessage = "An error occurred while fetching your wallet.";

      if (err.response?.status === 404) {
        errorMessage =
          "Wallet not found. Please ensure you have created a wallet.";
      } else if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, checkAuth]);

  // Add storage event listener to handle login/logout
  useEffect(() => {
    const handleStorageChange = () => {
      if (!getCurrentUser()) {
        navigate("/login");
      } else {
        fetchWalletData();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Initial check
    if (!checkAuth()) return;
    fetchWalletData();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, fetchWalletData, checkAuth]);

  return { wallet, stats, loading, error, fetchWalletData };
};

export default DashboardLogic;
