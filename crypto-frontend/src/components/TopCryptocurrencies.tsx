// TopCryptocurrencies.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { cryptoService, TRADING_PAIRS } from "../services/cryptoService";
import CryptoCoinCard from "./CryptoCoinCard";

const TopCryptocurrencies: React.FC = () => {
  const [topCoins, setTopCoins] = useState([]);

  const fetchCryptoData = async () => {
    const coinData = await Promise.all(
      TRADING_PAIRS.map(async (symbol) => {
        const price = await cryptoService.getPrice(symbol);
        const { priceChange, priceChangePercent } =
          await cryptoService.get24HrChange(symbol);
        return {
          symbol,
          price,
          priceChange,
          priceChangePercent,
          logo: `/logos/${symbol}.svg`,
        };
      })
    );
    setTopCoins(coinData);
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Top Cryptocurrencies</h2>
        <motion.button
          onClick={fetchCryptoData}
          whileTap={{ rotate: 180 }}
          className="text-gray-400 hover:text-white"
        >
          <RefreshCcw size={24} />
        </motion.button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {topCoins.map((coin) => (
          <CryptoCoinCard key={coin.symbol} coin={coin} />
        ))}
      </div>
    </section>
  );
};

export default TopCryptocurrencies;
