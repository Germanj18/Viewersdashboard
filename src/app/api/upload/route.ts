// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Asegúrate de que la ruta sea correcta

export async function POST(request: Request) {
  try {
    const { data, confirm } = await request.json();
    console.log('Datos recibidos:', data); // Agregar mensaje de registro

    if (!Array.isArray(data)) {
      return NextResponse.json({ message: 'Formato de datos inválido' }, { status: 400 });
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

    if (validData.length === 0) {
      return NextResponse.json({ message: 'No hay datos válidos para insertar' }, { status: 400 });
    }

    const fecha = new Date(validData[0].fecha);

    // Verificar si ya existen registros con la misma fecha
    const existingRecords = await prisma.programas.findMany({
      where: {
        fecha: fecha,
      },
    });

    if (existingRecords.length > 0 && !confirm) {
      // Si ya existen registros y no se ha confirmado, enviar una respuesta solicitando confirmación
      return NextResponse.json({
        message: `Se van a borrar los registros viejos de la fecha ${fecha.toISOString().split('T')[0]}. Si estás seguro, confirma la operación.`,
        confirm: true,
      });
    }

    if (confirm) {
      // Borrar los registros viejos
      await prisma.programas.deleteMany({
        where: {
          fecha: fecha,
        },
      });
    }

    // Insertar los nuevos registros
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

    return NextResponse.json({ message: 'Datos cargados exitosamente' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error); // Agregar mensaje de error
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}