import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ message: 'Invalid date range' }, { status: 400 });
  }

  try {
    const data = await prisma.$queryRaw`
      SELECT * FROM "excelData"
      WHERE DATE(date) >= TO_DATE(${startDate}, 'YYYY-MM-DD') 
      AND DATE(date) <= TO_DATE(${endDate}, 'YYYY-MM-DD')
    `;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}