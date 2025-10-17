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
    'Acciones': `${inst.name} (${inst.symbol}) es una acción que representa una participación en el capital social de la empresa, otorgando derechos de propiedad proporcionales al inversor. Este tipo de activo permite participar directamente en el crecimiento y resultados del negocio. Las acciones argentinas operan en un mercado caracterizado por alta volatilidad debido al contexto macroeconómico local, incluyendo factores como inflación, tipo de cambio, política monetaria del BCRA, y ciclos políticos. Los inversores pueden obtener retornos a través de dos vías principales: la apreciación del precio de la acción en el mercado secundario, y la distribución de dividendos cuando la empresa decide repartir utilidades entre sus accionistas. Es importante considerar que las empresas locales pueden estar expuestas a riesgo cambiario si mantienen deudas en moneda extranjera, lo que puede afectar sus balances ante devaluaciones. La liquidez de cada acción varía según su volumen de negociación diario, siendo las de mayor capitalización generalmente más líquidas. Este instrumento es particularmente adecuado para inversores con horizonte de mediano a largo plazo que buscan potencial de crecimiento superior a la inflación y están dispuestos a asumir volatilidad en sus carteras. La diversificación sectorial es clave al invertir en acciones para mitigar riesgos específicos de industria.`,

    'Bonos Soberanos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por el Estado Nacional Argentino para financiar sus operaciones y refinanciar pasivos existentes. Al adquirir este bono, el inversor está prestando dinero al gobierno nacional a cambio de pagos periódicos de intereses (cupones) y la devolución del capital al vencimiento. Los bonos soberanos argentinos presentan características particulares debido al historial crediticio del país, que incluye múltiples reestructuraciones de deuda. El riesgo país, medido por el EMBI, es un indicador clave que refleja la percepción de riesgo de default. Estos instrumentos pueden estar denominados en pesos, dólares o ajustados por CER (inflación), cada uno con su perfil de riesgo y rendimiento específico. Los bonos en dólares ofrecen cobertura cambiaria pero están sujetos a riesgo soberano y potenciales restricciones al pago. Los bonos en pesos pueden ofrecer tasas nominales elevadas que deben evaluarse en términos reales considerando la inflación. Los bonos CER ajustan el capital por inflación, protegiendo el poder adquisitivo. La liquidez varía según el instrumento, siendo algunos más negociados que otros. Los rendimientos de estos bonos suelen ser atractivos en contextos de tasas altas, aunque el riesgo de restructuración o default debe ser evaluado cuidadosamente. Son instrumentos apropiados para inversores que buscan flujos de ingresos predecibles y están dispuestos a asumir riesgo soberano.`,

    'Bonos Corporativos': `${inst.name} (${inst.symbol}) es un título de deuda emitido por una empresa privada para financiar sus operaciones, proyectos de expansión o refinanciar obligaciones existentes. A diferencia de los bonos soberanos, el riesgo crediticio depende de la salud financiera y capacidad de pago de la empresa emisora específica. Los inversores reciben cupones de intereses periódicos y la devolución del principal al vencimiento. El análisis fundamental de la compañía es crucial: debe evaluarse su situación patrimonial, flujo de caja, nivel de endeudamiento, rentabilidad operativa, posición competitiva en su industria, y calidad del management. Las calificadoras de riesgo asignan ratings a estos instrumentos que orientan sobre su calidad crediticia. Los bonos corporativos argentinos generalmente ofrecen rendimientos superiores a los bonos soberanos del mismo plazo (spread crediticio) para compensar el riesgo adicional de default empresarial. La liquidez suele ser menor que la de bonos soberanos, lo que puede dificultar la venta antes del vencimiento. Algunos bonos corporativos incluyen covenants (cláusulas de protección) que limitan ciertas acciones de la empresa para proteger a los tenedores. Estos instrumentos son especialmente sensibles a cambios en las tasas de interés de mercado, mostrando relación inversa entre tasas y precios. Son adecuados para inversores que buscan diversificación crediticia más allá del riesgo soberano, mayores rendimientos que los bonos gubernamentales, y tienen capacidad de analizar fundamentals empresariales o confían en el análisis de su asesor financiero.`,

    'CEDEARs': `${inst.name} (${inst.symbol}) es un Certificado de Depósito Argentino que representa acciones de compañías extranjeras (principalmente estadounidenses) que cotizan en mercados internacionales. Funcionan como un vehículo que permite a inversores locales acceder a activos del exterior operando desde el mercado argentino en pesos, sin necesidad de abrir cuentas en el extranjero. Cada CEDEAR representa una cantidad específica de acciones de la empresa subyacente (la ratio de conversión varía según el instrumento). El precio del CEDEAR en pesos refleja tanto el valor de la acción en su mercado original como el tipo de cambio implícito (dólar MEP o CCL). Por lo tanto, invertir en CEDEARs brinda exposición dual: al desempeño de la empresa internacional y al tipo de cambio. Esto los convierte en una herramienta de dolarización de portafolio y cobertura ante devaluación del peso. Los CEDEARs pueden pagar dividendos cuando la empresa subyacente los distribuye, abonándose en pesos al tipo de cambio vigente. Es importante considerar que están sujetos tanto a la volatilidad del mercado estadounidense como a las variaciones cambiarias locales. Los CEDEARs de empresas tecnológicas líderes (Apple, Microsoft, Google, Tesla, etc.) permiten participar en el crecimiento de la economía digital global. También existen CEDEARs de otros sectores como consumo, salud, finanzas y energía. La liquidez varía considerablemente: los CEDEARs más populares tienen alta liquidez y spreads ajustados, mientras que otros pueden ser menos líquidos. Estos instrumentos son ideales para inversores que buscan diversificación geográfica, exposición a compañías líderes globales, cobertura cambiaria, y participar en sectores o industrias no disponibles en el mercado local argentino.`,

    'ETFs': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund (Fondo Cotizado en Bolsa) que ofrece exposición diversificada a un conjunto de activos mediante un único instrumento que cotiza como una acción. Los ETFs replican índices de mercado, sectores, regiones geográficas, materias primas o estrategias de inversión específicas. Su principal ventaja es la diversificación instantánea: con una sola operación, el inversor obtiene exposición a decenas o cientos de activos subyacentes. Los ETFs operan con alta liquidez durante todo el horario de mercado, permitiendo comprar y vender en tiempo real a precios de mercado. Presentan costos significativamente inferiores a los fondos mutuos tradicionales: las comisiones de gestión anuales típicamente oscilan entre 0.05% y 0.70% dependiendo del ETF. El proceso de creación y redención de unidades por parte de participantes autorizados asegura que el precio del ETF se mantenga muy cercano al valor de sus activos subyacentes (NAV), minimizando el tracking error. Existen ETFs para prácticamente cualquier estrategia: índices amplios (S&P 500), sectores específicos (tecnología, salud), regiones (mercados emergentes), commodities (oro, petróleo), bonos de distintos plazos y calidades crediticias, e incluso estrategias alternativas. Los ETFs realizan rebalanceo automático según la metodología del índice que replican, liberando al inversor de esta tarea. Algunos distribuyen dividendos periódicamente mientras otros los reinvierten automáticamente (acumulativos). Son transparentes en cuanto a sus holdings, publicando diariamente su composición. Los ETFs en Argentina pueden ser locales (CEDEARs de ETFs internacionales) o extranjeros accedidos a través de cuentas globales. Son instrumentos apropiados para cualquier tipo de inversor que valore la diversificación, los bajos costos, la liquidez, la transparencia y la simplicidad operativa, desde perfiles conservadores hasta dinámicos según el ETF elegido.`,

    'ETFs Cripto': `${inst.name} (${inst.symbol}) es un Exchange Traded Fund especializado que proporciona exposición al mercado de criptomonedas y activos digitales a través de un vehículo de inversión regulado y tradicional. Estos ETFs permiten a inversores participar en el potencial de crecimiento de Bitcoin, Ethereum y otros criptoactivos sin las complejidades técnicas y riesgos operativos de adquirir, custodiar y gestionar criptomonedas directamente. Los inversores no necesitan crear wallets digitales, gestionar claves privadas, preocuparse por la seguridad de custodia, ni navegar exchanges de criptomonedas. El ETF asume toda la responsabilidad de custodia segura de los activos digitales subyacentes, típicamente utilizando custodios institucionales especializados. Estos instrumentos operan en bolsas reguladas tradicionales, ofreciendo la liquidez, transparencia y protección regulatoria de los mercados de valores convencionales. Los inversores pueden comprar y vender durante el horario de mercado con liquidación estándar. Los ETFs cripto pueden enfocarse exclusivamente en Bitcoin, en Ethereum, en una canasta diversificada de criptomonedas, o incluso en empresas relacionadas con blockchain y criptoeconomía. Es crucial entender que heredan la extraordinaria volatilidad característica del mercado cripto: movimientos diarios de dos dígitos porcentuales no son infrecuentes. También están expuestos a riesgos regulatorios (cambios en legislación sobre criptoactivos), riesgos tecnológicos (vulnerabilidades en protocolos blockchain), y riesgos de mercado (falta de liquidez en momentos de estrés). Los costos de gestión suelen ser más elevados que ETFs tradicionales debido a la complejidad de custodia de criptoactivos. Estos instrumentos son apropiados exclusivamente para inversores con perfil dinámico o agresivo, alta tolerancia a la volatilidad, horizonte de inversión de largo plazo, y que comprenden los fundamentos de criptomonedas y tecnología blockchain. Deben representar una fracción limitada del portafolio total, típicamente no más de 5-10%, dada su alta correlación interna y volatilidad extrema.`,

    'Criptomonedas': `${inst.name} (${inst.symbol}) es un activo digital descentralizado que opera sobre tecnología blockchain, funcionando como medio de intercambio, reserva de valor, o plataforma para aplicaciones descentralizadas según su diseño específico. Las criptomonedas representan una clase de activo completamente nueva que desafía paradigmas tradicionales de dinero, inversión y organización económica. Bitcoin, la primera y más conocida, funciona primariamente como reserva de valor digital ("oro digital") con suministro limitado a 21 millones de unidades. Ethereum es tanto criptomoneda como plataforma para smart contracts y aplicaciones descentralizadas (DeFi, NFTs). Otras criptomonedas ofrecen distintas propuestas de valor: privacidad transaccional, mayor velocidad, menores costos, o funcionalidades específicas. La inversión directa en criptomonedas implica responsabilidad completa sobre custodia y seguridad: el inversor debe gestionar wallets (calientes o frías), proteger claves privadas, y tomar precauciones contra hackeos o pérdida de acceso (que resulta en pérdida total e irrecuperable de fondos). Operar requiere familiaridad con exchanges de criptomonedas, comprensión de tipos de órdenes, y nociones de seguridad operacional. La volatilidad es extrema: caídas o subas de 20-50% en días o semanas son comunes, con mercados bajistas históricos superiores a 80%. Los factores que impactan precios incluyen: adopción institucional, regulaciones gubernamentales, desarrollos tecnológicos, sentiment de mercado, y ciclos de halving (en Bitcoin). No existe valor intrínseco tradicional ni flujos de caja que permitan valuación fundamental clásica; la valuación depende de adopción, utilidad y percepción de valor futuro. Las criptomonedas ofrecen beneficios potenciales: cobertura contra inflación fiat, diversificación alternativa no correlacionada con activos tradicionales, exposición a innovación tecnológica disruptiva, y potencial de apreciación explosiva en etapas tempranas de adopción. Los riesgos son severos: pérdida total del capital, riesgo de hacking o fraude, incertidumbre regulatoria (prohibiciones parciales o totales en distintos países), obsolescencia tecnológica, y extrema volatilidad psicológicamente difícil de manejar. Estas inversiones son apropiadas únicamente para inversores sofisticados con perfil agresivo, capital que pueden permitirse perder completamente, horizonte de muy largo plazo (varios años mínimo), conocimiento profundo de la tecnología y dinámica del mercado cripto, y capacidad emocional para atravesar drawdowns severos sin vender en pánico. No deben representar más del 5-10% de un portafolio diversificado.`,
  };

  return descriptions[category] || `${inst.name} (${inst.symbol}) es un instrumento financiero de la categoría ${category} que ofrece oportunidades de inversión específicas según el perfil y objetivos del inversor.`;
}

