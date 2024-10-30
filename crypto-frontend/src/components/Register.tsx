import React, { useState } from "react";
import { register } from "../services/authService";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState(""); // Add state for username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pass username, email, and password to the register function
      await register(username, email, password);
      navigate("/markets");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="flex justify-center items-center flex-grow">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl mb-4">Register</h2>
          <div className="mb-4">
            <label className="block text-black">Username</label>{" "}
            {/* New username field */}
            <input
              type="text"
              className="border p-2 w-full text-black"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // Add required attribute
            />
          </div>
          <div className="mb-4">
            <label className="block text-black">Email</label>
            <input
              type="email"
              className="border p-2 w-full text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required // Add required attribute
            />
          </div>
          <div className="mb-4">
            <label className="block text-black">Password</label>
            <input
              type="password"
              className="border p-2 w-full text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Add required attribute
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
