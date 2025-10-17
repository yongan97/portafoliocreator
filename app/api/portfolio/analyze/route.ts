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
    'Acciones': `${inst.name} (${inst.symbol}) representa participación en el capital social de la empresa. Permite obtener retornos por apreciación del precio y distribución de dividendos. Opera en un mercado de alta volatilidad influenciado por variables macroeconómicas locales. Instrumento apropiado para inversores con horizonte de mediano a largo plazo que buscan crecimiento superior a la inflación.`,

    'Bonos Soberanos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por el Estado Nacional Argentino. Ofrece pagos periódicos de intereses y devolución del capital al vencimiento. Puede estar denominado en pesos, dólares o ajustado por CER, cada uno con su perfil de riesgo específico. Apropiado para inversores que buscan flujos de ingresos predecibles asumiendo riesgo soberano.`,

    'Bonos Corporativos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por una empresa privada. El riesgo crediticio depende de la salud financiera de la emisora. Ofrece rendimientos superiores a bonos soberanos del mismo plazo para compensar el riesgo adicional. Adecuado para inversores que buscan diversificación crediticia y mayores retornos con análisis fundamental de la compañía.`,

    'CEDEARs': `${inst.name} (${inst.symbol}) es un Certificado de Depósito Argentino que representa acciones de compañías extranjeras. Permite acceso a activos internacionales operando en pesos desde el mercado local. Brinda exposición dual: al desempeño de la empresa internacional y al tipo de cambio (MEP/CCL). Ideal para diversificación geográfica, cobertura cambiaria y acceso a sectores globales.`,

    'ETFs': `${inst.name} (${inst.symbol}) es un fondo cotizado que ofrece exposición diversificada a un conjunto de activos. Replica índices de mercado, sectores o regiones con alta liquidez y bajos costos de gestión (0.05%-0.70% anual). Proporciona diversificación instantánea, rebalanceo automático y transparencia diaria de composición. Apropiado para cualquier perfil de inversor según el ETF elegido.`,

    'ETFs Cripto': `${inst.name} (${inst.symbol}) es un fondo cotizado especializado que brinda exposición al mercado de criptomonedas sin necesidad de gestionar wallets o claves privadas. Opera en bolsas reguladas con custodia institucional de los activos digitales. Presenta volatilidad extrema característica del mercado cripto. Apropiado exclusivamente para inversores con perfil dinámico/agresivo, representando máximo 5-10% del portafolio total.`,

    'Criptomonedas': `${inst.name} (${inst.symbol}) es un activo digital descentralizado que opera sobre tecnología blockchain. La inversión directa implica responsabilidad completa sobre custodia y seguridad mediante gestión de wallets. Presenta volatilidad extrema con caídas/subas superiores a 20-50% en períodos cortos. Ofrece potencial de diversificación alternativa y cobertura contra inflación fiat. Solo apropiado para inversores sofisticados con perfil agresivo, capital prescindible y horizonte de muy largo plazo.`,
  };

  return descriptions[category] || `${inst.name} (${inst.symbol}) es un instrumento financiero de la categoría ${category} que ofrece oportunidades de inversión específicas según el perfil y objetivos del inversor.`;
}

