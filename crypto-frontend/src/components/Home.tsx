import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Shield,
  ChevronRight,
  ArrowUpRight,
  BookOpen,
  Gift,
  Wallet,
  Clock,
  DollarSign,
  Lock,
} from "lucide-react";
import DetailedCryptoChart from "./DetailedCryptoChart";
import Features from "./Features";
import LatestCryptoNews from "./LatestCryptoNews";
import TopCryptocurrencies from "./TopCryptocurrencies";
import { Link } from "react-router-dom";

const HomePage: React.FC = () => {
  const [marketStats, setMarketStats] = useState({
    totalVolume: "76.4B",
    activeUsers: "108M+",
    countries: "180+",
    assets: "350+",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-bold mb-6"
            >
              The World's Leading
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {" "}
                Crypto Exchange
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-400 mb-8"
            >
              Buy, trade, and hold 350+ cryptocurrencies with confidence on our
              secure platform.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4"
            >
              <button className="px-8 py-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-2">
                Get Started <ArrowUpRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-4 border border-gray-700 rounded-lg hover:bg-gray-800 transition-all">
                Download App
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Market Trends</h2>
            <Link
              to="/markets"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              View all markets <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <TopCryptocurrencies />
        </div>
      </section>

      {/* Advanced Trading Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Professional Trading Tools
              </h2>
              <p className="text-gray-400 mb-8">
                Advanced charting, order types, and trading features for both
                beginners and experts.
              </p>
              <DetailedCryptoChart symbol="BTCUSDT" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {[
                {
                  icon: TrendingUp,
                  title: "Advanced Charts",
                  desc: "Professional-grade technical analysis tools",
                },
                {
                  icon: Clock,
                  title: "24/7 Trading",
                  desc: "Round-the-clock access to global markets",
                },
                {
                  icon: Shield,
                  title: "Secure Trading",
                  desc: "Multi-layer security architecture",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 10 }}
                  className="flex gap-4 p-6 bg-gray-800 rounded-xl"
                >
                  <feature.icon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Start Trading Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Start Trading in Minutes
            </h2>
            <p className="text-gray-400">
              Quick and secure way to buy, sell and trade cryptocurrency
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wallet,
                title: "Create Account",
                desc: "Complete verification in minutes",
              },
              {
                icon: DollarSign,
                title: "Fund Account",
                desc: "Add funds using multiple payment methods",
              },
              {
                icon: TrendingUp,
                title: "Start Trading",
                desc: "Buy, sell and trade crypto assets",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10 }}
                className="relative p-8 bg-gray-800 rounded-xl"
              >
                <div className="absolute top-4 right-4 text-6xl font-bold text-gray-700/20">
                  {index + 1}
                </div>
                <step.icon className="w-12 h-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Trade Anywhere</h2>
              <p className="text-gray-400 mb-8">
                Download our mobile app to access your portfolio, trade, and
                manage your assets on the go.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/api/placeholder/160/48"
                  alt="App Store"
                  className="h-12 cursor-pointer"
                />
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src="/api/placeholder/160/48"
                  alt="Google Play"
                  className="h-12 cursor-pointer"
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-purple-500/20 blur-3xl" />
              <img
                src="/api/placeholder/300/600"
                alt="Mobile App"
                className="relative z-10 mx-auto"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Latest News</h2>
            <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              View all news <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <LatestCryptoNews />
        </div>
      </section>

      {/* Academy Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Crypto Academy</h2>
              <p className="text-gray-400 mb-8">
                Learn and earn rewards through our comprehensive educational
                platform. Master cryptocurrency trading while earning NFTs and
                tokens.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: BookOpen,
                    title: "Interactive Courses",
                    desc: "Learn from industry experts",
                  },
                  {
                    icon: Gift,
                    title: "Earn NFTs",
                    desc: "Get rewarded for your progress",
                  },
                  {
                    icon: Lock,
                    title: "Exclusive Content",
                    desc: "Access premium trading insights",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 10 }}
                    className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg"
                  >
                    <feature.icon className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="font-bold">{feature.title}</h3>
                      <p className="text-sm text-gray-400">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 p-8 rounded-2xl"
            >
              <img
                src="/api/placeholder/500/300"
                alt="Academy Preview"
                className="rounded-lg mb-6"
              />
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-bold">Trading Fundamentals</h3>
                  <p className="text-sm text-gray-400">8 Lessons • 2 Hours</p>
                </div>
                <button className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                  Start Learning
                </button>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "30%" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-900">
        <div className="container mx-auto px-4">
          <Features />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
