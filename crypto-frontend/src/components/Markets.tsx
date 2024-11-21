import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import {
  Search,
  SlidersHorizontal,
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cryptoService, TRADING_PAIRS } from "../services/cryptoService";

interface CryptoData {
  symbol: string;
  price: number;
  priceChangePercent: number;
  volume: number;
  marketCap: number;
  historicalData: Array<{ price: number; time: string }>;
}

const Markets = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "marketCap",
    direction: "desc",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [coinsPerPage] = useState(15); // Number of coins per page

  // Fetch all crypto data
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const data = await Promise.all(
        TRADING_PAIRS.map(async (symbol) => {
          const price = await cryptoService.getPrice(symbol);
          const { priceChangePercent } = await cryptoService.get24HrChange(
            symbol
          );
          const historicalData = await cryptoService.getHistoricalPrices(
            symbol,
            "1h",
            24
          );

          // More realistic volume and market cap calculation
          const volume = price * Math.max(10000, Math.random() * 1000000);
          const marketCap = price * Math.max(1000000, Math.random() * 10000000);

          return {
            symbol,
            price,
            priceChangePercent,
            volume,
            marketCap,
            historicalData,
          };
        })
      );
      setCryptoData(data);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Favorite toggle functionality
  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  // Sort functionality
  const sortData = (key: keyof CryptoData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  // Filter and sort data
  const filteredAndSortedData = [...cryptoData]
    .filter((coin) =>
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.direction === "asc") {
        return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
      }
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    });

  // Pagination logic
  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredAndSortedData.slice(
    indexOfFirstCoin,
    indexOfLastCoin
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredAndSortedData.length / coinsPerPage);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short",
      }).format(num);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className=" mx-auto px-6 py-10 bg-gray-900 text-white">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Cryptocurrency Markets
        </h1>
        <p className="text-gray-400">
          Real-time prices, market cap, and 24h performance
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <Input
            placeholder="Search markets"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <button className="p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Markets Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-700">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("price")}
                  className="flex items-center gap-2 text-white hover:text-gray-300"
                >
                  Price
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </button>
              </TableHead>
              <TableHead>24h Chart</TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("priceChangePercent")}
                  className="flex items-center gap-2 text-white hover:text-gray-300"
                >
                  24h Change
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("volume")}
                  className="flex items-center gap-2 text-white hover:text-gray-300"
                >
                  24h Volume
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("marketCap")}
                  className="flex items-center gap-2 text-white hover:text-gray-300"
                >
                  Market Cap
                  <ArrowUpDown className="w-4 h-4 text-gray-400" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCoins.map((coin) => (
              <TableRow
                key={coin.symbol}
                className="hover:bg-gray-700 cursor-pointer transition-colors"
              >
                <TableCell>
                  <button
                    onClick={() => toggleFavorite(coin.symbol)}
                    className={`transition-colors ${
                      favorites.includes(coin.symbol)
                        ? "text-yellow-400"
                        : "text-gray-400 hover:text-yellow-400"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={`/logos/${coin.symbol
                        .replace("USDT", "")
                        .toLowerCase()}.svg`}
                      alt={coin.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        if (
                          !imgElement.src.includes("/logos/placeholder.svg")
                        ) {
                          imgElement.src = "/logos/placeholder.svg";
                          imgElement.onerror = null;
                        }
                      }}
                    />
                    <div>{coin.symbol}</div>
                  </div>
                </TableCell>
                <TableCell>{formatNumber(coin.price)}</TableCell>
                <TableCell className="w-32">
                  <ResponsiveContainer width="100%" height={50}>
                    <AreaChart data={coin.historicalData}>
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#ffb90f"
                        fill="#ffb90f"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TableCell>
                <TableCell>
                  <div
                    className={`text-sm ${
                      coin.priceChangePercent >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin.priceChangePercent.toFixed(2)}%
                  </div>
                </TableCell>
                <TableCell>{formatNumber(coin.volume)}</TableCell>
                <TableCell>{formatNumber(coin.marketCap)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </div>
      </div>
    </div>
  );
};

export default Markets;
