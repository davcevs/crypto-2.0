// HeroSection.tsx
import React from "react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className="container mx-auto px-4 py-16 text-center"
  >
    <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
      Crypto Simplified
    </h1>
    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
      Trade, track, and transform your digital assets with unparalleled security
      and simplicity.
    </p>
    <div className="flex justify-center space-x-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold"
      >
        Start Trading
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold"
      >
        Learn More
      </motion.button>
    </div>
  </motion.div>
);

export default HeroSection;
