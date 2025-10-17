"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import InstrumentSelect from "@/app/components/InstrumentSelect";
import PortfolioPie from "@/app/components/PortfolioPie";
import InstrumentTable from "@/app/components/InstrumentTable";
import { Allocation } from "@/app/lib/types";

const STORAGE_KEY = "portfolio-allocations";

export default function PortfolioPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAllocations(parsed);
      } catch (e) {
        console.error("Error loading allocations from localStorage", e);
      }
    }
  }, []);

  // Save to localStorage whenever allocations change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allocations));
    }
  }, [allocations, mounted]);

  const handleAllocationsChange = (newAllocations: Allocation[]) => {
    setAllocations(newAllocations);
    setAnalysis(""); // Clear analysis when allocations change
  };

  const totalPercent = allocations.reduce((sum, a) => sum + (a.percent || 0), 0);
  const isValidTotal = Math.abs(totalPercent - 100) < 0.01;
  const hasInstruments = allocations.length > 0 && allocations.every((a) => a.instrumentId);

  const handleGenerateAnalysis = async () => {
    setLoading(true);
    setAnalysis("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allocations }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error generating analysis");
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error generating analysis:", error);
      setAnalysis(
        "❌ **Error**: No se pudo generar el análisis. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-white hover:text-white/70 transition-colors tracking-tight">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Portfolio Creator
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setAllocations([]);
                setAnalysis("");
              }}
              className="px-4 py-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              Limpiar
            </button>
            <Link
              href="/"
              className="px-5 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
            >
              Inicio
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4 tracking-tight">
            Construye tu <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Portafolio</span>
          </h1>
          <p className="text-lg text-white/60 font-normal">Selecciona tus instrumentos y obtén un análisis inteligente al instante</p>
        </div>

        {/* Info Card */}
        <div className="bg-white/5 border border-white/10 p-6 mb-12 rounded-2xl backdrop-blur-sm">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Información importante</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Esta herramienta es solo para fines educativos.
                Las categorías de riesgo son: <strong className="text-white/70">Acciones (Alto)</strong>, <strong className="text-white/70">ETFs (Medio-Alto)</strong>,{" "}
                <strong className="text-white/70">Bonos (Bajo-Medio)</strong>, <strong className="text-white/70">Criptomonedas (Muy Alto)</strong>, y{" "}
                <strong className="text-white/70">Efectivo (Muy Bajo)</strong>. Este no es asesoramiento financiero.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-5 mb-10">
          {/* Left: Instrument Selection */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/[0.07] transition-all">
            <InstrumentSelect value={allocations} onChange={handleAllocationsChange} />
          </div>

          {/* Right: Pie Chart */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 hover:bg-white/[0.07] transition-all">
            <PortfolioPie allocations={allocations} />
          </div>
        </div>

        {/* Instrument Details Table */}
        <div className="mb-10">
          <InstrumentTable allocations={allocations} />
        </div>

        {/* Analysis Button */}
        <div className="text-center mb-10">
          <button
            onClick={handleGenerateAnalysis}
            disabled={!isValidTotal || !hasInstruments || loading}
            className="group px-8 py-3.5 bg-white text-black text-base font-medium rounded-full hover:bg-gray-200 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generando análisis con IA
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Generar análisis con IA
              </span>
            )}
          </button>
          {!isValidTotal && hasInstruments && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium">El total debe sumar exactamente 100% para generar el análisis</span>
            </div>
          )}
        </div>

        {/* Analysis Result */}
        {analysis && (
          <div className="bg-white/5 p-10 rounded-3xl border border-white/10 animate-fadeIn backdrop-blur-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3 tracking-tight">
                <div className="w-11 h-11 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                Análisis del Portafolio
              </h2>
              <button
                onClick={() => setAnalysis("")}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                aria-label="Cerrar análisis"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white/40 hover:text-white/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="prose prose-lg prose-invert max-w-none">
              <div
                className="text-white/70 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{
                  __html: analysis
                    .replace(/\n/g, "<br/>")
                    .replace(/##\s+(.+?)(<br\/>|$)/g, "<h3 class='text-xl font-semibold text-white mt-8 mb-4 pb-2 border-b border-white/10'>$1</h3>")
                    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-white font-medium'>$1</strong>")
                    .replace(/- (.+?)(<br\/>|$)/g, "<li class='ml-6 my-2'>$1</li>")
                    .replace(/`(.+?)`/g, "<code class='bg-white/10 text-blue-300 px-2 py-1 rounded text-sm font-mono'>$1</code>"),
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
