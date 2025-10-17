/**
 * BYMA OAuth 2.0 Authentication Service
 * Handles token generation and management for BYMA API
 */

interface BYMATokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface BYMAAuthConfig {
  clientId: string;
  clientSecret: string;
  scope: string;
  environment: 'homologation' | 'production';
}

class BYMAAuthService {
  private config: BYMAAuthConfig;
  private token: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: BYMAAuthConfig) {
    this.config = config;
  }

  /**
   * Get the OAuth token endpoint based on environment
   */
  private getTokenEndpoint(): string {
    const baseUrl = this.config.environment === 'production'
      ? 'https://api.byma.com.ar'
      : 'https://hs-api.byma.com.ar';
    return `${baseUrl}/oauth/token/`;
  }

  /**
   * Request a new access token from BYMA OAuth server
   */
  async requestToken(): Promise<string> {
    const endpoint = this.getTokenEndpoint();

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      grant_type: 'client_credentials',
      scope: this.config.scope,
    });

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BYMA OAuth error: ${response.status} - ${errorText}`);
      }

      const data: BYMATokenResponse = await response.json();

      // Store token and calculate expiry time (with 5 minute buffer)
      this.token = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

      return data.access_token;
    } catch (error) {
      console.error('Error requesting BYMA token:', error);
      throw error;
    }
  }

  /**
   * Get a valid access token, refreshing if necessary
   */
  async getToken(): Promise<string> {
    // If no token or token is expired, request a new one
    if (!this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
      return await this.requestToken();
    }

    return this.token;
  }

  /**
   * Clear the current token (useful for error handling)
   */
  clearToken(): void {
    this.token = null;
    this.tokenExpiry = null;
  }
}

// Export a singleton instance for the application
let authServiceInstance: BYMAAuthService | null = null;

export function getBYMAAuthService(): BYMAAuthService {
  if (!authServiceInstance) {
    const config: BYMAAuthConfig = {
      clientId: process.env.BYMA_CLIENT_ID || '',
      clientSecret: process.env.BYMA_CLIENT_SECRET || '',
      scope: process.env.BYMA_SCOPE || 'read',
      environment: (process.env.BYMA_ENVIRONMENT as 'homologation' | 'production') || 'homologation',
    };

    if (!config.clientId || !config.clientSecret) {
      throw new Error('BYMA credentials not configured. Please set BYMA_CLIENT_ID and BYMA_CLIENT_SECRET environment variables.');
    }

    authServiceInstance = new BYMAAuthService(config);
  }

  return authServiceInstance;
}

export type { BYMATokenResponse, BYMAAuthConfig };
