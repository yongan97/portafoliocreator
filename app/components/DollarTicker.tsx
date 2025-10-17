"use client";

import { useEffect, useState } from "react";

interface DollarRate {
  name: string;
  buy: string;
  sell: string;
  change: number;
  changePercent: number;
}

// Precios de los diferentes dólares en Argentina (simulados)
const DOLLAR_RATES: DollarRate[] = [
  { name: "Dólar Oficial", buy: "365.50", sell: "385.50", change: 2.50, changePercent: 0.69 },
  { name: "Dólar Blue", buy: "1,010.00", sell: "1,030.00", change: -15.00, changePercent: -1.43 },
  { name: "Dólar MEP", buy: "1,045.25", sell: "1,048.75", change: 8.50, changePercent: 0.82 },
  { name: "Dólar CCL", buy: "1,052.80", sell: "1,056.20", change: 12.30, changePercent: 1.18 },
  { name: "Dólar Tarjeta", buy: "616.80", sell: "616.80", change: 4.20, changePercent: 0.69 },
  { name: "Dólar Cripto", buy: "1,015.50", sell: "1,025.30", change: -8.20, changePercent: -0.80 },
  { name: "Dólar Mayorista", buy: "363.25", sell: "367.25", change: 1.75, changePercent: 0.48 },
  { name: "Dólar Solidario", buy: "616.80", sell: "616.80", change: 4.20, changePercent: 0.69 },
];

export default function DollarTicker() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Duplicamos los datos para crear un loop infinito
  const duplicatedData = [...DOLLAR_RATES, ...DOLLAR_RATES];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 overflow-hidden z-40">
      <div className="relative h-14 flex items-center">
        {/* Ticker Container - se mueve de derecha a izquierda */}
        <div className="flex animate-scroll-left gap-8 will-change-transform">
          {duplicatedData.map((rate, index) => {
            const isPositive = rate.change >= 0;
            const textColor = isPositive ? "text-green-400" : "text-red-400";
            const bgColor = isPositive ? "bg-green-500/10" : "bg-red-500/10";

            return (
              <div
                key={`${rate.name}-${index}`}
                className="flex items-center gap-4 whitespace-nowrap px-5 py-2"
              >
                {/* Nombre del dólar */}
                <div className="flex flex-col items-start">
                  <span className="text-white/90 font-semibold text-sm">
                    {rate.name}
                  </span>
                  <div className="flex items-center gap-3 mt-0.5">
                    {/* Compra */}
                    <div className="flex items-center gap-1">
                      <span className="text-white/40 text-xs">Compra:</span>
                      <span className="text-white/70 text-xs font-medium">
                        ${rate.buy}
                      </span>
                    </div>

                    {/* Venta */}
                    <div className="flex items-center gap-1">
                      <span className="text-white/40 text-xs">Venta:</span>
                      <span className="text-white/70 text-xs font-medium">
                        ${rate.sell}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Variación */}
                <div className={`flex items-center gap-1.5 ${bgColor} px-2.5 py-1 rounded-full`}>
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

                  {/* Cambio absoluto */}
                  <span className={`${textColor} text-xs font-semibold`}>
                    ${Math.abs(rate.change).toFixed(2)}
                  </span>

                  {/* Porcentaje */}
                  <span className={`${textColor} text-xs font-semibold`}>
                    ({isPositive ? '+' : ''}{rate.changePercent.toFixed(2)}%)
                  </span>
                </div>

                {/* Separador */}
                <div className="w-px h-10 bg-white/10"></div>
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
