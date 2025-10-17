/**
 * Tipos y definiciones para carteras de inversión
 */

export type RiskProfile = 'conservador' | 'moderado' | 'dinámico';

export interface Instrument {
  symbol: string;
  name: string;
  percentage: number;
  amount?: number;
  currentPrice?: number;
  category?: string; // Acciones, Bonos, CEDEARs, etc.
}

export interface ClientInfo {
  name: string;
  email?: string;
  phone?: string;
  riskProfile: RiskProfile;
}

export interface Portfolio {
  id: string;
  clientInfo: ClientInfo;
  instruments: Instrument[];
  totalAmount?: number;
  createdAt: Date;
  notes?: string;
}

export interface PortfolioAnalysis {
  summary: string;
  instrumentDetails: InstrumentAnalysis[];
  news: NewsItem[];
  recommendations?: string;
}

export interface InstrumentAnalysis {
  symbol: string;
  name: string;
  description: string;
  sector?: string;
  risks?: string;
  opportunities?: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  date: string;
  source?: string;
  relevantSymbols: string[];
}

export const RISK_PROFILES: Record<RiskProfile, { label: string; description: string; color: string }> = {
  conservador: {
    label: 'Conservador',
    description: 'Prioriza la preservación del capital con menor volatilidad',
    color: '#1036E2', // Azul Impulso
  },
  moderado: {
    label: 'Moderado',
    description: 'Balance entre crecimiento y estabilidad',
    color: '#4C68E9', // Azul Secundario
  },
  dinámico: {
    label: 'Dinámico',
    description: 'Busca máximo crecimiento asumiendo mayor riesgo',
    color: '#00C600', // Verde Activo
  },
};
