import React from "react";
import Features from "./Features";
import { motion } from "framer-motion";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center py-20 bg-black"
      >
        <h1 className="text-6xl font-bold tracking-tight">
          Trade Cryptocurrency Effortlessly
        </h1>
        <p className="text-xl mt-4 max-w-xl mx-auto">
          The most secure and seamless platform for crypto trading, now at your
          fingertips.
        </p>
        <div className="mt-8 space-x-4">
          <motion.a
            href="/register"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            whileHover={{ scale: 1.05 }}
          >
            Get Started
          </motion.a>
          <motion.a
            href="/login"
            className="px-8 py-3 bg-gray-700 text-white font-medium rounded hover:bg-gray-800"
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.a>
        </div>
      </motion.div>

      {/* Features Section */}
      <Features />
    </div>
  );
};

export default Home;
