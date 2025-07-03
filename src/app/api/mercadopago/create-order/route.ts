import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATE ORDER API CALLED ===');
    
    const { amount, description } = await request.json();
    console.log('Received data:', { amount, description });

    if (!amount || amount <= 0) {
      console.log('Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Verificar variables de entorno
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN no está configurado');
      return NextResponse.json(
        { error: 'Configuración de Mercado Pago faltante' },
        { status: 500 }
      );
    }

    console.log('Access token exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN);

    // Crear preferencia usando fetch directo a la API de Mercado Pago
    const preferenceData = {
      items: [
        {
          id: `item-${Date.now()}`,
          title: description || 'Servicio de Métricas LaCasa',
          unit_price: amount,
          quantity: 1,
        },
      ],
      payer: {
        email: 'test@example.com',
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/pago/success`,
        failure: `${process.env.NEXTAUTH_URL}/pago/failure`,
        pending: `${process.env.NEXTAUTH_URL}/pago/pending`,
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      statement_descriptor: 'LACASA-METRICAS',
      external_reference: `lacasa-order-${Date.now()}`,
      expires: false,
      auto_return: 'approved',
    };

    console.log('Creating preference with data:', JSON.stringify(preferenceData, null, 2));

    // Llamar directamente a la API de Mercado Pago
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferenceData),
    });

    console.log('MercadoPago API response status:', mpResponse.status);

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error('MercadoPago API error:', errorText);
      return NextResponse.json(
        { error: `Error de Mercado Pago: ${mpResponse.status}` },
        { status: 500 }
      );
    }

    const responseData = await mpResponse.json();
    console.log('MercadoPago response:', responseData);

    return NextResponse.json({
      preferenceId: responseData.id,
      init_point: responseData.init_point,
      sandbox_init_point: responseData.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
