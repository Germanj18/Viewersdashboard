import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, description } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Crear instancia de Preference para Checkout API
    const preference = new Preference(client);

    // Configurar preferencia optimizada para Checkout API
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
        email: 'test@example.com', // Opcional, puede ser dinámico
      },
      payment_methods: {
        excluded_payment_methods: [], // Permitir todos los métodos
        excluded_payment_types: [], // Permitir todos los tipos
        installments: 12, // Hasta 12 cuotas
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL}/pago/success`,
        failure: `${process.env.NEXTAUTH_URL}/pago/failure`,
        pending: `${process.env.NEXTAUTH_URL}/pago/pending`,
      },
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      statement_descriptor: 'LACASA-METRICAS',
      external_reference: `lacasa-order-${Date.now()}`,
      expires: false, // No expira automáticamente
      auto_return: 'approved' as const,
    };

    const response = await preference.create({ body: preferenceData });

    return NextResponse.json({
      preferenceId: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
