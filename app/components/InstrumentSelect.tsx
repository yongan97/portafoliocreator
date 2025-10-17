"use client";

import { Allocation, InstrumentCategory, Currency, RateType } from "@/app/lib/types";
import { INSTRUMENTS } from "@/app/lib/instruments";
import { useState, useEffect, useRef } from "react";

interface InstrumentSelectProps {
  value: Allocation[];
  onChange: (value: Allocation[]) => void;
}

export default function InstrumentSelect({ value, onChange }: InstrumentSelectProps) {
  const [allocations, setAllocations] = useState<Allocation[]>(value);
  const [searchTerms, setSearchTerms] = useState<{ [key: number]: string }>({});
  const [showDropdowns, setShowDropdowns] = useState<{ [key: number]: boolean }>({});
  const [categoryFilter, setCategoryFilter] = useState<InstrumentCategory | "Todos">("Todos");
  const [currencyFilter, setCurrencyFilter] = useState<Currency | "Todos">("Todos");
  const [rateTypeFilter, setRateTypeFilter] = useState<RateType | "Todos">("Todos");
  const searchRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    setAllocations(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(searchRefs.current).forEach((key) => {
        const ref = searchRefs.current[parseInt(key)];
        if (ref && !ref.contains(event.target as Node)) {
          setShowDropdowns((prev) => ({ ...prev, [parseInt(key)]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAdd = () => {
    if (allocations.length >= 10) return;
    const newAllocations = [...allocations, { instrumentId: "", percent: 0 }];
    setAllocations(newAllocations);
    onChange(newAllocations);
  };

  const handleRemove = (index: number) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
    onChange(newAllocations);

    // Clean up search state
    const newSearchTerms = { ...searchTerms };
    delete newSearchTerms[index];
    setSearchTerms(newSearchTerms);

    const newShowDropdowns = { ...showDropdowns };
    delete newShowDropdowns[index];
    setShowDropdowns(newShowDropdowns);
  };

  const handleInstrumentSelect = (index: number, instrumentId: string) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], instrumentId };
    setAllocations(newAllocations);
    onChange(newAllocations);

    // Clear search and close dropdown
    setSearchTerms((prev) => ({ ...prev, [index]: "" }));
    setShowDropdowns((prev) => ({ ...prev, [index]: false }));
  };

  const handlePercentChange = (index: number, percent: number) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], percent };
    setAllocations(newAllocations);
    onChange(newAllocations);
  };

  const totalPercent = allocations.reduce((sum, a) => sum + (a.percent || 0), 0);
  const isValidTotal = Math.abs(totalPercent - 100) < 0.01;

  // Get already selected instruments
  const selectedIds = allocations.map((a) => a.instrumentId).filter(Boolean);

  // Filter instruments based on search and filters for a specific index
  const getFilteredInstruments = (index: number) => {
    const searchTerm = searchTerms[index] || "";

    return INSTRUMENTS.filter((inst) => {
      // Don't show already selected instruments
      if (selectedIds.includes(inst.id)) return false;

      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesId = inst.id.toLowerCase().includes(search);
        const matchesName = inst.name.toLowerCase().includes(search);
        const matchesDescription = inst.description.toLowerCase().includes(search);
        if (!matchesId && !matchesName && !matchesDescription) return false;
      }

      // Category, currency, and rate type filters
      if (categoryFilter !== "Todos" && inst.category !== categoryFilter) return false;
      if (currencyFilter !== "Todos" && inst.currency !== currencyFilter) return false;
      if (rateTypeFilter !== "Todos" && inst.rateType !== rateTypeFilter) return false;

      return true;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white tracking-tight">Instrumentos del Portafolio</h2>
        <div className="text-xs text-white/40 font-medium">
          {allocations.length} / 10 instrumentos
        </div>
      </div>

      <div className="space-y-2">
        {allocations.map((allocation, index) => {
          const instrument = allocation.instrumentId ? INSTRUMENTS.find((i) => i.id === allocation.instrumentId) : null;
          const filteredInstruments = getFilteredInstruments(index);

          return (
            <div
              key={index}
              className="flex gap-2 items-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.07] transition-all"
            >
              {/* Instrument Selector */}
              <div className="flex-1 min-w-0">
                {!allocation.instrumentId ? (
                  // Show search when no instrument selected
                  <div ref={(el) => (searchRefs.current[index] = el)} className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Buscar instrumento..."
                        value={searchTerms[index] || ""}
                        onChange={(e) => {
                          setSearchTerms((prev) => ({ ...prev, [index]: e.target.value }));
                          setShowDropdowns((prev) => ({ ...prev, [index]: true }));
                        }}
                        onFocus={() => setShowDropdowns((prev) => ({ ...prev, [index]: true }))}
                        className="w-full px-3 py-2 pl-9 bg-white/10 border border-white/10 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/15 placeholder-white/30"
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>

                    {/* Autocomplete Dropdown */}
                    {showDropdowns[index] && (
                      <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                        {filteredInstruments.length > 0 ? (
                          <div className="py-1">
                            {filteredInstruments.slice(0, 30).map((inst) => (
                              <button
                                key={inst.id}
                                onClick={() => handleInstrumentSelect(index, inst.id)}
                                className="w-full px-3 py-2 text-left hover:bg-white/10 transition-colors group"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                                        {inst.id}
                                      </span>
                                      <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded border border-blue-500/20">
                                        {inst.category}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/50 truncate mt-0.5">{inst.name}</p>
                                  </div>
                                  <div className="flex gap-1">
                                    <span className="px-1.5 py-0.5 bg-green-500/10 text-green-300 text-xs rounded border border-green-500/20">
                                      {inst.currency}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                            {filteredInstruments.length > 30 && (
                              <div className="px-3 py-2 text-xs text-white/30 text-center border-t border-white/10">
                                +{filteredInstruments.length - 30} más
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="px-3 py-6 text-center">
                            <p className="text-xs text-white/40">No se encontraron instrumentos</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Show selected instrument with badges
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">{allocation.instrumentId}</span>
                    <span className="text-xs text-white/50">•</span>
                    <span className="text-xs text-white/60 truncate">{instrument?.name}</span>
                    <div className="flex gap-1.5 ml-auto">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-xs rounded-full border border-blue-500/20">
                        {instrument?.category}
                      </span>
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-300 text-xs rounded-full border border-green-500/20">
                        {instrument?.currency}
                      </span>
                      {instrument?.rateType !== "N/A" && (
                        <span className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-xs rounded-full border border-purple-500/20">
                          {instrument?.rateType}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Percentage Input */}
              <div className="w-24">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={allocation.percent || ""}
                  onChange={(e) => handlePercentChange(index, parseFloat(e.target.value) || 0)}
                  placeholder="%"
                  className="w-full px-3 py-2 bg-white/10 border border-white/10 text-white text-sm text-right rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/15"
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(index)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Eliminar instrumento"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add Instrument Button - Always Visible */}
        <button
          onClick={handleAdd}
          disabled={allocations.length >= 10}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 border-dashed text-white/60 text-sm font-medium rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar instrumento
        </button>
      </div>

      {/* Total */}
      <div className="flex justify-end items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <span className="text-sm font-medium text-white/60">Total:</span>
        <span
          className={`text-xl font-semibold ${
            isValidTotal ? "text-green-400" : totalPercent > 100 ? "text-red-400" : "text-orange-400"
          }`}
        >
          {totalPercent.toFixed(2)}%
        </span>
        {!isValidTotal && allocations.length > 0 && (
          <span className="text-xs text-white/40 font-medium">
            {totalPercent < 100 ? `(Falta ${(100 - totalPercent).toFixed(2)}%)` : `(Sobra ${(totalPercent - 100).toFixed(2)}%)`}
          </span>
        )}
      </div>
    </div>
  );
}
