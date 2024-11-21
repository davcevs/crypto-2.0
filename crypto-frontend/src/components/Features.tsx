import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, Wallet } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <TrendingUp size={48} className="text-blue-500" />,
      title: "Real-Time Trading",
      desc: "Lightning-fast trades with minimal latency",
      background: "bg-blue-50",
      borderColor: "border-blue-100",
    },
    {
      icon: <ShieldCheck size={48} className="text-green-500" />,
      title: "Maximum Security",
      desc: "Bank-grade encryption and multi-factor authentication",
      background: "bg-green-50",
      borderColor: "border-green-100",
    },
    {
      icon: <Wallet size={48} className="text-purple-500" />,
      title: "Portfolio Management",
      desc: "Advanced tracking and insights for your investments",
      background: "bg-purple-50",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Why Choose Us
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10, scale: 1.05 }}
              className={`${feature.background} ${feature.borderColor} border rounded-2xl p-8 text-center shadow-md transition-all`}
            >
              <div className="flex justify-center mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
