'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TestResult {
  endpoint: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  data?: any;
  error?: string;
}

export default function BYMATestPage() {
  const [results, setResults] = useState<TestResult[]>([
    { endpoint: '/api/byma/token', status: 'pending' },
    { endpoint: '/api/byma/instruments', status: 'pending' },
    { endpoint: '/api/byma/prices', status: 'pending' },
    { endpoint: '/api/byma/market-summary', status: 'pending' },
  ]);

  const testEndpoint = async (index: number) => {
    const endpoint = results[index].endpoint;

    setResults(prev => prev.map((r, i) =>
      i === index ? { ...r, status: 'loading' as const } : r
    ));

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      setResults(prev => prev.map((r, i) =>
        i === index ? {
          ...r,
          status: data.success ? 'success' as const : 'error' as const,
          data: data.success ? data : undefined,
          error: !data.success ? data.message : undefined
        } : r
      ));
    } catch (error) {
      setResults(prev => prev.map((r, i) =>
        i === index ? {
          ...r,
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : r
      ));
    }
  };

  const testAll = async () => {
    for (let i = 0; i < results.length; i++) {
      await testEndpoint(i);
      // Wait a bit between requests
      if (i < results.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'loading': return 'bg-blue-500 animate-pulse';
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
    }
  };

  const getStatusText = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'loading': return 'Cargando...';
      case 'success': return 'Éxito';
      case 'error': return 'Error';
    }
  };

  return (
    <div className="min-h-screen bg-[#021751] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-[#1036E2] hover:text-[#4C68E9] text-sm mb-4 inline-block"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl font-bold mb-2">Prueba de Integración BYMA</h1>
          <p className="text-white/60">
            Verifica que la conexión con la API de BYMA esté funcionando correctamente
          </p>
        </div>

        {/* Configuration Status */}
        <div className="bg-[#1036E2]/10 border border-[#1036E2]/20 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-3">Estado de Configuración</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Asegúrate de configurar tus credenciales en <code className="bg-black/30 px-2 py-1 rounded">.env.local</code></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Variables requeridas: BYMA_CLIENT_ID, BYMA_CLIENT_SECRET</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Ambiente actual: {process.env.NEXT_PUBLIC_BYMA_ENVIRONMENT || 'homologation'}</span>
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="mb-6">
          <button
            onClick={testAll}
            className="px-6 py-3 bg-[#1036E2] text-white rounded-full hover:bg-[#4C68E9] transition-all font-medium"
          >
            Probar Todos los Endpoints
          </button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={result.endpoint}
              className="bg-black/20 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(result.status)}`}></div>
                  <div>
                    <h3 className="font-semibold">{result.endpoint}</h3>
                    <p className="text-sm text-white/60">{getStatusText(result.status)}</p>
                  </div>
                </div>
                <button
                  onClick={() => testEndpoint(index)}
                  disabled={result.status === 'loading'}
                  className="px-4 py-2 bg-[#1036E2]/30 text-white text-sm rounded-full hover:bg-[#1036E2]/50 transition-all disabled:opacity-50"
                >
                  Probar
                </button>
              </div>

              {/* Success Data */}
              {result.status === 'success' && result.data && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm font-semibold mb-2">Respuesta:</p>
                  <pre className="text-xs overflow-x-auto text-green-300">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* Error Message */}
              {result.status === 'error' && result.error && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm font-semibold mb-2">Error:</p>
                  <p className="text-red-300 text-sm">{result.error}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Documentation Link */}
        <div className="mt-8 p-6 bg-[#00C600]/10 border border-[#00C600]/20 rounded-2xl">
          <h3 className="text-lg font-semibold mb-2">Documentación</h3>
          <p className="text-white/60 text-sm mb-3">
            Para más información sobre cómo usar la integración BYMA, consulta el archivo BYMA_INTEGRATION.md
          </p>
          <div className="text-sm text-white/60">
            <p>Endpoints disponibles:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>GET /api/byma/token - Obtener token OAuth</li>
              <li>GET /api/byma/instruments - Listar instrumentos</li>
              <li>GET /api/byma/prices - Obtener precios</li>
              <li>GET /api/byma/market-summary - Resumen del mercado</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
