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
    risks: getBasicRisks(inst.category || ''),
    opportunities: getBasicOpportunities(inst.category || ''),
  }));

  // Noticias genéricas
  const news = generateBasicNews(instruments);

  // Recomendaciones
  const recommendations = generateRecommendations(riskProfile, categoryDistribution, isDiversified, maxConcentration);

  return {
    summary,
    instrumentDetails,
    news,
    recommendations,
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
    'Acciones': `${inst.name} es una acción que representa participación en el capital de la empresa. Las acciones ofrecen potencial de crecimiento a través de apreciación del precio y posibles dividendos.`,
    'Bonos Soberanos': `${inst.name} es un bono emitido por el gobierno argentino. Los bonos soberanos ofrecen flujos de ingresos predecibles mediante cupones periódicos.`,
    'Bonos Corporativos': `${inst.name} es un bono emitido por una empresa. Estos instrumentos ofrecen rendimientos mediante cupones y devolución del capital al vencimiento.`,
    'CEDEARs': `${inst.name} es un CEDEAR (Certificado de Depósito Argentino) que representa acciones de empresas extranjeras. Permite exposición internacional desde el mercado local.`,
    'ETFs': `${inst.name} es un ETF (Exchange Traded Fund) que replica un índice o conjunto de activos. Ofrece diversificación instantánea con liquidez de mercado.`,
    'ETFs Cripto': `${inst.name} es un ETF que brinda exposición al mercado de criptomonedas de forma regulada, sin necesidad de custodia directa de activos digitales.`,
    'Criptomonedas': `${inst.name} es una criptomoneda que opera en tecnología blockchain. Activo de alta volatilidad con potencial de crecimiento significativo.`,
  };

  return descriptions[category] || `${inst.name} es un instrumento financiero de la categoría ${category}.`;
}

function getBasicRisks(category: string): string {
  const risks: Record<string, string> = {
    'Acciones': 'Volatilidad de mercado, riesgo cambiario (para empresas con deuda en USD), contexto macroeconómico argentino, liquidez.',
    'Bonos Soberanos': 'Riesgo país, riesgo de default, volatilidad por cambios en tasas de interés, riesgo de restructuración.',
    'Bonos Corporativos': 'Riesgo crediticio de la empresa emisora, sensibilidad a tasas de interés, menor liquidez que bonos soberanos.',
    'CEDEARs': 'Riesgo cambiario (dólar CCL/MEP), volatilidad del mercado estadounidense, riesgo regulatorio local.',
    'ETFs': 'Riesgo de mercado del índice subyacente, comisiones de gestión, tracking error.',
    'ETFs Cripto': 'Alta volatilidad, riesgo regulatorio, exposición a activos digitales de alto riesgo.',
    'Criptomonedas': 'Volatilidad extrema, riesgo de custodia, riesgo regulatorio, potencial pérdida total.',
  };

  return risks[category] || 'Riesgo de mercado, volatilidad, liquidez.';
}

function getBasicOpportunities(category: string): string {
  const opportunities: Record<string, string> = {
    'Acciones': 'Potencial de crecimiento superior a inflación, dividendos, participación en crecimiento empresarial.',
    'Bonos Soberanos': 'Rendimientos atractivos en contexto de tasas altas, flujo de ingresos predecible, oportunidad de carry trade.',
    'Bonos Corporativos': 'Mayores rendimientos que bonos soberanos, diversificación crediticia, análisis fundamental de empresas.',
    'CEDEARs': 'Diversificación internacional, acceso a empresas líderes globales, cobertura ante devaluación.',
    'ETFs': 'Diversificación inmediata, bajos costos, liquidez, rebalanceo automático.',
    'ETFs Cripto': 'Exposición regulada a criptomonedas, sin complejidad de wallets, liquidez de mercado tradicional.',
    'Criptomonedas': 'Alto potencial de revalorización, cobertura ante inflación, diversificación alternativa.',
  };

  return opportunities[category] || 'Potencial de rentabilidad acorde al perfil de riesgo seleccionado.';
}

function generateBasicNews(instruments: Array<{ symbol: string; name: string; category?: string }>): Array<{
  title: string;
  summary: string;
  date: string;
  relevantSymbols: string[];
}> {
  const today = new Date().toLocaleDateString('es-AR');

  return [
    {
      title: 'Contexto del Mercado Argentino',
      summary: 'El mercado argentino continúa operando en un contexto de alta volatilidad influenciado por variables macroeconómicas como inflación, política monetaria del BCRA y expectativas sobre el tipo de cambio. Los inversores mantienen atención en indicadores económicos clave.',
      date: today,
      relevantSymbols: instruments.map(i => i.symbol),
    },
    {
      title: 'Importancia de la Diversificación',
      summary: 'Los analistas recomiendan mantener carteras diversificadas que incluyan distintas clases de activos para mitigar riesgos específicos. La combinación de renta fija y variable, junto con exposición internacional, puede ayudar a reducir la volatilidad del portafolio.',
      date: today,
      relevantSymbols: instruments.map(i => i.symbol),
    },
  ];
}

function generateRecommendations(
  riskProfile: string,
  categoryDistribution: Record<string, number>,
  isDiversified: boolean,
  maxConcentration: number
): string {
  let recommendations = '';

  // Diversificación
  if (!isDiversified) {
    recommendations += 'Se recomienda aumentar la diversificación de la cartera, idealmente distribuyendo el capital entre al menos 5-7 instrumentos diferentes. ';
  }

  // Concentración
  if (maxConcentration > 40) {
    recommendations += `Actualmente hay una concentración de ${maxConcentration.toFixed(1)}% en un solo instrumento, lo cual aumenta el riesgo. Considere reducir posiciones individuales a máximo 30-35% del total. `;
  }

  // Recomendaciones por perfil
  if (riskProfile === 'conservador') {
    const bondPercentage = (categoryDistribution['Bonos Soberanos'] || 0) + (categoryDistribution['Bonos Corporativos'] || 0);
    if (bondPercentage < 50) {
      recommendations += 'Para un perfil conservador, se sugiere incrementar la exposición a bonos (al menos 50-60% de la cartera). ';
    }
  } else if (riskProfile === 'dinámico') {
    const equityPercentage = (categoryDistribution['Acciones'] || 0) + (categoryDistribution['CEDEARs'] || 0);
    if (equityPercentage < 50) {
      recommendations += 'Para un perfil dinámico, podría considerarse mayor exposición a acciones y CEDEARs (50-70% de la cartera). ';
    }
  }

  // Recomendación general
  recommendations += 'Es importante revisar la cartera periódicamente (al menos trimestralmente) y rebalancear cuando las desviaciones superen el 5% de los objetivos establecidos. ';
  recommendations += 'Mantenga siempre un horizonte de inversión acorde a su perfil y objetivos financieros.';

  return recommendations;
}
