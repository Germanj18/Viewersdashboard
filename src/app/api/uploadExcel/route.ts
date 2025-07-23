// NOTA: Esta API está deshabilitada porque usa la tabla 'excelData' que fue eliminada
// durante la reestructuración de la base de datos para el sistema de autenticación

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ 
    error: 'Esta API ha sido deshabilitada. La tabla excelData fue eliminada durante la reestructuración.',
    message: 'Por favor, usa la nueva API de métricas: /api/metrics'
  }, { status: 410 }); // 410 Gone - Recurso ya no disponible
}
