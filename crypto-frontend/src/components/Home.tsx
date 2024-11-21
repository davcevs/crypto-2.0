import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  ChevronRight,
  ArrowUpRight,
  Star,
  Smartphone,
  Wallet,
  CreditCard,
} from "lucide-react";
import DetailedCryptoChart from "./DetailedCryptoChart";
import LatestCryptoNews from "./LatestCryptoNews";
import TopCryptocurrencies from "./TopCryptocurrencies";
import TradingTools from "./TradingTools";
import { Link } from "react-router-dom";

// Binance Color Constants
const COLORS = {
  PRIMARY_YELLOW: "#F0B90B",
  BACKGROUND_DARK: "#181A20",
  BACKGROUND_ACCENT: "#1E2026",
  TEXT_WHITE: "#FFFFFF",
  TEXT_GRAY: "#848E9C",
};

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("trade");

  const statsData = [
    {
      icon: <TrendingUp className="text-[#F0B90B]" />,
      value: "$76.4B",
      label: "24h Trading Volume",
    },
    {
      icon: <Wallet className="text-green-400" />,
      value: "108M+",
      label: "Registered Users",
    },
    {
      icon: <Shield className="text-purple-400" />,
      value: "350+",
      label: "Crypto Assets",
    },
  ];

  const tradeSteps = [
    {
      icon: Wallet,
      title: "Create Account",
      desc: "Quick and secure verification process",
      color: COLORS.BACKGROUND_ACCENT,
      textColor: "text-[#F0B90B]",
    },
    {
      icon: CreditCard,
      title: "Add Funds",
      desc: "Multiple payment methods supported",
      color: COLORS.BACKGROUND_ACCENT,
      textColor: "text-[#F0B90B]",
    },
    {
      icon: TrendingUp,
      title: "Start Trading",
      desc: "Trade 350+ cryptocurrencies",
      color: COLORS.BACKGROUND_ACCENT,
      textColor: "text-[#F0B90B]",
    },
  ];

  return (
    <div className="bg-[#181A20] text-gray-900">
      <div className="relative bg-gradient-to-br from-[#1E2026] to-[#181A20] py-16 overflow-hidden">
        <div className="container mx-auto px-4 space-y-8">
          {/* Text Row */}
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-6 text-white"
            >
              Your Gateway to
              <span className="text-[#F0B90B] ml-3">Crypto Excellence</span>
            </motion.h1>

            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Secure, fast, and reliable cryptocurrency trading platform with
              advanced tools for both beginners and professionals.
            </p>

            <div className="flex justify-center space-x-4 mb-8">
              <button className="px-8 py-3 bg-[#F0B90B] text-black rounded-lg hover:opacity-90 transition flex items-center gap-2 group">
                Get Started
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-3 border border-[#F0B90B] text-[#F0B90B] rounded-lg hover:bg-[#1E2026] transition">
                Learn More
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-[#1E2026] shadow-lg rounded-xl p-6 text-center border border-[#2E3136] hover:border-[#F0B90B] transition-all"
              >
                <div className="flex justify-center mb-4">{stat.icon}</div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Trading Interface Row */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1E2026] shadow-2xl rounded-2xl p-6 border border-[#2E3136]">
              <div className="flex mb-4 border-b border-[#2E3136]">
                {["trade", "earn", "invest"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-[#F0B90B] text-[#F0B90B]"
                        : "text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {activeTab === "trade" && (
                <div>
                  <DetailedCryptoChart symbol="BTCUSDT" />
                  <div className="mt-4">
                    <Link to="/trade/btc-usdt">
                      <button className="w-full bg-[#F0B90B] text-black py-3 rounded-lg hover:opacity-90 transition">
                        Start Trading
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Background Glow Effects */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(240,185,11,0.1)_0%,_transparent_70%)] opacity-50"></div>
        </div>
      </div>
      {/* Full-Width Top Cryptocurrencies Section */}
      <section className="bg-[#1E2026] py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">
              Top Cryptocurrencies
            </h2>
            <Link to={"/markets"}>
              <button className="text-[#F0B90B] hover:opacity-80 flex items-center">
                View All <ChevronRight className="ml-2" />
              </button>
            </Link>
          </div>
          <TopCryptocurrencies />
        </div>
      </section>

      {/* Trading Steps */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Start Trading in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-300">
            Join millions of users in the most secure crypto trading platform
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tradeSteps.map((step, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -10 }}
              className={`${step.color} p-6 rounded-2xl shadow-md transition hover:shadow-xl`}
            >
              <div
                className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${step.color}`}
              >
                <step.icon className={`w-8 h-8 ${step.textColor}`} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-white">
                {step.title}
              </h3>
              <p className="text-gray-300">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-white">
              Advanced Trading Tools
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Powerful features designed for traders of all levels, from
              beginners to professionals.
            </p>
            <div className="space-y-4">
              {[
                {
                  icon: Star,
                  title: "Professional Charting",
                  desc: "Advanced technical analysis tools",
                },
                {
                  icon: Smartphone,
                  title: "Mobile Trading",
                  desc: "Trade on-the-go with our mobile app",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-[#1E2026] rounded-lg"
                >
                  <feature.icon className="w-8 h-8 text-[#F0B90B]" />
                  <div>
                    <h3 className="font-bold text-white">{feature.title}</h3>
                    <p className="text-gray-300">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <TradingTools />
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-[#1E2026] py-16 w-[85%] mx-auto">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-white">
            Latest Crypto News
          </h2>
          <LatestCryptoNews />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
