import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; // Asegúrate de que la ruta sea correcta

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Datos recibidos:', data); // Agregar mensaje de registro

    if (!data || !Array.isArray(data.items)) {
      console.error('Estructura de datos inválida:', data); // Agregar mensaje de error
      return NextResponse.json({ message: 'Invalid data structure' }, { status: 400 });
    }

    const { items, confirmDelete } = data;

    const validData = items.filter((item: any) => 
      item.channel_name && 
      item.created_date && 
      typeof item.youtube === 'number' && 
      typeof item.likes === 'number' && 
      item.title
    );

    console.log('Datos válidos:', validData); // Agregar mensaje de registro

    const dates = validData.map((item: any) => new Date(item.created_date.split('T')[0]));

    // Verificar si existen registros con las mismas fechas
    const existingRecords = await prisma.excelData.findMany({
      where: {
        fecha: {
          in: dates,
        },
      },
    });

    if (existingRecords.length > 0 && !confirmDelete) {
      const existingDate = existingRecords[0].fecha.toISOString().split('T')[0];
      return NextResponse.json({
        message: `Se van a borrar los registros viejos de la fecha: ${existingDate}. Si estás seguro, confirma la operación.`,
        confirmDelete: true,
      });
    }

    if (confirmDelete) {
      // Eliminar registros antiguos
      await prisma.excelData.deleteMany({
        where: {
          fecha: {
            in: dates,
          },
        },
      });
    }

    // Insertar nuevos datos en lotes
    const batchSize = 50; // Tamaño del lote
    for (let i = 0; i < validData.length; i += batchSize) {
      const batch = validData.slice(i, i + batchSize);
      const createPromises = batch.map((item: any) => {
        const [date, time] = item.created_date.split('T');
        const formattedDate = new Date(date); // Convertir a formato Date
        const formattedTime = time.split('.')[0].substring(0, 5); // Obtener solo HH:MM

        return prisma.excelData.create({
          data: {
            channel_name: item.channel_name,
            fecha: formattedDate, // Fecha en formato Date
            hora: formattedTime, // Hora en formato HH:MM
            youtube: item.youtube,
            likes: item.likes,
            title: item.title,
          },
        });
      });

      await Promise.all(createPromises);
    }

    console.log('Resultado de la inserción: Datos subidos exitosamente'); // Agregar mensaje de registro

    return NextResponse.json({ message: 'Data uploaded successfully' });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error); // Agregar mensaje de error
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect(); // Asegúrate de desconectar Prisma al final
  }
}