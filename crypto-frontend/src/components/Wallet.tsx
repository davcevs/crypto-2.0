// import { useEffect, useState } from "react";
// import { getWallet, getWalletStats } from "../services/walletService";
// import { Loader2 } from "lucide-react";
// import {
//   WalletData,
//   WalletStats,
//   Transaction,
//   Holding,
// } from "../interfaces/WalletInterfaces";

// const Wallet = () => {
//   const [wallet, setWallet] = useState<WalletData | null>(null);
//   const [stats, setStats] = useState<WalletStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchWalletData = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const [walletData, walletStats] = await Promise.all([
//           getWallet(),
//           getWalletStats().catch(() => null), // Allow stats to fail gracefully
//         ]);

//         setWallet(walletData);
//         setStats(walletStats);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Failed to load wallet data"
//         );
//         console.error("Wallet data fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWalletData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="my-4 p-4 bg-red-200 text-red-800 rounded">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   if (!wallet) {
//     return (
//       <div className="my-4 p-4 bg-yellow-200 text-yellow-800 rounded">
//         <p>No wallet data available</p>
//       </div>
//     );
//   }

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//     }).format(amount);
//   };

//   const formatChange = (
//     change: number | undefined,
//     percentage: number | undefined
//   ) => {
//     if (typeof change === "undefined" || typeof percentage === "undefined") {
//       return "N/A";
//     }
//     const sign = change >= 0 ? "+" : "";
//     return `${sign}${formatCurrency(change)} (${sign}${percentage.toFixed(
//       2
//     )}%)`;
//   };

//   return (
//     <div className="space-y-6">
//       {/* Wallet Overview */}
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-lg font-semibold">Wallet Overview</h2>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
//           <div>
//             <p className="text-sm font-medium text-muted-foreground">Balance</p>
//             <p className="text-2xl font-bold">
//               {formatCurrency(wallet.balance)}
//             </p>
//           </div>
//           {stats && (
//             <>
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">
//                   Total Value
//                 </p>
//                 <p className="text-2xl font-bold">
//                   {formatCurrency(stats.totalValue)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">
//                   Daily Change
//                 </p>
//                 <p
//                   className={`text-2xl font-bold ${
//                     stats.dailyChange >= 0 ? "text-green-600" : "text-red-600"
//                   }`}
//                 >
//                   {formatChange(
//                     stats?.dailyChange,
//                     stats?.dailyChangePercentage
//                   )}
//                 </p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Holdings */}
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-lg font-semibold">Holdings</h2>
//         <div className="mt-4">
//           {wallet.holdings.length > 0 ? (
//             <div className="divide-y">
//               {wallet.holdings.map((holding) => (
//                 <div
//                   key={holding.symbol}
//                   className="py-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <p className="font-medium">{holding.symbol}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {holding.amount} units
//                     </p>
//                   </div>
//                   {holding.currentPrice && (
//                     <div className="text-right">
//                       <p className="font-medium">
//                         {formatCurrency(holding.currentPrice)}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Total:{" "}
//                         {formatCurrency(holding.amount * holding.currentPrice)}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted-foreground">No holdings available</p>
//           )}
//         </div>
//       </div>

//       {/* Recent Transactions */}
//       <div className="bg-white shadow-md rounded-lg p-4">
//         <h2 className="text-lg font-semibold">Recent Transactions</h2>
//         <div className="mt-4">
//           {wallet.transactions.length > 0 ? (
//             <div className="divide-y">
//               {wallet.transactions.map((transaction) => (
//                 <div
//                   key={transaction.id}
//                   className="py-3 flex justify-between items-center"
//                 >
//                   <div>
//                     <p className="font-medium">
//                       {transaction.type} {transaction.symbol}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       {new Date(transaction.timestamp).toLocaleDateString()}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium">{transaction.amount} units</p>
//                     <p className="text-sm text-muted-foreground">
//                       @ {formatCurrency(transaction.price)}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted-foreground">No transactions available</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Wallet;
