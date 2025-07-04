import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const BINANCE_PAY_SECRET = process.env.BINANCE_PAY_SECRET || '';

function verifySignature(timestamp: string, nonce: string, body: string, signature: string): boolean {
  const payload = timestamp + nonce + body;
  const expectedSignature = crypto.createHmac('sha512', BINANCE_PAY_SECRET).update(payload).digest('hex').toUpperCase();
  return expectedSignature === signature;
}

export async function POST(request: NextRequest) {
  try {
    // Obtener headers de verificación
    const timestamp = request.headers.get('BinancePay-Timestamp') || '';
    const nonce = request.headers.get('BinancePay-Nonce') || '';
    const signature = request.headers.get('BinancePay-Signature') || '';
    
    const body = await request.text();
    const data = JSON.parse(body);

    console.log('Binance Pay Webhook received:', {
      timestamp,
      nonce,
      signature,
      data
    });

    // Verificar la firma
    if (!verifySignature(timestamp, nonce, body, signature)) {
      console.error('Invalid signature in Binance Pay webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Procesar el webhook según el tipo
    if (data.bizType === 'PAY' && data.bizStatus === 'PAY_SUCCESS') {
      console.log('Payment successful:', {
        merchantTradeNo: data.data.merchantTradeNo,
        transactionId: data.data.transactionId,
        amount: data.data.orderAmount,
        currency: data.data.currency
      });

      // Aquí puedes agregar lógica para actualizar tu base de datos
      // Por ejemplo, marcar el pedido como pagado
      
      return NextResponse.json({ returnCode: 'SUCCESS' });
    }

    // Otros tipos de webhook
    console.log('Webhook received but not processed:', data.bizType, data.bizStatus);
    return NextResponse.json({ returnCode: 'SUCCESS' });

  } catch (error) {
    console.error('Error processing Binance Pay webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
