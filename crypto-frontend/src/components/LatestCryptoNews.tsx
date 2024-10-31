// LatestCryptoNews.tsx
import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

const LatestCryptoNews: React.FC = () => {
  const [liveNews, setLiveNews] = useState([]);

  const fetchCryptoNews = async () => {
    try {
      const response = await fetch(
        "https://your-backend-or-news-api/crypto-news"
      );
      const newsData = await response.json();
      setLiveNews(newsData.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch crypto news", error);
    }
  };

  useEffect(() => {
    fetchCryptoNews();
  }, []);

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-8">
        Latest Crypto News
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {liveNews.map((news, index) => (
          <NewsCard key={index} news={news} />
        ))}
      </div>
    </section>
  );
};

export default LatestCryptoNews;
