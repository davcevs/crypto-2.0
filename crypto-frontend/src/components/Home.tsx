// HomePage.tsx
import React from "react";
import HeroSection from "./HeroSection";
import TopCryptocurrencies from "./TopCryptocurrencies";
import Features from "./Features";
import LatestCryptoNews from "./LatestCryptoNews";
import DetailedCryptoChart from "./DetailedCryptoChart";

const HomePage: React.FC = () => (
  <div className="min-h-screen bg-black text-white overflow-x-hidden">
    <HeroSection />
    <TopCryptocurrencies />
    <DetailedCryptoChart symbol="BTCUSDT" />
    <section className="container mx-auto px-4 py-12">
      <Features />
    </section>
    <LatestCryptoNews />
  </div>
);

export default HomePage;
