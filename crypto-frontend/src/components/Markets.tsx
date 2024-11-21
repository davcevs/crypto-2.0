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
  Loader2,
  RefreshCcw,
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
  const [coinsPerPage] = useState(15);

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
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Existing helper functions remain the same (toggleFavorite, sortData, etc.)
  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) =>
      prev.includes(symbol)
        ? prev.filter((s) => s !== symbol)
        : [...prev, symbol]
    );
  };

  const sortData = (key: keyof CryptoData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

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

  const indexOfLastCoin = currentPage * coinsPerPage;
  const indexOfFirstCoin = indexOfLastCoin - coinsPerPage;
  const currentCoins = filteredAndSortedData.slice(
    indexOfFirstCoin,
    indexOfLastCoin
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
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

  // Loader component
  const LoaderComponent = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" />
        <p className="mt-4 text-white text-xl">Loading Markets...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Loader */}
      {isLoading && <LoaderComponent />}

      <div className="container mx-auto px-6 py-10">
        {/* Header Section - Binance-inspired */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">
              Crypto Markets
            </h1>
            <p className="text-gray-400 text-sm">
              Real-time cryptocurrency market overview
            </p>
          </div>
          <button
            onClick={fetchAllData}
            className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 p-2 rounded-full transition-colors"
          >
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter Section - Binance-like */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              placeholder="Search markets"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-[#161A1E] border-[#2C2C2C] text-white focus:border-yellow-500 transition-colors"
            />
          </div>
          <button className="p-2 rounded-lg bg-[#1E1E1E] border border-[#2C2C2C] hover:bg-[#2C2C2C] transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-yellow-500" />
          </button>
        </div>

        {/* Markets Table - Binance-inspired */}
        <div className="bg-[#1E1E1E] rounded-xl border border-[#2C2C2C] overflow-hidden">
          <Table>
            <TableHeader className="bg-[#2C2C2C]">
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

        {/* Pagination Controls - Binance-like */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-4">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-[#2C2C2C] rounded-lg disabled:opacity-50 hover:bg-[#3C3C3C] text-yellow-500"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-[#2C2C2C] rounded-lg disabled:opacity-50 hover:bg-[#3C3C3C] text-yellow-500"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
