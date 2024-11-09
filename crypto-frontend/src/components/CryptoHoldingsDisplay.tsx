import React, { useState, useEffect } from "react";
import CryptoHoldingsService from "../services/cryptoHoldingsService";
import { CryptoHolding } from "../interfaces/WalletInterfaces";

const CryptoHoldingsDisplay: React.FC = () => {
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const cryptoHoldingsService = new CryptoHoldingsService();

  useEffect(() => {
    const fetchCryptoHoldings = async () => {
      try {
        setLoading(true);
        const holdings = await cryptoHoldingsService.getCryptoHoldings();
        setCryptoHoldings(holdings);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoHoldings();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Crypto Holdings</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Amount</th>
            <th>Average Buy Price</th>
            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {cryptoHoldings.map((holding) => (
            <tr key={holding.id}>
              <td>{holding.symbol}</td>
              <td>{holding.amount}</td>
              <td>${holding.averageBuyPrice.toFixed(2)}</td>
              {holding.currentPrice && (
                <td>${holding.currentPrice.toFixed(2)}</td>
              )}
              {holding.totalValue && <td>${holding.totalValue.toFixed(2)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoHoldingsDisplay;
