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

  useEffect(() => {
    fetchCryptoData();
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentPage((prevPage) =>
        (prevPage + 1) * coinsPerPage >= topCoins.length ? 0 : prevPage + 1
      );
    }, 10000);

    return () => clearInterval(slideInterval);
  }, [topCoins]);

  const displayedCoins = topCoins.slice(
    currentPage * coinsPerPage,
    currentPage * coinsPerPage + coinsPerPage
  );

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
    <section className="container mx-auto px-6 py-12 relative bg-[#181A20] rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <motion.button
          onClick={fetchCryptoData}
          whileTap={{ rotate: 180 }}
          className="text-gray-600 hover:text-blue-500 bg-gray-200 p-2 rounded-full shadow-md transition-all duration-300 hover:bg-blue-100"
        >
          <RefreshCcw size={24} />
        </motion.button>
      </div>

      <div className="relative">
        {/* Navigation buttons */}
        <button
          onClick={handlePrevPage}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-3 shadow-lg hover:bg-blue-50 transition-all"
        >
          <ChevronLeft size={24} className="text-blue-500" />
        </button>
        <button
          onClick={handleNextPage}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-3 shadow-lg hover:bg-blue-50 transition-all"
        >
          <ChevronRight size={24} className="text-blue-500" />
        </button>

        {/* Coins Grid with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {displayedCoins.map((coin) => (
              <CryptoCoinCard
                key={coin.symbol}
                coin={coin}
                className="bg-white shadow-lg hover:shadow-xl transition-all rounded-xl p-4 text-gray-800"
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TopCryptocurrencies;
