// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Asegúrate de que la ruta sea correcta

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Datos recibidos:', data); // Agregar mensaje de registro

    if (!Array.isArray(data)) {
      return NextResponse.json({ message: 'Invalid data format' }, { status: 400 });
    }

    // Filtrar datos inválidos antes de la inserción
    const validData = data.filter((item: any) => 
      item.programa && 
      typeof item.hora === 'string' && 
      typeof item.real === 'number' && 
      typeof item.chimi === 'number' && 
      typeof item.total === 'number'
    );

    console.log('Datos válidos:', validData); // Agregar mensaje de registro

    const result = await prisma.programas.createMany({
      data: validData.map((item: any) => ({
        programa: item.programa,
        hora: item.hora, // Asegúrate de que 'hora' es un string
        real: item.real,
        chimi: item.chimi,
        total: item.total,
        fecha: new Date(item.fecha), // Asegúrate de que 'fecha' es una fecha válida
      })),
    });

    console.log('Resultado de la inserción:', result); // Agregar mensaje de registro

    return NextResponse.json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error); // Agregar mensaje de error
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}