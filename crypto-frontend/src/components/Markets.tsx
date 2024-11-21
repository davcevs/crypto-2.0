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
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[#0b0b0b] text-white">
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search markets"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-10 bg-[#1a1a1a] border-[#2a2a2a] text-white"
          />
        </div>
        <button className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#2a2a2a] transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Markets Table */}
      <div className="bg-[#0e0e0e] rounded-xl border border-[#1a1a1a] overflow-hidden">
        <Table>
          <TableHeader className="bg-[#1a1a1a]">
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("price")}
                  className="flex items-center gap-2"
                >
                  Price
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead>24h Chart</TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("priceChangePercent")}
                  className="flex items-center gap-2"
                >
                  24h Change
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("volume")}
                  className="flex items-center gap-2"
                >
                  24h Volume
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => sortData("marketCap")}
                  className="flex items-center gap-2"
                >
                  Market Cap
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCoins.map((coin) => (
              <TableRow
                key={coin.symbol}
                className="hover:bg-[#1a1a1a] cursor-pointer transition-colors"
              >
                <TableCell>
                  <button
                    onClick={() => toggleFavorite(coin.symbol)}
                    className={`transition-colors ${
                      favorites.includes(coin.symbol)
                        ? "text-yellow-500"
                        : "text-gray-400 hover:text-yellow-500"
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
                        // Only change source if it's not already the placeholder
                        if (
                          !imgElement.src.includes("/logos/placeholder.svg")
                        ) {
                          imgElement.src = "/logos/placeholder.svg";
                          // Prevent further error events
                          imgElement.onerror = null;
                        }
                      }}
                    />
                    <div>
                      <div className="font-semibold">{coin.symbol}</div>
                      <div className="text-sm text-gray-400">
                        {coin.symbol.replace("USDT", "")}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatNumber(coin.price)}</TableCell>
                <TableCell className="w-32">
                  <ResponsiveContainer width="100%" height={40}>
                    <AreaChart data={coin.historicalData}>
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={
                          coin.priceChangePercent >= 0 ? "#10B981" : "#EF4444"
                        }
                        fill={
                          coin.priceChangePercent >= 0
                            ? "#10B98133"
                            : "#EF444433"
                        }
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </TableCell>
                <TableCell>
                  <span
                    className={`flex items-center ${
                      coin.priceChangePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {coin.priceChangePercent >= 0 ? (
                      <TrendingUp className="mr-1 w-4 h-4" />
                    ) : (
                      <TrendingDown className="mr-1 w-4 h-4" />
                    )}
                    {coin.priceChangePercent >= 0 ? "+" : ""}
                    {coin.priceChangePercent.toFixed(2)}%
                  </span>
                </TableCell>
                <TableCell>{formatNumber(coin.volume)}</TableCell>
                <TableCell>{formatNumber(coin.marketCap)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-white">
          Page {currentPage} of {totalPages}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-[#1a1a1a] border-[#2a2a2a] text-white hover:bg-[#2a2a2a]"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8 text-gray-400">
          Loading cryptocurrency data...
        </div>
      )}
    </div>
  );
};

export default Markets;
