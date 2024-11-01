import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockChartData } from "@/data/mockData";

export const ChartAnalysis = () => {
  const [selectedIndicator, setSelectedIndicator] = useState("price");
  const [timeframe, setTimeframe] = useState("1D");

  const chartVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
    },
  };

  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className="bg-[#181A20] p-8 rounded-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#F0B90B]">
          Interactive Chart Analysis
        </h2>
        <div className="flex space-x-2">
          {["1H", "4H", "1D", "1W"].map((tf) => (
            <motion.button
              key={tf}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded ${
                timeframe === tf
                  ? "bg-[#F0B90B] text-black"
                  : "bg-[#2B2F36] text-white"
              }`}
            >
              {tf}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2F36" />
            <XAxis dataKey="date" stroke="#848E9C" />
            <YAxis stroke="#848E9C" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#181A20",
                border: "1px solid #2B2F36",
              }}
              labelStyle={{ color: "#F0B90B" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#F0B90B"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="ma7"
              stroke="#E6007A"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="ma25"
              stroke="#13C2C2"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold text-white mb-4">
          Technical Indicators
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {["RSI", "MACD", "Bollinger Bands"].map((indicator) => (
            <motion.div
              key={indicator}
              whileHover={{ scale: 1.02 }}
              className="bg-[#2B2F36] p-4 rounded-lg cursor-pointer"
            >
              <h4 className="text-[#F0B90B] font-medium">{indicator}</h4>
              <p className="text-[#848E9C] text-sm mt-2">
                Click to add {indicator} to the chart
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
