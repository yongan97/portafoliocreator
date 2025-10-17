import { NextRequest, NextResponse } from 'next/server';

interface AnalyzeRequest {
  instruments: Array<{
    symbol: string;
    name: string;
    percentage: number;
    category?: string;
  }>;
  riskProfile: string;
  clientName?: string;
}

/**
 * API endpoint para analizar cartera (versión gratuita sin IA)
 * POST /api/portfolio/analyze
 */
export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { instruments, riskProfile, clientName } = body;

    if (!instruments || instruments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron instrumentos' },
        { status: 400 }
      );
    }

    // Generar análisis básico sin IA
    const analysisData = generateBasicAnalysis(instruments, riskProfile, clientName);

    return NextResponse.json({
      success: true,
      data: analysisData,
    });

  } catch (error) {
    console.error('Error analyzing portfolio:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al analizar la cartera',
      },
      { status: 500 }
    );
  }
}

/**
 * Genera un análisis básico de la cartera sin usar IA
 */
function generateBasicAnalysis(
  instruments: Array<{ symbol: string; name: string; percentage: number; category?: string }>,
  riskProfile: string,
  clientName?: string
) {
  // Calcular distribución por categoría
  const categoryDistribution: Record<string, number> = {};
  instruments.forEach(inst => {
    const category = inst.category || 'Otros';
    categoryDistribution[category] = (categoryDistribution[category] || 0) + inst.percentage;
  });

  // Determinar diversificación
  const numInstruments = instruments.length;
  const maxConcentration = Math.max(...instruments.map(i => i.percentage));
  const isDiversified = numInstruments >= 5 && maxConcentration < 40;

  // Generar resumen ejecutivo
  const summary = generateSummary(instruments, riskProfile, categoryDistribution, isDiversified);

  // Análisis de cada instrumento
  const instrumentDetails = instruments.map(inst => ({
    symbol: inst.symbol,
    name: inst.name,
    description: getInstrumentDescription(inst),
    sector: inst.category || 'No especificado',
  }));

  return {
    summary,
    instrumentDetails,
  };
}

function generateSummary(
  instruments: Array<{ symbol: string; name: string; percentage: number; category?: string }>,
  riskProfile: string,
  categoryDistribution: Record<string, number>,
  isDiversified: boolean
): string {
  const numInstruments = instruments.length;
  const categories = Object.keys(categoryDistribution);

  let summary = `Esta cartera está compuesta por ${numInstruments} instrumento${numInstruments > 1 ? 's' : ''} `;
  summary += `distribuidos en ${categories.length} categoría${categories.length > 1 ? 's' : ''}: `;
  summary += categories.map(cat => `${cat} (${categoryDistribution[cat].toFixed(1)}%)`).join(', ') + '. ';

  // Alineación con perfil de riesgo
  const riskLabels: Record<string, string> = {
    conservador: 'perfil conservador',
    moderado: 'perfil moderado',
    dinámico: 'perfil dinámico',
  };

  summary += `El perfil seleccionado es ${riskLabels[riskProfile] || riskProfile}, `;

  if (isDiversified) {
    summary += 'y la cartera presenta una buena diversificación que puede ayudar a mitigar riesgos. ';
  } else {
    summary += 'aunque se recomienda considerar una mayor diversificación para reducir el riesgo de concentración. ';
  }

  summary += 'Esta propuesta busca balancear rentabilidad potencial con gestión de riesgos según el perfil del cliente.';

  return summary;
}

function getInstrumentDescription(inst: { symbol: string; name: string; category?: string }): string {
  const category = inst.category || 'Instrumento financiero';

  const descriptions: Record<string, string> = {
    'Acciones': `${inst.name} (${inst.symbol}) es una acción que representa una participación en el capital social de la empresa, otorgando derechos de propiedad proporcionales al inversor.`,

    'Bonos Soberanos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por el Estado Nacional Argentino, mediante el cual el inversor presta dinero al gobierno a cambio de pagos periódicos de intereses y la devolución del capital al vencimiento.`,

    'Bonos Corporativos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por una empresa privada para financiar sus operaciones, mediante el cual el inversor recibe cupones de intereses periódicos y la devolución del principal al vencimiento.`,

    'CEDEARs': `${inst.name} (${inst.symbol}) es un Certificado de Depósito Argentino que representa acciones de una compañía extranjera, permitiendo a inversores locales acceder a activos internacionales operando desde el mercado argentino.`,

    'ETFs': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund (fondo cotizado en bolsa) que ofrece exposición diversificada a un conjunto de activos mediante un único instrumento que cotiza como una acción.`,

    'ETFs Cripto': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund especializado que proporciona exposición al mercado de criptomonedas y activos digitales a través de un vehículo de inversión regulado.`,

    'Criptomonedas': `${inst.name} (${inst.symbol}) es un activo digital descentralizado que opera sobre tecnología blockchain, funcionando como medio de intercambio, reserva de valor, o plataforma para aplicaciones descentralizadas.`,
  };

  return descriptions[category] || `${inst.name} (${inst.symbol}) es un instrumento financiero de la categoría ${category} que ofrece oportunidades de inversión específicas según el perfil y objetivos del inversor.`;
}

