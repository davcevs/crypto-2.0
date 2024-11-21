import React from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Shield, Clock } from "lucide-react";

const TradingTools: React.FC = () => {
  // Sample data for the chart
  const data = Array.from({ length: 30 }, (_, i) => ({
    date: i,
    value: 30000 + Math.random() * 5000,
  }));

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced Charts",
      desc: "Professional-grade technical analysis tools",
      color: "text-blue-500",
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      desc: "Round-the-clock access to global markets",
      color: "text-green-500",
    },
    {
      icon: Shield,
      title: "Secure Trading",
      desc: "Multi-layer security architecture",
      color: "text-purple-500",
    },
  ];

  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-gray-900">
              Professional Trading Tools
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Access advanced charting, real-time market data, and powerful
              trading features designed for both beginners and experts.
            </p>
            <div className="h-64 bg-gray-100 rounded-2xl p-4 shadow-md">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #e0e0e0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 10 }}
                className="flex gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all cursor-pointer"
              >
                <feature.icon
                  className={`w-10 h-10 ${feature.color} flex-shrink-0`}
                  strokeWidth={2}
                />
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TradingTools;
