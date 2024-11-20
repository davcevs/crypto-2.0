import React, { useState, useEffect } from "react";
import { login, getCurrentUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      navigate("/markets");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // The login function already handles token and user storage
      await login(email, password);

      // After successful login, navigate to markets
      navigate("/markets");
    } catch (error) {
      console.error("Login failed", error);
      setLoginError("Invalid email or password.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

        {loginError && (
          <p className="text-red-500 mb-4 text-center">{loginError}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
