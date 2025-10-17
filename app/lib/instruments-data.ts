/**
 * Base de datos de instrumentos del mercado argentino
 * Para autocompletar nombres y asignar categorías
 */

export interface InstrumentData {
  symbol: string;
  name: string;
  category: string;
}

export const INSTRUMENTS_DATABASE: Record<string, InstrumentData> = {
  // Acciones Argentinas - Líderes
  'GGAL': { symbol: 'GGAL', name: 'Grupo Financiero Galicia', category: 'Acciones' },
  'YPF': { symbol: 'YPF', name: 'YPF S.A.', category: 'Acciones' },
  'PAMP': { symbol: 'PAMP', name: 'Pampa Energía', category: 'Acciones' },
  'BMA': { symbol: 'BMA', name: 'Banco Macro', category: 'Acciones' },
  'TXAR': { symbol: 'TXAR', name: 'Ternium Argentina', category: 'Acciones' },
  'ALUA': { symbol: 'ALUA', name: 'Aluar Aluminio Argentino', category: 'Acciones' },
  'COME': { symbol: 'COME', name: 'Sociedad Comercial del Plata', category: 'Acciones' },
  'CRES': { symbol: 'CRES', name: 'Cresud', category: 'Acciones' },
  'EDN': { symbol: 'EDN', name: 'Edenor', category: 'Acciones' },
  'TGSU2': { symbol: 'TGSU2', name: 'Transportadora de Gas del Sur', category: 'Acciones' },
  'MIRG': { symbol: 'MIRG', name: 'Mirgor', category: 'Acciones' },
  'LOMA': { symbol: 'LOMA', name: 'Loma Negra', category: 'Acciones' },
  'SUPV': { symbol: 'SUPV', name: 'Grupo Supervielle', category: 'Acciones' },
  'TRAN': { symbol: 'TRAN', name: 'Transener', category: 'Acciones' },
  'VALO': { symbol: 'VALO', name: 'Grupo Financiero Valores', category: 'Acciones' },

  // Bonos Soberanos en Dólares
  'AL30': { symbol: 'AL30', name: 'Boncer 2030', category: 'Bonos Soberanos' },
  'AL29': { symbol: 'AL29', name: 'Boncer 2029', category: 'Bonos Soberanos' },
  'GD30': { symbol: 'GD30', name: 'Global 2030', category: 'Bonos Soberanos' },
  'GD29': { symbol: 'GD29', name: 'Global 2029', category: 'Bonos Soberanos' },
  'GD35': { symbol: 'GD35', name: 'Global 2035', category: 'Bonos Soberanos' },
  'GD38': { symbol: 'GD38', name: 'Global 2038', category: 'Bonos Soberanos' },
  'GD41': { symbol: 'GD41', name: 'Global 2041', category: 'Bonos Soberanos' },
  'GD46': { symbol: 'GD46', name: 'Global 2046', category: 'Bonos Soberanos' },
  'AE38': { symbol: 'AE38', name: 'Boncer 2038', category: 'Bonos Soberanos' },
  'AL35': { symbol: 'AL35', name: 'Boncer 2035', category: 'Bonos Soberanos' },

  // Bonos Soberanos en Pesos
  'CUAP': { symbol: 'CUAP', name: 'Bono CER', category: 'Bonos Soberanos' },
  'T2X4': { symbol: 'T2X4', name: 'Bono del Tesoro 2024', category: 'Bonos Soberanos' },
  'S31O4': { symbol: 'S31O4', name: 'Bonte 2024', category: 'Bonos Soberanos' },

  // Bonos Corporativos
  'YPFD': { symbol: 'YPFD', name: 'Bono YPF Clase D', category: 'Bonos Corporativos' },
  'TVPP': { symbol: 'TVPP', name: 'Bono Telecom', category: 'Bonos Corporativos' },
  'PAMP1': { symbol: 'PAMP1', name: 'Bono Pampa Energía 2026', category: 'Bonos Corporativos' },

  // CEDEARs - Tech
  'AAPL': { symbol: 'AAPL', name: 'Apple Inc.', category: 'CEDEARs' },
  'GOOGL': { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', category: 'CEDEARs' },
  'MSFT': { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'CEDEARs' },
  'AMZN': { symbol: 'AMZN', name: 'Amazon.com Inc.', category: 'CEDEARs' },
  'META': { symbol: 'META', name: 'Meta Platforms Inc. (Facebook)', category: 'CEDEARs' },
  'TSLA': { symbol: 'TSLA', name: 'Tesla Inc.', category: 'CEDEARs' },
  'NFLX': { symbol: 'NFLX', name: 'Netflix Inc.', category: 'CEDEARs' },
  'NVDA': { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'CEDEARs' },

  // CEDEARs - Latinoamérica
  'MELI': { symbol: 'MELI', name: 'MercadoLibre Inc.', category: 'CEDEARs' },
  'GLOB': { symbol: 'GLOB', name: 'Globant S.A.', category: 'CEDEARs' },
  'DESP': { symbol: 'DESP', name: 'Despegar.com', category: 'CEDEARs' },
  'LOMA': { symbol: 'LOMA', name: 'Loma Negra', category: 'CEDEARs' },

  // CEDEARs - Financiero
  'JPM': { symbol: 'JPM', name: 'JPMorgan Chase & Co.', category: 'CEDEARs' },
  'BAC': { symbol: 'BAC', name: 'Bank of America', category: 'CEDEARs' },
  'C': { symbol: 'C', name: 'Citigroup Inc.', category: 'CEDEARs' },
  'WFC': { symbol: 'WFC', name: 'Wells Fargo & Company', category: 'CEDEARs' },
  'V': { symbol: 'V', name: 'Visa Inc.', category: 'CEDEARs' },
  'MA': { symbol: 'MA', name: 'Mastercard Inc.', category: 'CEDEARs' },

  // CEDEARs - Retail y Consumo
  'KO': { symbol: 'KO', name: 'The Coca-Cola Company', category: 'CEDEARs' },
  'PEP': { symbol: 'PEP', name: 'PepsiCo Inc.', category: 'CEDEARs' },
  'WMT': { symbol: 'WMT', name: 'Walmart Inc.', category: 'CEDEARs' },
  'NKE': { symbol: 'NKE', name: 'Nike Inc.', category: 'CEDEARs' },
  'DIS': { symbol: 'DIS', name: 'The Walt Disney Company', category: 'CEDEARs' },

  // CEDEARs - Energía
  'XOM': { symbol: 'XOM', name: 'Exxon Mobil Corporation', category: 'CEDEARs' },
  'CVX': { symbol: 'CVX', name: 'Chevron Corporation', category: 'CEDEARs' },

  // ETFs
  'SPY': { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', category: 'ETFs' },
  'QQQ': { symbol: 'QQQ', name: 'Invesco QQQ Trust', category: 'ETFs' },
  'EEM': { symbol: 'EEM', name: 'iShares MSCI Emerging Markets ETF', category: 'ETFs' },
  'GLD': { symbol: 'GLD', name: 'SPDR Gold Trust', category: 'ETFs' },

  // Criptomonedas populares
  'BTC': { symbol: 'BTC', name: 'Bitcoin', category: 'Criptomonedas' },
  'ETH': { symbol: 'ETH', name: 'Ethereum', category: 'Criptomonedas' },
  'USDT': { symbol: 'USDT', name: 'Tether', category: 'Stablecoins' },
  'USDC': { symbol: 'USDC', name: 'USD Coin', category: 'Stablecoins' },
  'BNB': { symbol: 'BNB', name: 'Binance Coin', category: 'Criptomonedas' },
  'IBIT': { symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', category: 'ETFs Cripto' },
  'FBTC': { symbol: 'FBTC', name: 'Fidelity Wise Origin Bitcoin Fund', category: 'ETFs Cripto' },
};

/**
 * Busca un instrumento por símbolo
 */
export function findInstrument(symbol: string): InstrumentData | null {
  const upperSymbol = symbol.toUpperCase().trim();
  return INSTRUMENTS_DATABASE[upperSymbol] || null;
}

/**
 * Busca instrumentos que coincidan parcialmente con el símbolo
 */
export function searchInstruments(query: string): InstrumentData[] {
  const upperQuery = query.toUpperCase().trim();

  if (!upperQuery) return [];

  return Object.values(INSTRUMENTS_DATABASE).filter(
    inst =>
      inst.symbol.includes(upperQuery) ||
      inst.name.toUpperCase().includes(upperQuery)
  ).slice(0, 10); // Limitar a 10 resultados
}

/**
 * Categorías disponibles
 */
export const CATEGORIES = [
  'Acciones',
  'Bonos Soberanos',
  'Bonos Corporativos',
  'CEDEARs',
  'ETFs',
  'ETFs Cripto',
  'Criptomonedas',
  'Stablecoins',
  'Fondos Comunes',
  'Otros',
];
