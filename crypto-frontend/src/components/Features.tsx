import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Real-Time Market Data",
    description: "Get live updates on cryptocurrency prices and market trends.",
  },
  {
    title: "Secure Transactions",
    description:
      "State-of-the-art encryption ensures all your transactions are safe.",
  },
  {
    title: "Portfolio Management",
    description: "Easily manage your crypto assets and track performance.",
  },
];

const Features: React.FC = () => {
  return (
    <motion.div
      className="py-16 bg-gray-900"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white text-center">
          Key Features
        </h2>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gray-800 p-6 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-semibold text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Features;
