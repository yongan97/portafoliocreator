/**
 * BYMA Market Data Service
 * Handles queries to BYMA API for market information
 */

import { getBYMAAuthService } from './byma-auth';

interface BYMAMarketDataParams {
  symbol?: string;
  market?: string;
  limit?: number;
}

interface BYMAInstrument {
  symbol: string;
  description: string;
  market: string;
  price?: number;
  change?: number;
  volume?: number;
  lastUpdate?: string;
}

interface BYMAMarketDataResponse {
  instruments: BYMAInstrument[];
  count: number;
  timestamp: string;
}

class BYMAMarketService {
  private baseUrl: string;

  constructor(environment: 'homologation' | 'production' = 'homologation') {
    this.baseUrl = environment === 'production'
      ? 'https://api.byma.com.ar'
      : 'https://hs-api.byma.com.ar';
  }

  /**
   * Make authenticated request to BYMA API
   */
  private async makeRequest<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const authService = getBYMAAuthService();
    const token = await authService.getToken();

    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If unauthorized, clear token and retry once
        if (response.status === 401) {
          authService.clearToken();
          const newToken = await authService.getToken();

          const retryResponse = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            throw new Error(`BYMA API error: ${retryResponse.status} - ${errorText}`);
          }

          return await retryResponse.json();
        }

        const errorText = await response.text();
        throw new Error(`BYMA API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making BYMA request:', error);
      throw error;
    }
  }

  /**
   * Get market instruments/securities
   */
  async getInstruments(params?: BYMAMarketDataParams): Promise<BYMAInstrument[]> {
    const queryParams: Record<string, string> = {};

    if (params?.symbol) queryParams.symbol = params.symbol;
    if (params?.market) queryParams.market = params.market;
    if (params?.limit) queryParams.limit = params.limit.toString();

    const response = await this.makeRequest<{ data: BYMAInstrument[] }>('/instruments/', queryParams);
    return response.data || [];
  }

  /**
   * Get real-time market prices
   */
  async getMarketPrices(symbols?: string[]): Promise<BYMAInstrument[]> {
    const queryParams: Record<string, string> = {};

    if (symbols && symbols.length > 0) {
      queryParams.symbols = symbols.join(',');
    }

    const response = await this.makeRequest<{ data: BYMAInstrument[] }>('/prices/', queryParams);
    return response.data || [];
  }

  /**
   * Get specific instrument details
   */
  async getInstrumentDetails(symbol: string): Promise<BYMAInstrument | null> {
    try {
      const response = await this.makeRequest<{ data: BYMAInstrument }>(`/instruments/${symbol}/`);
      return response.data || null;
    } catch (error) {
      console.error(`Error getting instrument details for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get market summary/overview
   */
  async getMarketSummary(): Promise<BYMAMarketDataResponse> {
    const response = await this.makeRequest<{ data: BYMAInstrument[]; count: number }>('/market/summary/');

    return {
      instruments: response.data || [],
      count: response.count || 0,
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance
let marketServiceInstance: BYMAMarketService | null = null;

export function getBYMAMarketService(): BYMAMarketService {
  if (!marketServiceInstance) {
    const environment = (process.env.BYMA_ENVIRONMENT as 'homologation' | 'production') || 'homologation';
    marketServiceInstance = new BYMAMarketService(environment);
  }

  return marketServiceInstance;
}

export type { BYMAInstrument, BYMAMarketDataResponse, BYMAMarketDataParams };
