import React, { useEffect, useRef, useState } from "react";
import { createChart, ISeriesApi } from "lightweight-charts";
import axiosInstance from "@/common/axios-instance";

interface CandlestickChartProps {
  symbol: string;
  interval?: string;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  symbol,
  interval = "1m",
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof createChart> | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: "rgba(224, 227, 235, 0.1)",
          style: 0,
        },
        horzLine: {
          width: 1,
          color: "rgba(224, 227, 235, 0.1)",
          style: 0,
        },
      },
      priceScale: {
        borderColor: "rgba(197, 203, 206, 0.3)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.3)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    chartInstanceRef.current = chart;
    seriesRef.current = candlestickSeries;

    const fetchCandlestickData = async () => {
      try {
        const response = await axiosInstance.get(
          `/crypto/candlestick/${symbol}USDT`,
          {
            params: {
              interval,
              limit: 500,
            },
          }
        );

        const data = response.data.map((d: any) => ({
          time: d.openTime / 1000, // Convert to seconds for lightweight-charts
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        }));

        if (seriesRef.current) {
          seriesRef.current.setData(data);
        }
      } catch (err) {
        setError("Failed to fetch candlestick data.");
        console.error("Candlestick data fetch error:", err);
      }
    };

    fetchCandlestickData();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [symbol, interval]);

  return (
    <div className="relative">
      {error && (
        <div className="absolute top-4 left-4 z-10 bg-red-500/10 text-red-500 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="w-full h-[500px]"
        style={{ position: "relative" }}
      />
    </div>
  );
};
