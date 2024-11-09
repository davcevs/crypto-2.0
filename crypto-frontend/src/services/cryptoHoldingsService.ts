import axios, { AxiosError } from "axios";
import {
  CryptoHolding,
  WalletData,
  CryptoHoldingsResponse,
  ApiError,
} from "../interfaces/WalletInterfaces";

interface UpdateHoldingDto {
  walletId: string;
  symbol: string;
  amount: number;
  transactionType: "BUY" | "SELL";
}

class CryptoHoldingsService {
  private apiUrl = "/api/crypto-holdings";

  async getCryptoHoldings(): Promise<CryptoHolding[]> {
    try {
      const walletData = await this.getWallet();
      const response = await axios.get<CryptoHoldingsResponse>(
        `${this.apiUrl}/${walletData.id}/holdings`
      );
      return response.data.holdings;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error("Failed to fetch crypto holdings");
    }
  }

  async updateHolding(data: UpdateHoldingDto): Promise<CryptoHolding> {
    try {
      // First get current holding if it exists
      const currentHoldings = await this.getCryptoHoldings();
      const existingHolding = currentHoldings.find(
        (h) => h.symbol === data.symbol
      );

      const updatedAmount =
        data.transactionType === "BUY"
          ? (existingHolding?.amount || 0) + data.amount
          : (existingHolding?.amount || 0) - data.amount;

      if (updatedAmount < 0) {
        throw new Error("Insufficient balance for this sale");
      }

      // Update or create holding
      const response = await axios.put<CryptoHolding>(
        `${this.apiUrl}/${data.walletId}/holdings/${data.symbol}`,
        {
          amount: updatedAmount,
        }
      );

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error("Failed to update crypto holding");
    }
  }

  private async getWallet(): Promise<WalletData> {
    const token = localStorage.getItem("token");
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const user = userData.user;

    if (!token || !user?.id) {
      throw new Error("Authentication required");
    }

    try {
      const response = await axios.get<WalletData>(`/api/wallet/${user.id}`);
      if (!response.data || !response.data.id) {
        throw new Error(
          "Wallet not found. Please ensure you have created a wallet."
        );
      }
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }
      if (axiosError.response?.status === 404) {
        throw new Error(
          "Wallet not found. Please ensure you have created a wallet."
        );
      }
      throw error;
    }
  }
}

export default CryptoHoldingsService;
