import { NextResponse } from 'next/server';
import { getBYMAAuthService } from '@/app/lib/byma-auth';

/**
 * API endpoint to obtain BYMA OAuth token
 * GET /api/byma/token
 */
export async function GET() {
  try {
    const authService = getBYMAAuthService();
    const token = await authService.getToken();

    return NextResponse.json({
      success: true,
      token,
      message: 'Token obtained successfully',
    });
  } catch (error) {
    console.error('Error obtaining BYMA token:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to obtain BYMA token',
      },
      { status: 500 }
    );
  }
}

/**
 * API endpoint to refresh BYMA OAuth token
 * POST /api/byma/token
 */
export async function POST() {
  try {
    const authService = getBYMAAuthService();

    // Clear existing token to force refresh
    authService.clearToken();

    const token = await authService.requestToken();

    return NextResponse.json({
      success: true,
      token,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Error refreshing BYMA token:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to refresh BYMA token',
      },
      { status: 500 }
    );
  }
}
