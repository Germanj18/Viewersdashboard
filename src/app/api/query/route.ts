// NOTA: Esta API está deshabilitada porque usa la tabla 'programas' que fue eliminada
// durante la reestructuración de la base de datos para el sistema de autenticación

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Esta API ha sido deshabilitada. La tabla programas fue eliminada durante la reestructuración.',
    message: 'Por favor, usa la nueva API de métricas: /api/metrics'
  }, { status: 410 }); // 410 Gone - Recurso ya no disponible
}

/*
// CÓDIGO ORIGINAL COMENTADO - PARA REFERENCIA
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json({ error: 'Faltan parámetros de fecha' }, { status: 400 });
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999); // Establecer la hora máxima para el día de finalización

    const data = await prisma.programas.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Error al consultar los datos' }, { status: 500 });
  }
}
*/