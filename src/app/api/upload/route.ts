// NOTA: Esta API está deshabilitada porque usa la tabla 'programas' que fue eliminada
// durante la reestructuración de la base de datos para el sistema de autenticación

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  return NextResponse.json({ 
    error: 'Esta API ha sido deshabilitada. La tabla programas fue eliminada durante la reestructuración.',
    message: 'Por favor, usa la nueva API de bloques: /api/blocks'
  }, { status: 410 }); // 410 Gone - Recurso ya no disponible
}
