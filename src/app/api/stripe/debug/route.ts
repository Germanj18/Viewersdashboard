import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      message: 'Stripe Debug Endpoint',
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) + '...',
        hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        stripePublishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) + '...',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Debug endpoint error',
      message: (error as Error).message,
    }, { status: 500 });
  }
}
