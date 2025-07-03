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

    // Crear preferencia optimizada para liberación rápida de fondos
    const preference = {
      items: [{
        id: 'SERVICEDG_ANALISIS_001',
        title: 'Servicio de Análisis de Datos - ServiceDG',
        description: 'Análisis completo de métricas y datos empresariales',
        category_id: 'services', // Categoría de servicios
        unit_price: parseFloat(amount),
        quantity: 1,
        currency_id: 'ARS',
      }],
      // Información del negocio para mejorar confianza
      purpose: 'wallet_purchase', // Compra de servicio
      marketplace: 'NONE', // No es marketplace
      
      // URLs de retorno
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/pago/success`,
        failure: `${process.env.NEXTAUTH_URL}/pago/failure`,
        pending: `${process.env.NEXTAUTH_URL}/pago/pending`,
      },
      
      // Configuraciones de pago
      payment_methods: {
        installments: 12,
        default_installments: 1, // Promover pago en una cuota
        excluded_payment_methods: [], // Permitir todos los métodos
        excluded_payment_types: [], // Permitir todos los tipos
      },
      
      // Información adicional para acelerar liberación
      metadata: {
        business_type: 'services',
        service_type: 'data_analysis',
        delivery_type: 'digital',
        seller_category: 'professional_services'
      },
      
      // URLs y referencias
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      external_reference: `SERVICEDG-ANALISIS-${Date.now()}`,
      statement_descriptor: 'SERVICEDG ANALISIS',
      
      // Configuraciones de experiencia
      shipments: {
        mode: 'not_specified', // Servicio digital, no requiere envío
      },
      
      // Configuración de expiración (24 horas)
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
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
