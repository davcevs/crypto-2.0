import { WalletData } from "@/interfaces/WalletInterfaces";
import axios from "axios";

const API_URL = "http://localhost:3000";

export interface BuyRequestPayload {
  symbol: string;
  amount: number;
  walletId: string;
  userId: string;
}

export interface CryptoTransaction {
  symbol: string;
  amount: number;
}

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  validateStatus: (status) => status < 500,
});

// Add request interceptor for auth and debugging
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(
    "Request:",
    config.method?.toUpperCase(),
    config.url,
    config.data
  );
  return config;
});

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export const getWallet = async (): Promise<WalletData> => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const user = userData.user;

  if (!token || !user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axiosInstance.get(`/wallet/${user.id}`);

    if (!response.data || !response.data.walletId) {
      throw new Error(
        "Wallet not found. Please ensure you have created a wallet."
      );
    }

    return {
      walletId: response.data.walletId,
      balance: response.data.cashBalance,
      holdings: response.data.holdings || [],
      transactions: response.data.transactions || [],
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    if (error.response?.status === 404) {
      throw new Error(
        "Wallet not found. Please ensure you have created a wallet."
      );
    }
    console.error("Error fetching wallet:", error);
    throw error;
  }
};

export const getWalletStats = async () => {
  const token = localStorage.getItem("token");
  const wallet = await getWallet();

  if (!token) {
    throw new Error("Authentication required");
  }

  try {
    const response = await axiosInstance.get(
      `/wallet/${wallet.walletId}/stats`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    }
    console.error("Error fetching wallet stats:", error);
    throw error;
  }
};

export const buyCrypto = async (symbol: string, amount: number) => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !userData.user?.id) {
    throw new Error("Authentication required");
  }

  try {
    const wallet = await getWallet();

    const payload = {
      userId: userData.user.id,
      walletId: wallet.walletId,
      symbol: symbol.toUpperCase(),
      amount: Number(amount),
    };

    console.log("Making buy request with payload:", payload);

    const response = await axiosInstance.post("/wallet/buy", payload);

    console.log("Buy response:", {
      status: response.status,
      headers: response.headers,
      data: response.data,
    });

    if (response.status !== 200 || !response.data.success) {
      throw new Error(
        response.data.message || "Failed to process the buy request"
      );
    }

    return response.data;
  } catch (error: any) {
    console.error("Detailed buy error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      method: error.config?.method,
      payload: error.config?.data,
    });

    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 404) {
      throw new Error(
        "Buy endpoint not found. Please check API configuration."
      );
    } else if (error.response?.status === 400) {
      throw new Error(
        error.response.data.message || "Invalid buy request parameters."
      );
    }

    throw new Error(
      error.response?.data?.message ||
        "Unable to process your trade at this time. Please try again later."
    );
  }
};

export const sellCrypto = async (symbol: string, amount: number) => {
  const token = localStorage.getItem("token");

  try {
    const wallet = await getWallet();

    if (!token || !wallet.walletId) {
      throw new Error("Authentication required");
    }

    const response = await axiosInstance.post(
      `/wallet/${wallet.walletId}/sell`,
      {
        symbol: symbol.toUpperCase(),
        amount: Number(amount),
      }
    );

    if (response.status >= 400) {
      throw new Error(response.data.message || "Failed to sell crypto");
    }

    return response.data;
  } catch (error: any) {
    console.error("Error details for sell crypto:", error.response?.data);
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 400) {
      throw new Error(
        error.response.data.message || "Insufficient crypto balance"
      );
    } else if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(error.message || "Failed to sell crypto");
  }
};

export const updateWallet = async (): Promise<WalletData> => {
  try {
    const wallet = await getWallet();
    return wallet;
  } catch (error) {
    console.error("Error updating wallet:", error);
    throw error;
  }
};

// Add a function to check authentication status
export const checkAuthStatus = (): boolean => {
  const token = localStorage.getItem("token");
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  return !!(token && userData.user?.id);
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
