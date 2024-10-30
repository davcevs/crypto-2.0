import { useState } from "react";
import { motion } from "framer-motion";

interface CryptoData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

const Markets = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([
    {
      symbol: "BTC/USDT",
      price: 65000,
      change24h: 2.5,
      volume24h: 1200000000,
      marketCap: 1200000000000,
    },
    // Add more mock data as needed
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "price",
    direction: "desc",
  });

  const filteredData = cryptoData.filter((crypto) =>
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (
      a[sortConfig.key as keyof CryptoData] <
      b[sortConfig.key as keyof CryptoData]
    ) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (
      a[sortConfig.key as keyof CryptoData] >
      b[sortConfig.key as keyof CryptoData]
    ) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Crypto Markets</h1>
        <input
          type="text"
          placeholder="Search markets..."
          className="w-full max-w-md px-4 py-2 rounded bg-gray-800 text-white border border-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-700">
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("symbol")}
              >
                Pair
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("change24h")}
              >
                24h Change
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("volume24h")}
              >
                24h Volume
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("marketCap")}
              >
                Market Cap
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {sortedData.map((crypto, index) => (
              <motion.tr
                key={crypto.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-700 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  {crypto.symbol}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${crypto.price.toLocaleString()}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    crypto.change24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {crypto.change24h > 0 ? "+" : ""}
                  {crypto.change24h}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${crypto.volume24h.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  ${crypto.marketCap.toLocaleString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Markets;
