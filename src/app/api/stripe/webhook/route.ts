import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      console.error('No stripe signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('=== STRIPE WEBHOOK ===');
    console.log('Event type:', event.type);
    console.log('Event ID:', event.id);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('✅ Payment succeeded:', paymentIntent.id);
        console.log('Amount:', paymentIntent.amount / 100, 'USD');
        console.log('Description:', paymentIntent.description);
        console.log('Customer:', paymentIntent.metadata);
        
        // Aquí podrías:
        // - Actualizar tu base de datos
        // - Enviar email de confirmación
        // - Activar servicios
        // - Registrar en logs
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', failedPayment.id);
        console.log('Failure reason:', failedPayment.last_payment_error?.message);
        break;

      case 'payment_method.attached':
        console.log('💳 Payment method attached');
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook handler failed',
      message: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe Webhook endpoint is working',
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    timestamp: new Date().toISOString(),
  });
}
