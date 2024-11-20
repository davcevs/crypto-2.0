import axios from "axios";
import { cryptoService } from "./cryptoService";
import { User } from "@/interfaces/UserInterface";

const API_URL = "http://localhost:3000";

interface LoginResponse {
  access_token: string;
  user: User;
}

// Helper function to set up authentication
const setupAuthentication = (token: string) => {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  cryptoService.setAuthToken(token);
};

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
      email,
      password,
    });

    const { access_token, user } = response.data;

    if (!access_token || !user) {
      throw new Error("Invalid response format from server");
    }

    // Validate required user fields
    if (!user.id || !user.walletId) {
      throw new Error("Incomplete user data received");
    }

    // Store both token and complete user data
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set up authentication with the new token
    setupAuthentication(access_token);

    // Notify that user is logged in
    window.dispatchEvent(new Event("storage"));

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/register`, {
      username,
      email,
      password,
    });

    const { access_token, user } = response.data;

    if (!access_token || !user || !user.id || !user.walletId) {
      throw new Error("Invalid or incomplete response from server");
    }

    // Store both token and user data
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));

    // Set up authentication with the new token
    setupAuthentication(access_token);

    // Notify that user is registered and logged in
    window.dispatchEvent(new Event("storage"));

    return response.data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      return null;
    }

    // First try to get user data from localStorage
    const storedUser = JSON.parse(userStr) as User;

    // If we have complete user data in localStorage, use that
    if (storedUser && storedUser.id && storedUser.walletId) {
      return storedUser;
    }

    // Fallback to token decode if localStorage data is incomplete
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const decodedToken = JSON.parse(jsonPayload);

    // Create user object with data from token
    const user: User = {
      id: decodedToken.id || decodedToken.userId || decodedToken.sub,
      email: decodedToken.email,
      username: decodedToken.username,
      walletId: decodedToken.walletId,
    };

    // Validate required fields
    if (!user.id || !user.walletId) {
      // Clear invalid session data
      logout();
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    logout(); // Clear potentially corrupted data
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  delete axios.defaults.headers.common["Authorization"];
  cryptoService.setAuthToken("");
  window.dispatchEvent(new Event("storage"));
};

// Initialize authentication on service startup if token exists
const token = localStorage.getItem("token");
if (token) {
  setupAuthentication(token);
}

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
  getAuthHeader,
};