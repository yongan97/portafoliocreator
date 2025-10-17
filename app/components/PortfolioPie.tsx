"use client";

import { Allocation } from "@/app/lib/types";
import { INSTRUMENTS } from "@/app/lib/instruments";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface PortfolioPieProps {
  allocations: Allocation[];
}

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
  "#84CC16", // lime
];

export default function PortfolioPie({ allocations }: PortfolioPieProps) {
  // Filter out empty allocations and map to chart data
  const chartData = allocations
    .filter((a) => a.instrumentId && a.percent > 0)
    .map((allocation) => {
      const instrument = INSTRUMENTS.find((i) => i.id === allocation.instrumentId);
      return {
        name: instrument?.name || allocation.instrumentId,
        value: allocation.percent,
        category: instrument?.category || "Unknown",
      };
    });

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-white/5 rounded-2xl border border-dashed border-white/10">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-14 w-14 mx-auto text-white/20 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
            />
          </svg>
          <p className="text-white font-medium text-sm">No hay datos para mostrar</p>
          <p className="text-white/40 text-xs mt-2">Agrega instrumentos para visualizar tu portafolio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent">
      <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Distribución del Portafolio</h2>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)}%`}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1rem",
              padding: "0.75rem 1rem",
              color: "#ffffff",
              backdropFilter: "blur(10px)",
            }}
            labelStyle={{ color: "#ffffff", fontWeight: "500" }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: "#ffffff" }}
            formatter={(value, entry: any) => (
              <span className="text-sm text-white/80 font-medium">
                {value} <span className="text-white/50">({entry.payload.category})</span>
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
