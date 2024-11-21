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

// Binance Color Constants (matching HomePage)
const COLORS = {
  PRIMARY_YELLOW: "#F0B90B",
  BACKGROUND_DARK: "#181A20",
  BACKGROUND_ACCENT: "#1E2026",
  TEXT_WHITE: "#FFFFFF",
  TEXT_GRAY: "#848E9C",
};

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
      color: COLORS.PRIMARY_YELLOW,
    },
    {
      icon: Clock,
      title: "24/7 Trading",
      desc: "Round-the-clock access to global markets",
      color: COLORS.PRIMARY_YELLOW,
    },
    {
      icon: Shield,
      title: "Secure Trading",
      desc: "Multi-layer security architecture",
      color: COLORS.PRIMARY_YELLOW,
    },
  ];

  return (
    <section className="bg-[#181A20] py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-bold text-white">
              Professional Trading Tools
            </h2>
            <p className="text-gray-300 text-xl leading-relaxed">
              Access advanced charting, real-time market data, and powerful
              trading features designed for both beginners and experts.
            </p>
            <div className="h-64 bg-[#1E2026] rounded-2xl p-4 shadow-2xl border border-[#2E3136]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: COLORS.BACKGROUND_ACCENT,
                      border: "1px solid #2E3136",
                      borderRadius: "8px",
                      color: COLORS.TEXT_WHITE,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.PRIMARY_YELLOW}
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
                whileHover={{ y: -10 }}
                className="flex gap-6 p-6 bg-[#1E2026] rounded-2xl border border-[#2E3136] hover:border-[#F0B90B] transition-all"
              >
                <feature.icon
                  className={`w-10 h-10 text-[#F0B90B] flex-shrink-0`}
                  strokeWidth={2}
                />
                <div>
                  <h3 className="font-bold text-lg mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300">{feature.desc}</p>
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
