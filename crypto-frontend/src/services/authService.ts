import axios from "axios";
import { cryptoService } from "./cryptoService";

const API_URL = "http://localhost:3000";

// Helper function to set up authentication
const setupAuthentication = (token: string) => {
  // Set default authorization header for all future axios requests
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  // Set token in cryptoService
  cryptoService.setAuthToken(token);
};

export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });

    if (response.data.access_token && response.data.user) {
      // Store token separately
      localStorage.setItem("token", response.data.access_token);

      // Store user data
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Set up authentication with the new token
      setupAuthentication(response.data.access_token);

      // Notify that user is logged in
      window.dispatchEvent(new Event("storage"));

      return response.data;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username,
      email,
      password,
    });

    // Store token and user separately
    localStorage.setItem("token", response.data.access_token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    // Set up authentication with the new token
    setupAuthentication(response.data.access_token);

    // Notify that user is registered and logged in
    window.dispatchEvent(new Event("storage"));

    return response.data;
  } catch (error) {
    console.error("Registration failed", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  try {
    const userString = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userString || !token) {
      return null;
    }

    // If there's a token, make sure it's set in the services
    setupAuthentication(token);

    return JSON.parse(userString);
  } catch (error) {
    console.error("Error parsing user data:", error);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export const logout = () => {
  // Clear local storage
  localStorage.removeItem("user");
  localStorage.removeItem("token");

  // Clear authentication headers
  delete axios.defaults.headers.common["Authorization"];
  cryptoService.setAuthToken(""); // Clear crypto service token

  // Notify components that user is logged out
  window.dispatchEvent(new Event("storage"));
};

// Initialize authentication on service startup if token exists
const token = localStorage.getItem("token");
if (token) {
  setupAuthentication(token);
}
