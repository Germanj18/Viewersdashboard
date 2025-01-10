import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const service_id = searchParams.get('service_id');
  const count = searchParams.get('count');
  const link = searchParams.get('link');

  try {
    const response = await fetch(`https://top4smm.com/api.php?key=r6oPvhkIA5Pkbt4p&act=new_order&service_id=${service_id}&count=${count}&link=${link}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}