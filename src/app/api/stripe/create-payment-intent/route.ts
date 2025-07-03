import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function GET() {
  return NextResponse.json({
    message: 'Stripe API is working',
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== STRIPE PAYMENT INTENT API ===');
    
    const { amount, description } = await request.json();
    
    // Verificaciones básicas
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'No Stripe secret key' }, { status: 500 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      description: description || 'ServicioAnalisisDatos - ServiceDG',
      metadata: {
        service: 'ServicioAnalisisDatos',
        provider: 'ServiceDG',
        external_reference: `servicedg-stripe-${Date.now()}`,
      },
      statement_descriptor: 'SERVICEDG',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Stripe PaymentIntent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error) {
    console.error('Stripe API Error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}
