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
    environment: process.env.NODE_ENV || 'development',
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== STRIPE PAYMENT INTENT API ===');
    
    // Verificar que existe la clave secreta
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY not found in environment variables');
      return NextResponse.json({ 
        error: 'Stripe not configured',
        message: 'STRIPE_SECRET_KEY missing in environment variables' 
      }, { status: 500 });
    }

    const { amount, description } = await request.json();
    console.log('Received amount:', amount, 'description:', description);
    
    // Validaciones mejoradas
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid amount',
        message: 'Amount must be a positive number' 
      }, { status: 400 });
    }

    if (amount > 999999) {
      return NextResponse.json({ 
        error: 'Amount too large',
        message: 'Maximum amount is $999,999 USD' 
      }, { status: 400 });
    }

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency: 'usd',
      description: description || 'Servicio de Análisis de Datos - ServiceDG',
      metadata: {
        service: 'ServicioAnalisisDatos',
        provider: 'ServiceDG',
        external_reference: `servicedg-stripe-${Date.now()}`,
        amount_usd: amount.toString(),
      },
      statement_descriptor_suffix: 'SERVICEDG',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('✅ Stripe PaymentIntent created successfully:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount,
      currency: 'usd',
    });

  } catch (error: any) {
    console.error('❌ Stripe API Error:', error);
    
    // Manejo específico de errores de Stripe
    if (error.type === 'StripeCardError') {
      return NextResponse.json({ 
        error: 'Card error',
        message: error.message 
      }, { status: 400 });
    }

    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ 
        error: 'Invalid request',
        message: error.message 
      }, { status: 400 });
    }

    if (error.type === 'StripeAPIError') {
      return NextResponse.json({ 
        error: 'Stripe API error',
        message: 'Service temporarily unavailable' 
      }, { status: 503 });
    }

    if (error.type === 'StripeConnectionError') {
      return NextResponse.json({ 
        error: 'Network error',
        message: 'Unable to connect to Stripe' 
      }, { status: 503 });
    }

    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json({ 
        error: 'Authentication error',
        message: 'Invalid Stripe credentials' 
      }, { status: 401 });
    }

    // Error genérico
    return NextResponse.json({ 
      error: 'Server error', 
      message: error.message || 'Unknown server error'
    }, { status: 500 });
  }
}
