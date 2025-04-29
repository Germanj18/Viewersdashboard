import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('id');

  try {
    const response = await fetch(`https://top4smm.com/api.php?key=r6oPvhkIA5Pkbt4p&act=order_info&id=${orderId}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching order status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}