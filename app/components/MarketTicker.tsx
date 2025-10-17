"use client";

import { useEffect, useState } from "react";

interface TickerItem {
  symbol: string;
  name: string;
  price: string;
  change: number;
  changePercent: number;
}

// Datos de mercado simulados (en producción, estos vendrían de una API)
const MARKET_DATA: TickerItem[] = [
  { symbol: "SPY", name: "S&P 500", price: "565.23", change: 4.82, changePercent: 0.86 },
  { symbol: "AAPL", name: "Apple", price: "178.45", change: -2.15, changePercent: -1.19 },
  { symbol: "MSFT", name: "Microsoft", price: "412.89", change: 5.67, changePercent: 1.39 },
  { symbol: "GOOGL", name: "Google", price: "142.33", change: 1.22, changePercent: 0.87 },
  { symbol: "AMZN", name: "Amazon", price: "178.92", change: -0.88, changePercent: -0.49 },
  { symbol: "TSLA", name: "Tesla", price: "242.18", change: 8.45, changePercent: 3.61 },
  { symbol: "NVDA", name: "NVIDIA", price: "875.28", change: 12.34, changePercent: 1.43 },
  { symbol: "META", name: "Meta", price: "485.67", change: -3.21, changePercent: -0.66 },
  { symbol: "BTC", name: "Bitcoin", price: "67,234", change: 1234.56, changePercent: 1.87 },
  { symbol: "ETH", name: "Ethereum", price: "3,456", change: -45.32, changePercent: -1.29 },
  { symbol: "GOLD", name: "Oro", price: "2,048", change: 8.32, changePercent: 0.41 },
  { symbol: "OIL", name: "Petróleo WTI", price: "83.45", change: -1.23, changePercent: -1.45 },
  { symbol: "EURUSD", name: "EUR/USD", price: "1.0876", change: 0.0023, changePercent: 0.21 },
  { symbol: "DXY", name: "Dólar Index", price: "103.45", change: -0.32, changePercent: -0.31 },
];

export default function MarketTicker() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Duplicamos los datos para crear un loop infinito sin saltos
  const duplicatedData = [...MARKET_DATA, ...MARKET_DATA];

  return (
    <div className="fixed top-16 left-0 w-full bg-black/90 backdrop-blur-xl border-y border-white/10 overflow-hidden z-40">
      <div className="relative h-12 flex items-center">
        {/* Ticker Container - se mueve de derecha a izquierda (aparece desde la derecha) */}
        <div className="flex animate-scroll-left gap-8 will-change-transform">
          {duplicatedData.map((item, index) => {
            const isPositive = item.change >= 0;
            const textColor = isPositive ? "text-green-400" : "text-red-400";
            const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10";

            return (
              <div
                key={`${item.symbol}-${index}`}
                className="flex items-center gap-3 whitespace-nowrap px-4"
              >
                {/* Símbolo */}
                <span className="text-white/90 font-semibold text-sm">
                  {item.symbol}
                </span>

                {/* Precio */}
                <span className="text-white/70 text-sm font-medium">
                  ${item.price}
                </span>

                {/* Cambio y porcentaje */}
                <div className={`flex items-center gap-1.5 ${bgColor} px-2 py-0.5 rounded-full`}>
                  {/* Flecha */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3 w-3 ${textColor} ${!isPositive && 'rotate-180'}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>

                  {/* Porcentaje */}
                  <span className={`${textColor} text-xs font-semibold`}>
                    {isPositive ? '+' : ''}{item.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Separador */}
                <div className="w-px h-4 bg-white/10"></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradientes en los bordes para efecto de fade */}
      <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black/90 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black/90 to-transparent pointer-events-none"></div>
    </div>
  );
}
