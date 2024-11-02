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
import { Search, SlidersHorizontal, Star, ArrowUpDown } from "lucide-react";
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

          // Simulated volume and market cap (replace with actual API calls in production)
          const volume = price * (Math.random() * 1000000 + 500000);
          const marketCap = price * (Math.random() * 1000000000 + 1000000000);

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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Markets</h1>
        <p className="text-gray-400">
          Live cryptocurrency prices and market data
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search markets"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800"
          />
        </div>
        <button className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors">
          <SlidersHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Markets Table */}
      <div className="bg-[#181818]  rounded-xl border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader>
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
            {filteredAndSortedData.map((coin) => (
              <TableRow
                key={coin.symbol}
                className="hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <TableCell>
                  <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                    <Star className="w-4 h-4" />
                  </button>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <img
                      src={`/logos/${coin.symbol.toLowerCase()}.svg`}
                      alt={coin.symbol}
                      className="w-8 h-8 rounded-full"
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
                    className={
                      coin.priceChangePercent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
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
    </div>
  );
};

export default Markets;
