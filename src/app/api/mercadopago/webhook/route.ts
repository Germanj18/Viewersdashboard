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
        status_detail: paymentData.status_detail,
        external_reference: paymentData.external_reference,
        amount: paymentData.transaction_amount,
        currency: paymentData.currency_id,
        payment_method: paymentData.payment_method_id,
        payment_type: paymentData.payment_type_id,
        email: paymentData.payer?.email,
        payer_id: paymentData.payer?.id,
        date_created: paymentData.date_created,
        date_approved: paymentData.date_approved,
      });

      // Lógica para diferentes estados de pago
      if (paymentData.status === 'approved') {
        // Pago aprobado - servicio puede ser entregado inmediatamente
        console.log('✅ ServiceDG - Pago aprobado y confirmado:', {
          payment_id: paymentData.id,
          service: 'Análisis de Datos',
          amount: paymentData.transaction_amount,
          customer_email: paymentData.payer?.email,
          delivery_status: 'ready_for_delivery'
        });
        
        // Aquí puedes:
        // 1. Marcar el servicio como pagado en tu DB
        // 2. Enviar email de confirmación al cliente
        // 3. Iniciar el proceso de entrega del servicio
        // 4. Generar factura/recibo
        
      } else if (paymentData.status === 'pending') {
        console.log('⏳ ServiceDG - Pago pendiente:', paymentData.id, paymentData.status_detail);
      } else if (paymentData.status === 'rejected') {
        console.log('❌ ServiceDG - Pago rechazado:', paymentData.id, paymentData.status_detail);
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
