import axios, { AxiosError } from "axios";
import {
  CryptoHolding,
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
  private static instance: CryptoHoldingsService;
  private apiUrl: string;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  }

  public static getInstance(): CryptoHoldingsService {
    if (!CryptoHoldingsService.instance) {
      CryptoHoldingsService.instance = new CryptoHoldingsService();
    }
    return CryptoHoldingsService.instance;
  }

  async getCryptoHoldings(walletId: string): Promise<CryptoHolding[]> {
    try {
      // Get holdings directly from the crypto-holdings endpoint
      const response = await axios.get<CryptoHoldingsResponse>(
        `${this.apiUrl}/crypto-holdings/${walletId}/holdings`
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
      // Get current holdings directly using walletId
      const currentHoldings = await this.getCryptoHoldings(data.walletId);
      const existingHolding = currentHoldings.find(
        (h) =>
          h.symbol.toUpperCase() ===
          data.symbol.replace("USDT", "").toUpperCase()
      );

      let updatedAmount: number;

      if (data.transactionType === "BUY") {
        // For buying, add to existing amount or start with the purchase amount
        updatedAmount = (existingHolding?.amount || 0) + data.amount;
      } else {
        // For selling, check if we have enough balance
        if (!existingHolding || existingHolding.amount < data.amount) {
          throw new Error(
            `Insufficient ${data.symbol.replace(
              "USDT",
              ""
            )} balance. Available: ${existingHolding?.amount || 0}`
          );
        }
        updatedAmount = existingHolding.amount - data.amount;
      }

      // Update the holding through the API
      const response = await axios.put<CryptoHolding>(
        `${this.apiUrl}/crypto-holdings/${
          data.walletId
        }/holdings/${data.symbol.replace("USDT", "")}`,
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
}

export default CryptoHoldingsService.getInstance();
