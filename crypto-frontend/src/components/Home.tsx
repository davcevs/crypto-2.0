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

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("trade");

  const statsData = [
    {
      icon: <TrendingUp className="text-blue-600" />,
      value: "$76.4B",
      label: "24h Trading Volume",
    },
    {
      icon: <Wallet className="text-green-600" />,
      value: "108M+",
      label: "Registered Users",
    },
    {
      icon: <Shield className="text-purple-600" />,
      value: "350+",
      label: "Crypto Assets",
    },
  ];

  const tradeSteps = [
    {
      icon: Wallet,
      title: "Create Account",
      desc: "Quick and secure verification process",
      color: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      icon: CreditCard,
      title: "Add Funds",
      desc: "Multiple payment methods supported",
      color: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      icon: TrendingUp,
      title: "Start Trading",
      desc: "Trade 350+ cryptocurrencies",
      color: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side Content */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold mb-6 text-gray-900"
            >
              Your Gateway to
              <span className="text-blue-600"> Crypto Excellence</span>
            </motion.h1>

            <p className="text-xl text-gray-600 mb-8">
              Secure, fast, and reliable cryptocurrency trading platform with
              advanced tools for both beginners and professionals.
            </p>

            <div className="flex space-x-4">
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
                Get Started <ArrowUpRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                Learn More
              </button>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4">
              {statsData.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-4 text-center"
                >
                  <div className="flex justify-center mb-2">{stat.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Interface Preview */}
          <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100">
            <div className="flex mb-4 border-b">
              {["trade", "earn", "invest"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-500"
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
                    <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
                      Start Trading
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-Width Top Cryptocurrencies Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              Top Cryptocurrencies
            </h2>
            <Link to={"/markets"}>
              <button className="text-blue-600 hover:text-blue-700 flex items-center">
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Start Trading in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600">
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
              <h3 className="text-xl font-bold mb-2 text-gray-900">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Additional Sections */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-900">
              Advanced Trading Tools
            </h2>
            <p className="text-xl text-gray-600 mb-8">
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
                  className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg"
                >
                  <feature.icon className="w-8 h-8 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
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
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Latest Crypto News
          </h2>
          <LatestCryptoNews />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;

// Footer Component
const Footer = () => (
  <footer className="bg-white border-t py-12">
    <div className="container mx-auto px-4 grid md:grid-cols-4 gap-8">
      <div>
        <h3 className="font-bold mb-4 text-gray-900">Products</h3>
        <ul className="space-y-2 text-gray-600">
          <li>Exchange</li>
          <li>Wallet</li>
          <li>NFT Marketplace</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-4 text-gray-900">Learn</h3>
        <ul className="space-y-2 text-gray-600">
          <li>Crypto Basics</li>
          <li>Trading Guide</li>
          <li>Market Analysis</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-4 text-gray-900">Company</h3>
        <ul className="space-y-2 text-gray-600">
          <li>About Us</li>
          <li>Careers</li>
          <li>Press</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-4 text-gray-900">Support</h3>
        <ul className="space-y-2 text-gray-600">
          <li>Help Center</li>
          <li>Contact Us</li>
          <li>Security</li>
        </ul>
      </div>
    </div>
    <div className="container mx-auto px-4 mt-8 text-center text-gray-500 border-t pt-4">
      © 2024 Crypto Exchange. All Rights Reserved.
    </div>
  </footer>
);
