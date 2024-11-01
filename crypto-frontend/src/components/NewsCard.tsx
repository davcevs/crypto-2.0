// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { Loader2, ExternalLink, RefreshCw } from "lucide-react";

// interface NewsArticle {
//   title: string;
//   summary: string;
//   url: string;
//   publishedAt: string;
//   source: {
//     name: string;
//   };
// }

// const LatestCryptoNews = () => {
//   const [news, setNews] = useState<NewsArticle[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchCryptoNews = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(
//         "https://newsapi.org/v2/everything?q=cryptocurrency&apiKey=27fb08dd61bd4ebcbede0a965f57f70f"
//       );
//       if (!response.ok) {
//         throw new Error("Failed to fetch news");
//       }
//       const data = await response.json();
//       setNews(data.articles.slice(0, 5)); // Only take first 5 articles
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch news");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCryptoNews();
//   }, []);

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     }).format(date);
//   };

//   if (error) {
//     return (
//       <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-xl font-bold text-gray-100">
//             Latest Crypto News
//           </h2>
//           <button
//             onClick={fetchCryptoNews}
//             className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
//           >
//             <RefreshCw className="w-4 h-4" />
//             Retry
//           </button>
//         </div>
//         <div className="text-red-500 flex items-center justify-center p-8">
//           <p>{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-xl font-bold text-gray-100">Latest Crypto News</h2>
//         <button
//           onClick={fetchCryptoNews}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors"
//         >
//           <RefreshCw className="w-4 h-4" />
//           Refresh
//         </button>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center p-12">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
//         </div>
//       ) : (
//         <div className="space-y-4">
//           {news.map((article, index) => (
//             <motion.div
//               key={article.url}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3, delay: index * 0.1 }}
//               whileHover={{ scale: 1.02 }}
//               className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-all"
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <div className="text-xs text-gray-400 flex items-center gap-2">
//                   <span className="font-medium">{article.source.name}</span>
//                   <span>•</span>
//                   <span>{formatDate(article.publishedAt)}</span>
//                 </div>
//                 <a
//                   href={article.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-400 hover:text-blue-300 transition-colors"
//                 >
//                   <ExternalLink className="w-4 h-4" />
//                 </a>
//               </div>

//               <h3 className="font-semibold text-gray-100 mb-2 line-clamp-2">
//                 {article.title}
//               </h3>

//               <p className="text-gray-400 text-sm line-clamp-2 mb-3">
//                 {article.summary}
//               </p>

//               <motion.a
//                 href={article.url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors"
//                 whileHover={{ x: 5 }}
//               >
//                 Read more
//               </motion.a>
//             </motion.div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default LatestCryptoNews;
