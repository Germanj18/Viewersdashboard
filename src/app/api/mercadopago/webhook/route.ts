import { NextRequest, NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar que sea una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Crear instancia de Payment
      const payment = new Payment(client);
      
      // Obtener información del pago
      const paymentData = await payment.get({ id: paymentId });
      
      console.log('ServiceDG - Payment notification:', {
        id: paymentData.id,
        status: paymentData.status,
        external_reference: paymentData.external_reference,
        amount: paymentData.transaction_amount,
        email: paymentData.payer?.email,
      });

      
      // Aquí puedes agregar lógica para actualizar tu base de datos
      // Por ejemplo, marcar un servicio como pagado, enviar emails, etc.
      
      if (paymentData.status === 'approved') {
        // Pago aprobado - aquí puedes ejecutar la lógica de negocio
        console.log('✅ ServiceDG - Pago aprobado:', paymentData.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
