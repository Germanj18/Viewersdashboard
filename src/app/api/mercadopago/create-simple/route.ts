import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API is working',
    hasAccessToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    hasPublicKey: !!process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLE CREATE ORDER API ===');
    
    const { amount, description } = await request.json();
    
    // Verificaciones básicas
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return NextResponse.json({ error: 'No access token' }, { status: 500 });
    }

    if (!amount) {
      return NextResponse.json({ error: 'No amount' }, { status: 400 });
    }

    // Crear preferencia mínima para checkout embebido
    const preference = {
      items: [{
        title: description || 'ServicioAnalisisDatos',
        unit_price: parseFloat(amount),
        quantity: 1,
      }],
      // Solo URLs de retorno, sin auto_return para evitar conflictos
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/pago/success`,
        failure: `${process.env.NEXTAUTH_URL}/pago/failure`,
        pending: `${process.env.NEXTAUTH_URL}/pago/pending`,
      },
      // Configuraciones adicionales para mejor experiencia
      payment_methods: {
        installments: 12, // Hasta 12 cuotas
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      external_reference: `servicedg-${Date.now()}`,
      statement_descriptor: 'SERVICEDG',
    };

    console.log('Sending to MP:', JSON.stringify(preference, null, 2));

    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preference),
    });

    console.log('MP Response status:', response.status);
    
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('MP Error:', errorData);
      return NextResponse.json({ 
        error: 'Mercado Pago error',
        details: errorData,
        status: response.status 
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('MP Success:', data);

    return NextResponse.json({
      preferenceId: data.id,
      init_point: data.init_point,
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      message: (error as Error).message 
    }, { status: 500 });
  }
}
