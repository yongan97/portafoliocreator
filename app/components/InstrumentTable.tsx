"use client";

import { Allocation } from "@/app/lib/types";
import { INSTRUMENTS } from "@/app/lib/instruments";

interface InstrumentTableProps {
  allocations: Allocation[];
}

export default function InstrumentTable({ allocations }: InstrumentTableProps) {
  // Filter out empty allocations and get instrument details
  const tableData = allocations
    .filter((a) => a.instrumentId && a.percent > 0)
    .map((allocation) => {
      const instrument = INSTRUMENTS.find((i) => i.id === allocation.instrumentId);
      return {
        allocation,
        instrument,
      };
    })
    .filter((item) => item.instrument); // Only include valid instruments

  if (tableData.length === 0) {
    return (
      <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
        <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Detalle de Instrumentos</h2>
        <div className="flex items-center justify-center h-[200px] bg-white/5 rounded-2xl border border-dashed border-white/10">
          <div className="text-center">
            <p className="text-white font-medium text-sm">No hay instrumentos seleccionados</p>
            <p className="text-white/40 text-xs mt-2">Agrega instrumentos para ver los detalles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-8">
      <h2 className="text-xl font-semibold text-white mb-6 tracking-tight">Detalle de Instrumentos</h2>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">Ticker</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">Nombre</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">Asignación</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">Precio ARS</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">Precio USD</th>
              <th className="text-right py-3 px-4 text-xs font-medium text-white/60 uppercase tracking-wider">TIR/Yield</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map(({ allocation, instrument }, index) => (
              <tr
                key={allocation.instrumentId}
                className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index === tableData.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">{instrument!.id}</span>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20 font-medium">
                      {instrument!.category}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-medium text-white">{instrument!.name}</p>
                    <p className="text-xs text-white/40 mt-0.5">{instrument!.description}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-right">
                  <span className="text-sm font-semibold text-white">{allocation.percent.toFixed(2)}%</span>
                </td>
                <td className="py-4 px-4 text-right">
                  {instrument!.priceARS ? (
                    <span className="text-sm text-white/80">
                      ${instrument!.priceARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  {instrument!.priceUSD ? (
                    <span className="text-sm text-white/80">
                      US$ {instrument!.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right">
                  {instrument!.yieldUSD || instrument!.yieldARS ? (
                    <div className="space-y-0.5">
                      {instrument!.yieldUSD && (
                        <div className="text-sm text-green-400 font-medium">
                          {instrument!.yieldUSD.toFixed(2)}% USD
                        </div>
                      )}
                      {instrument!.yieldARS && (
                        <div className="text-sm text-green-400 font-medium">
                          {instrument!.yieldARS.toFixed(2)}% ARS
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-white/30">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {tableData.map(({ allocation, instrument }) => (
          <div
            key={allocation.instrumentId}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base font-semibold text-white">{instrument!.id}</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20 font-medium">
                    {instrument!.category}
                  </span>
                </div>
                <p className="text-sm font-medium text-white/80">{instrument!.name}</p>
                <p className="text-xs text-white/40 mt-1">{instrument!.description}</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-semibold text-white">{allocation.percent.toFixed(2)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
              <div>
                <p className="text-xs text-white/40 mb-1">Precio ARS</p>
                {instrument!.priceARS ? (
                  <p className="text-sm font-medium text-white">
                    ${instrument!.priceARS.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-xs text-white/30">—</p>
                )}
              </div>
              <div>
                <p className="text-xs text-white/40 mb-1">Precio USD</p>
                {instrument!.priceUSD ? (
                  <p className="text-sm font-medium text-white">
                    US$ {instrument!.priceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="text-xs text-white/30">—</p>
                )}
              </div>
              {(instrument!.yieldUSD || instrument!.yieldARS) && (
                <>
                  {instrument!.yieldUSD && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">TIR USD</p>
                      <p className="text-sm font-medium text-green-400">{instrument!.yieldUSD.toFixed(2)}%</p>
                    </div>
                  )}
                  {instrument!.yieldARS && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">TIR ARS</p>
                      <p className="text-sm font-medium text-green-400">{instrument!.yieldARS.toFixed(2)}%</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
