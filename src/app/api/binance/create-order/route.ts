import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Configuración de Binance Pay
const BINANCE_PAY_API_KEY = process.env.BINANCE_PAY_API_KEY || '';
const BINANCE_PAY_SECRET = process.env.BINANCE_PAY_SECRET || '';
const BINANCE_PAY_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://bpay.binanceapi.com' 
  : 'https://bpay.binanceapi.com'; // Usar el mismo endpoint (no hay sandbox público)

// Función para generar la firma requerida por Binance Pay
function generateSignature(timestamp: string, nonce: string, body: string): string {
  const payload = timestamp + nonce + body;
  return crypto.createHmac('sha512', BINANCE_PAY_SECRET).update(payload).digest('hex').toUpperCase();
}

// Función para generar nonce único
function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { amount, description, currency = 'USD' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    if (!BINANCE_PAY_API_KEY || !BINANCE_PAY_SECRET) {
      return NextResponse.json(
        { error: 'Configuración de Binance Pay incompleta' },
        { status: 500 }
      );
    }

    // Generar timestamp y nonce
    const timestamp = Date.now().toString();
    const nonce = generateNonce();
    const merchantTradeNo = `servicedg-${timestamp}`;

    // Crear el payload para la orden
    const orderData = {
      env: {
        terminalType: 'WEB'
      },
      merchantTradeNo,
      orderAmount: amount.toString(),
      currency,
      goods: {
        goodsType: '01', // Bienes virtuales
        goodsCategory: 'Z000', // Categoría general
        referenceGoodsId: 'servicedg-001',
        goodsName: description || 'Servicio de Análisis de Datos',
        goodsDetail: description || 'Análisis completo de datos para tu negocio - ServiceDG'
      },
      returnUrl: `${process.env.NEXTAUTH_URL}/pago/success`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pago/failure`,
      webhook: `${process.env.NEXTAUTH_URL}/api/binance/webhook`
    };

    const body = JSON.stringify(orderData);
    const signature = generateSignature(timestamp, nonce, body);

    // Headers requeridos por Binance Pay
    const headers = {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp,
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': BINANCE_PAY_API_KEY,
      'BinancePay-Signature': signature
    };

    console.log('Binance Pay Request:', {
      url: `${BINANCE_PAY_BASE_URL}/binancepay/openapi/v2/order`,
      headers,
      body: orderData
    });

    // Hacer la petición a Binance Pay
    const response = await fetch(`${BINANCE_PAY_BASE_URL}/binancepay/openapi/v2/order`, {
      method: 'POST',
      headers,
      body
    });

    const data = await response.json();

    console.log('Binance Pay Response:', data);

    if (data.status === 'SUCCESS') {
      return NextResponse.json({
        success: true,
        checkoutUrl: data.data.checkoutUrl,
        prepayId: data.data.prepayId,
        merchantTradeNo,
        qrCodeUrl: data.data.qrcodeLink,
        universalUrl: data.data.universalUrl
      });
    } else {
      console.error('Binance Pay Error:', data);
      return NextResponse.json(
        { error: data.errorMessage || 'Error al crear la orden en Binance Pay' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating Binance Pay order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
