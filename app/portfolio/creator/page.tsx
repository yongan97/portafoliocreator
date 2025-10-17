'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Portfolio, Instrument, RiskProfile, PortfolioAnalysis } from '@/app/lib/types/portfolio';
import { RISK_PROFILES } from '@/app/lib/types/portfolio';
import { findInstrument } from '@/app/lib/instruments-data';

const VETACAP_COLORS = {
  primary: ['#1036E2', '#4C68E9', '#00C600', '#4CD74C', '#99E899'],
  accent: '#00C600',
  background: '#021751',
};

export default function PortfolioCreatorPage() {
  // Estados principales
  const [clientName, setClientName] = useState('');
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('moderado');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [currentName, setCurrentName] = useState('');
  const [currentPercentage, setCurrentPercentage] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);

  // Estados de análisis y exportación
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  // Manejar cambio de símbolo y autocompletar
  const handleSymbolChange = (value: string) => {
    setCurrentSymbol(value);

    // Buscar en la base de datos
    const instrumentData = findInstrument(value);

    if (instrumentData) {
      setCurrentName(instrumentData.name);
      setCurrentCategory(instrumentData.category);
      setAutoDetected(true);
    } else {
      // Si no se encuentra, permitir entrada manual
      if (autoDetected) {
        setCurrentName('');
        setCurrentCategory('');
        setAutoDetected(false);
      }
    }
  };

  // Agregar instrumento a la cartera
  const handleAddInstrument = () => {
    if (!currentSymbol || !currentPercentage) {
      alert('Por favor completa el símbolo y el porcentaje');
      return;
    }

    const percentage = parseFloat(currentPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      alert('El porcentaje debe ser un número entre 0 y 100');
      return;
    }

    // Si no se autocompletó el nombre, usar el símbolo como nombre
    const finalName = currentName || currentSymbol.toUpperCase();
    const finalCategory = currentCategory || 'Otros';

    const newInstrument: Instrument = {
      symbol: currentSymbol.toUpperCase(),
      name: finalName,
      percentage,
      category: finalCategory,
    };

    setInstruments([...instruments, newInstrument]);

    // Limpiar campos
    setCurrentSymbol('');
    setCurrentName('');
    setCurrentPercentage('');
    setCurrentCategory('');
    setAutoDetected(false);
  };

  // Eliminar instrumento
  const handleRemoveInstrument = (index: number) => {
    setInstruments(instruments.filter((_, i) => i !== index));
  };

  // Calcular total
  const totalPercentage = instruments.reduce((sum, inst) => sum + inst.percentage, 0);
  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  // Generar análisis con IA
  const handleGenerateAnalysis = async () => {
    if (!isValidTotal || instruments.length === 0) {
      alert('Asegúrate de que la cartera sume 100% y tenga al menos un instrumento');
      return;
    }

    setLoadingAnalysis(true);
    try {
      const response = await fetch('/api/portfolio/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruments,
          riskProfile,
          clientName: clientName || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data);
      } else {
        alert('Error al generar análisis: ' + data.error);
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert('Error al generar análisis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Exportar a PDF
  const handleExportPDF = async () => {
    if (!analysis) {
      alert('Primero genera el análisis con IA');
      return;
    }

    setExportingPDF(true);
    try {
      const response = await fetch('/api/portfolio/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientName || 'Cliente',
          riskProfile,
          instruments,
          analysis,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VetaCap_Portfolio_${clientName || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error al generar PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error al exportar PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  // Datos para el gráfico de torta
  const chartData = instruments.map(inst => ({
    name: inst.symbol,
    value: inst.percentage,
    fullName: inst.name,
  }));

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#021751]/80 backdrop-blur-xl border-b border-[#1036E2]/20">
        <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/vetacap-logo-full.svg"
              alt="VetaCap"
              width={160}
              height={45}
              priority
              className="h-8 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="px-5 py-2 bg-[#1036E2] text-white text-sm font-medium rounded-full hover:bg-[#4C68E9] transition-all"
          >
            Inicio
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold text-white mb-4">
            Creador de{' '}
            <span className="bg-gradient-to-r from-[#1036E2] to-[#00C600] bg-clip-text text-transparent">
              Portafolios
            </span>
          </h1>
          <p className="text-xl text-white/60">
            Diseña carteras personalizadas con análisis de IA y exportación profesional a PDF
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Panel Izquierdo - Configuración */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20">
              <h2 className="text-2xl font-semibold text-white mb-6">Información del Cliente</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-4 py-3 bg-black/30 border border-[#1036E2]/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#1036E2] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Perfil de Riesgo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(RISK_PROFILES) as RiskProfile[]).map((profile) => (
                      <button
                        key={profile}
                        onClick={() => setRiskProfile(profile)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          riskProfile === profile
                            ? 'bg-[#1036E2] text-white border-2 border-[#1036E2]'
                            : 'bg-black/30 text-white/60 border border-[#1036E2]/20 hover:bg-black/50'
                        }`}
                      >
                        {RISK_PROFILES[profile].label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-white/50">
                    {RISK_PROFILES[riskProfile].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Agregar Instrumentos */}
            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20">
              <h2 className="text-2xl font-semibold text-white mb-6">Agregar Instrumentos</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Símbolo (Ticker)
                    </label>
                    <input
                      type="text"
                      value={currentSymbol}
                      onChange={(e) => handleSymbolChange(e.target.value)}
                      placeholder="GGAL, YPF, AAPL..."
                      className="w-full px-4 py-3 bg-black/30 border border-[#1036E2]/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#1036E2] transition-colors uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Porcentaje (%)
                    </label>
                    <input
                      type="number"
                      value={currentPercentage}
                      onChange={(e) => setCurrentPercentage(e.target.value)}
                      placeholder="25"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-3 bg-black/30 border border-[#1036E2]/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#1036E2] transition-colors"
                    />
                  </div>
                </div>

                {/* Nombre autocompletado */}
                {currentName && (
                  <div className="p-4 bg-[#00C600]/10 border border-[#00C600]/20 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-[#00C600] mt-0.5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">
                          {currentName}
                        </p>
                        <p className="text-xs text-white/60 mt-1">
                          Categoría: {currentCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAddInstrument}
                  className="w-full px-6 py-3 bg-[#1036E2] text-white font-medium rounded-xl hover:bg-[#4C68E9] transition-all"
                >
                  Agregar Instrumento
                </button>
              </div>
            </div>

            {/* Lista de Instrumentos */}
            {instruments.length > 0 && (
              <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-white">Instrumentos</h2>
                  <span className={`text-lg font-semibold ${
                    isValidTotal ? 'text-[#00C600]' : 'text-red-500'
                  }`}>
                    Total: {totalPercentage.toFixed(2)}%
                  </span>
                </div>

                <div className="space-y-3">
                  {instruments.map((inst, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-4 bg-black/30 rounded-xl border border-[#1036E2]/10"
                    >
                      <div>
                        <div className="font-semibold text-white">{inst.symbol}</div>
                        <div className="text-sm text-white/60">{inst.name}</div>
                        {inst.category && (
                          <div className="text-xs text-[#1036E2] mt-1">{inst.category}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold text-white">
                          {inst.percentage}%
                        </span>
                        <button
                          onClick={() => handleRemoveInstrument(index)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-5 h-5 text-red-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel Derecho - Visualización */}
          <div className="space-y-6">
            {/* Botones de Acción - ARRIBA */}
            <div className="space-y-3">
              <button
                onClick={handleGenerateAnalysis}
                disabled={!isValidTotal || instruments.length === 0 || loadingAnalysis}
                className="w-full px-6 py-4 bg-[#1036E2] text-white font-medium rounded-xl hover:bg-[#4C68E9] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loadingAnalysis ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generando análisis...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generar Análisis con IA
                  </>
                )}
              </button>

              <button
                onClick={handleExportPDF}
                disabled={!analysis || exportingPDF}
                className="w-full px-6 py-4 bg-[#00C600] text-white font-medium rounded-xl hover:bg-[#4CD74C] disabled:bg-gray-600 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {exportingPDF ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Exportar a PDF
                  </>
                )}
              </button>

              {!isValidTotal && instruments.length > 0 && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm text-center">
                    La suma debe ser exactamente 100% para generar análisis y exportar
                  </p>
                </div>
              )}
            </div>

            {/* Gráfico de Torta */}
            <div className="bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20">
              <h2 className="text-2xl font-semibold text-white mb-6">Distribución de la Cartera</h2>

              {instruments.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
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
                          <Cell
                            key={`cell-${index}`}
                            fill={VETACAP_COLORS.primary[index % VETACAP_COLORS.primary.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#021751',
                          border: '1px solid #1036E2',
                          borderRadius: '12px',
                          color: 'white',
                        }}
                        formatter={(value: number) => `${value}%`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <p className="text-white/40 text-center">
                    Agrega instrumentos para visualizar tu cartera
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Análisis Generado */}
        {analysis && (
          <div className="mt-12 bg-[#021751]/30 backdrop-blur-md p-8 rounded-3xl border border-[#1036E2]/20">
            <h2 className="text-3xl font-semibold text-white mb-6">Análisis Generado</h2>

            <div className="space-y-6">
              {/* Resumen */}
              <div>
                <h3 className="text-xl font-semibold text-[#00C600] mb-3">Resumen Ejecutivo</h3>
                <p className="text-white/80 leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Instrumentos */}
              {analysis.instrumentDetails && analysis.instrumentDetails.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-[#00C600] mb-3">Análisis de Instrumentos</h3>
                  <div className="space-y-4">
                    {analysis.instrumentDetails.map((inst, index) => (
                      <div key={index} className="p-6 bg-black/30 rounded-xl border border-[#1036E2]/10">
                        <h4 className="text-lg font-semibold text-white mb-2">
                          {inst.symbol} - {inst.name}
                        </h4>
                        <p className="text-white/70 text-sm mb-3">{inst.description}</p>
                        {inst.sector && (
                          <p className="text-[#1036E2] text-sm mb-2">
                            <strong>Sector:</strong> {inst.sector}
                          </p>
                        )}
                        {inst.risks && (
                          <p className="text-white/60 text-sm mb-2">
                            <strong>Riesgos:</strong> {inst.risks}
                          </p>
                        )}
                        {inst.opportunities && (
                          <p className="text-white/60 text-sm">
                            <strong>Oportunidades:</strong> {inst.opportunities}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Noticias */}
              {analysis.news && analysis.news.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-[#00C600] mb-3">Contexto de Mercado y Noticias</h3>
                  <div className="space-y-3">
                    {analysis.news.map((newsItem, index) => (
                      <div key={index} className="p-4 bg-black/30 rounded-xl border border-[#1036E2]/10">
                        <h4 className="text-white font-semibold mb-2">{newsItem.title}</h4>
                        <p className="text-white/70 text-sm mb-2">{newsItem.summary}</p>
                        <div className="flex justify-between items-center text-xs text-white/50">
                          <span>{newsItem.date}</span>
                          {newsItem.relevantSymbols && newsItem.relevantSymbols.length > 0 && (
                            <span>Relevante para: {newsItem.relevantSymbols.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {analysis.recommendations && (
                <div>
                  <h3 className="text-xl font-semibold text-[#00C600] mb-3">Recomendaciones</h3>
                  <p className="text-white/80 leading-relaxed">{analysis.recommendations}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
