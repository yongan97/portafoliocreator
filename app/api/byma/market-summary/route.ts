import { NextResponse } from 'next/server';
import { getBYMAMarketService } from '@/app/lib/byma-market';

/**
 * API endpoint to get BYMA market summary
 * GET /api/byma/market-summary
 */
export async function GET() {
  try {
    const marketService = getBYMAMarketService();
    const summary = await marketService.getMarketSummary();

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching BYMA market summary:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch BYMA market summary',
      },
      { status: 500 }
    );
  }
}
