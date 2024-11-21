import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, ChevronRight, ChevronLeft } from "lucide-react";
import { cryptoService, TRADING_PAIRS } from "../services/cryptoService";
import CryptoCoinCard from "./CryptoCoinCard";

const TopCryptocurrencies = () => {
  const [topCoins, setTopCoins] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const coinsPerPage = 8;

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

  // Automatic sliding effect
  useEffect(() => {
    fetchCryptoData();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentPage((prevPage) =>
        (prevPage + 1) * coinsPerPage >= topCoins.length ? 0 : prevPage + 1
      );
    }, 10000); // Slide every 4 seconds

    return () => clearInterval(slideInterval);
  }, [topCoins]);

  // Manually calculate the coins to display
  const displayedCoins = topCoins.slice(
    currentPage * coinsPerPage,
    currentPage * coinsPerPage + coinsPerPage
  );

  // Manual navigation
  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      (prevPage + 1) * coinsPerPage >= topCoins.length ? 0 : prevPage + 1
    );
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) =>
      prevPage === 0 ? Math.floor(topCoins.length / coinsPerPage) : prevPage - 1
    );
  };

  return (
    <section className="container mx-auto px-4 py-12 relative">
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

      <div className="relative">
        {/* Navigation buttons */}
        <button
          onClick={handlePrevPage}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/50 rounded-full p-2 hover:bg-gray-700/50"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleNextPage}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-800/50 rounded-full p-2 hover:bg-gray-700/50"
        >
          <ChevronRight size={24} />
        </button>

        {/* Coins Grid with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {displayedCoins.map((coin) => (
              <CryptoCoinCard key={coin.symbol} coin={coin} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TopCryptocurrencies;
