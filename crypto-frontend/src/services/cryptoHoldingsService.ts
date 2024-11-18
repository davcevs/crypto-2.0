import axios, { AxiosError, AxiosInstance } from "axios";
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
  price: number; // Make price required, not optional
}

class CryptoHoldingsService {
  private static instance: CryptoHoldingsService;
  private apiUrl: string;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          window.dispatchEvent(new Event("UNAUTHORIZED"));
        }
        return Promise.reject(error);
      }
    );
  }

  public static getInstance(): CryptoHoldingsService {
    if (!CryptoHoldingsService.instance) {
      CryptoHoldingsService.instance = new CryptoHoldingsService();
    }
    return CryptoHoldingsService.instance;
  }

  async getCryptoHoldings(walletId: string): Promise<CryptoHolding[]> {
    try {
      const response = await this.axiosInstance.get<CryptoHoldingsResponse>(
        `/crypto-holdings/${walletId}/holdings`
      );
      return response.data.holdings;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      if (axiosError.response?.status === 401) {
        throw new Error("Unauthorized: Please log in again");
      }
      if (axiosError.response) {
        throw new Error(
          axiosError.response.data.message || "Failed to fetch crypto holdings"
        );
      }
      throw new Error("Failed to fetch crypto holdings");
    }
  }

  async updateHolding({
    walletId,
    symbol,
    amount,
    transactionType,
    price,
  }: UpdateHoldingDto): Promise<CryptoHolding> {
    try {
      console.log('Updating holding with:', {
        walletId,
        symbol,
        amount,
        transactionType,
        price,
      });

      const response = await this.axiosInstance.put(
        `/crypto-holdings/${walletId}/holdings/${symbol}`,
        {
          amount,
          price,
          type: transactionType,
        }
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      console.error('Update holding error:', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      if (axiosError.response?.status === 401) {
        throw new Error("Unauthorized: Please log in again");
      }
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error("Failed to update crypto holding");
    }
  }
}

export default CryptoHoldingsService.getInstance();
