import { NextRequest, NextResponse } from 'next/server';
import { getBYMAMarketService } from '@/app/lib/byma-market';

/**
 * API endpoint to get BYMA instruments/securities
 * GET /api/byma/instruments
 * Query params: symbol, market, limit
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbol = searchParams.get('symbol') || undefined;
    const market = searchParams.get('market') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const marketService = getBYMAMarketService();
    const instruments = await marketService.getInstruments({ symbol, market, limit });

    return NextResponse.json({
      success: true,
      data: instruments,
      count: instruments.length,
    });
  } catch (error) {
    console.error('Error fetching BYMA instruments:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch BYMA instruments',
      },
      { status: 500 }
    );
  }
}
