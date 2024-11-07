import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface OrderBook {
  price: number;
  amount: number;
  total: number;
}

interface Trade {
  price: number;
  amount: number;
  time: string;
  type: "buy" | "sell";
}

const Trade = () => {
  const { pair } = useParams();
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [chartData, setChartData] = useState([]);
  const [asks, setAsks] = useState<OrderBook[]>([]);
  const [bids, setBids] = useState<OrderBook[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Mock data generation for demo
    const generateMockData = () => {
      const mockChartData = Array.from({ length: 100 }, (_, i) => ({
        time: new Date(Date.now() - i * 3600000).toISOString(),
        price: 45000 + Math.random() * 1000,
      }));
      setChartData(mockChartData.reverse());

      const mockAsks = Array.from({ length: 10 }, (_, i) => ({
        price: 45000 + i * 10,
        amount: Math.random() * 2,
        total: Math.random() * 50000,
      }));
      setAsks(mockAsks);

      const mockBids = Array.from({ length: 10 }, (_, i) => ({
        price: 44990 - i * 10,
        amount: Math.random() * 2,
        total: Math.random() * 50000,
      }));
      setBids(mockBids);

      const mockTrades = Array.from({ length: 20 }, () => ({
        price: 45000 + (Math.random() - 0.5) * 100,
        amount: Math.random() * 2,
        time: new Date().toLocaleTimeString(),
        type: Math.random() > 0.5 ? "buy" : ("sell" as "buy" | "sell"),
      }));
      setRecentTrades(mockTrades);
    };

    generateMockData();
    const interval = setInterval(generateMockData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement order submission logic
    console.log("Order submitted:", { orderType, side, price, amount });
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#3b82f6"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Order Form */}
        <div className="bg-gray-900 rounded-xl p-4">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setSide("buy")}
                className={`flex-1 py-2 rounded-lg ${
                  side === "buy"
                    ? "bg-green-500 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setSide("sell")}
                className={`flex-1 py-2 rounded-lg ${
                  side === "sell"
                    ? "bg-red-500 text-white"
                    : "bg-gray-800 text-gray-300"
                }`}
              >
                Sell
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-gray-800 rounded-lg p-2 text-white"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-800 rounded-lg p-2 text-white"
                placeholder="0.00"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg ${
                side === "buy"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              } text-white font-medium transition-colors`}
            >
              {side === "buy" ? "Buy" : "Sell"} {pair}
            </button>
          </motion.form>
        </div>

        {/* Order Book */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4">
          <h3 className="text-lg font-medium mb-4">Order Book</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="grid grid-cols-3 text-sm text-gray-400 mb-2">
                <span>Price</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              {asks.map((ask, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 text-sm text-red-500"
                >
                  <span>{ask.price.toFixed(2)}</span>
                  <span>{ask.amount.toFixed(4)}</span>
                  <span>{ask.total.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
            <div>
              {bids.map((bid, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-3 text-sm text-green-500"
                >
                  <span>{bid.price.toFixed(2)}</span>
                  <span>{bid.amount.toFixed(4)}</span>
                  <span>{bid.total.toFixed(2)}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Trades */}
        <div className="bg-gray-900 rounded-xl p-4">
          <h3 className="text-lg font-medium mb-4">Recent Trades</h3>
          <div className="space-y-2">
            {recentTrades.map((trade, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 text-sm"
              >
                <span
                  className={
                    trade.type === "buy" ? "text-green-500" : "text-red-500"
                  }
                >
                  {trade.price.toFixed(2)}
                </span>
                <span className="text-gray-400">{trade.amount.toFixed(4)}</span>
                <span className="text-gray-400">{trade.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;

// import React, { useState, useEffect, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { createChart, ISeriesApi } from "lightweight-charts";
// import { motion } from "framer-motion";

// interface OrderBook {
//   price: number;
//   amount: number;
//   total: number;
// }

// interface Trade {
//   price: number;
//   amount: number;
//   time: string;
//   type: "buy" | "sell";
// }

// const Trade = () => {
//   const { pair } = useParams();
//   const [orderType, setOrderType] = useState<"limit" | "market">("limit");
//   const [side, setSide] = useState<"buy" | "sell">("buy");
//   const [price, setPrice] = useState("");
//   const [amount, setAmount] = useState("");
//   const [asks, setAsks] = useState<OrderBook[]>([]);
//   const [bids, setBids] = useState<OrderBook[]>([]);
//   const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
//   const chartContainerRef = useRef<HTMLDivElement>(null);
//   const [candlestickSeries, setCandlestickSeries] =
//     useState<ISeriesApi<"Candlestick"> | null>(null);

//   // Initialize the chart on mount
//   useEffect(() => {
//     if (chartContainerRef.current) {
//       const chart = createChart(chartContainerRef.current, {
//         width: chartContainerRef.current.clientWidth,
//         height: 400,
//         layout: { backgroundColor: "#000", textColor: "#d1d4dc" },
//         grid: { vertLines: { color: "#444" }, horzLines: { color: "#444" } },
//       });

//       const series = chart.addCandlestickSeries();
//       setCandlestickSeries(series);

//       // Clean up the chart on component unmount
//       return () => chart.remove();
//     }
//   }, []);

//   // Fetch data from backend and set to state
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [chartResponse, orderBookResponse, tradesResponse] =
//           await Promise.all([
//             fetch(`/api/chart/${pair}`),
//             fetch(`/api/orderBook/${pair}`),
//             fetch(`/api/recentTrades/${pair}`),
//           ]);
//         const chartData = await chartResponse.json();
//         const orderBookData = await orderBookResponse.json();
//         const tradesData = await tradesResponse.json();

//         candlestickSeries?.setData(chartData); // Set chart data
//         setAsks(orderBookData.asks);
//         setBids(orderBookData.bids);
//         setRecentTrades(tradesData);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };

//     fetchData();
//     const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds

//     return () => clearInterval(interval);
//   }, [pair, candlestickSeries]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const orderDetails = { orderType, side, price, amount, pair };
//     try {
//       const response = await fetch("/api/placeOrder", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(orderDetails),
//       });
//       if (response.ok) {
//         console.log("Order placed successfully");
//         setPrice("");
//         setAmount("");
//       } else {
//         console.error("Error placing order");
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black pt-16">
//       <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Chart Section */}
//         <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4">
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="h-[400px]"
//           >
//             <div ref={chartContainerRef} className="w-full h-full" />
//           </motion.div>
//         </div>

//         {/* Order Form */}
//         <div className="bg-gray-900 rounded-xl p-4">
//           <motion.form
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             onSubmit={handleSubmit}
//             className="space-y-4"
//           >
//             <div className="flex space-x-2 mb-4">
//               <button
//                 type="button"
//                 onClick={() => setSide("buy")}
//                 className={`flex-1 py-2 rounded-lg ${
//                   side === "buy"
//                     ? "bg-green-500 text-white"
//                     : "bg-gray-800 text-gray-300"
//                 }`}
//               >
//                 Buy
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setSide("sell")}
//                 className={`flex-1 py-2 rounded-lg ${
//                   side === "sell"
//                     ? "bg-red-500 text-white"
//                     : "bg-gray-800 text-gray-300"
//                 }`}
//               >
//                 Sell
//               </button>
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm text-gray-400">Price</label>
//               <input
//                 type="number"
//                 value={price}
//                 onChange={(e) => setPrice(e.target.value)}
//                 className="w-full bg-gray-800 rounded-lg p-2 text-white"
//                 placeholder="0.00"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="block text-sm text-gray-400">Amount</label>
//               <input
//                 type="number"
//                 value={amount}
//                 onChange={(e) => setAmount(e.target.value)}
//                 className="w-full bg-gray-800 rounded-lg p-2 text-white"
//                 placeholder="0.00"
//               />
//             </div>

//             <button
//               type="submit"
//               className={`w-full py-3 rounded-lg ${
//                 side === "buy"
//                   ? "bg-green-500 hover:bg-green-600"
//                   : "bg-red-500 hover:bg-red-600"
//               } text-white font-medium transition-colors`}
//             >
//               {side === "buy" ? "Buy" : "Sell"} {pair}
//             </button>
//           </motion.form>
//         </div>

//         {/* Order Book */}
//         <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4">
//           <h3 className="text-lg font-medium mb-4">Order Book</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="grid grid-cols-3 text-sm text-gray-400 mb-2">
//                 <span>Price</span>
//                 <span>Amount</span>
//                 <span>Total</span>
//               </div>
//               {asks.map((ask, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="grid grid-cols-3 text-sm text-red-500"
//                 >
//                   <span>{ask.price.toFixed(2)}</span>
//                   <span>{ask.amount.toFixed(4)}</span>
//                   <span>{ask.total.toFixed(2)}</span>
//                 </motion.div>
//               ))}
//             </div>
//             <div>
//               {bids.map((bid, i) => (
//                 <motion.div
//                   key={i}
//                   initial={{ opacity: 0 }}
//                   animate={{ opacity: 1 }}
//                   className="grid grid-cols-3 text-sm text-green-500"
//                 >
//                   <span>{bid.price.toFixed(2)}</span>
//                   <span>{bid.amount.toFixed(4)}</span>
//                   <span>{bid.total.toFixed(2)}</span>
//                 </motion.div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Recent Trades */}
//         <div className="bg-gray-900 rounded-xl p-4">
//           <h3 className="text-lg font-medium mb-4">Recent Trades</h3>
//           <div className="space-y-2">
//             {recentTrades.map((trade, i) => (
//               <motion.div
//                 key={i}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="grid grid-cols-3 text-sm"
//               >
//                 <span
//                   className={
//                     trade.type === "buy" ? "text-green-500" : "text-red-500"
//                   }
//                 >
//                   {trade.price.toFixed(2)}
//                 </span>
//                 <span className="text-gray-400">{trade.amount.toFixed(4)}</span>
//                 <span className="text-gray-400">{trade.time}</span>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Trade;
