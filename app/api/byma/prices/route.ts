import { NextRequest, NextResponse } from 'next/server';
import { getBYMAMarketService } from '@/app/lib/byma-market';

/**
 * API endpoint to get BYMA market prices
 * GET /api/byma/prices
 * Query params: symbols (comma-separated)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.trim()) : undefined;

    const marketService = getBYMAMarketService();
    const prices = await marketService.getMarketPrices(symbols);

    return NextResponse.json({
      success: true,
      data: prices,
      count: prices.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching BYMA prices:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch BYMA prices',
      },
      { status: 500 }
    );
  }
}
