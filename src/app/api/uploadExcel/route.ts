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
      item.date && 
      item.hour && 
      typeof item.luzu === 'number' && 
      typeof item.olga === 'number' && 
      typeof item.gelatina === 'number' && 
      typeof item.blender === 'number' && 
      typeof item.lacasa === 'number' && 
      typeof item.vorterix === 'number' && 
      typeof item.bondi === 'number' && 
      typeof item.carajo === 'number' && 
      typeof item.azz === 'number'
    );

    console.log('Datos válidos:', validData); // Agregar mensaje de registro

    const dates = validData.map((item: any) => new Date(item.date.split(' ')[0]));

    // Verificar si existen registros con las mismas fechas
    const existingRecords = await prisma.excelData.findMany({
      where: {
        date: {
          in: dates,
        },
      },
    });

    if (existingRecords.length > 0 && !confirmDelete) {
      const existingDate = existingRecords[0].date.toISOString().split('T')[0];
      return NextResponse.json({
        message: `Se van a borrar los registros viejos de la fecha: ${existingDate}. Si estás seguro, confirma la operación.`,
        confirmDelete: true,
      });
    }

    if (confirmDelete) {
      // Eliminar registros antiguos
      await prisma.excelData.deleteMany({
        where: {
          date: {
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
        const [date]= item.date.split(' ');
        const formattedDate = new Date(date); // Convertir a formato Date

        return prisma.excelData.create({
          data: {
            date: formattedDate, // Fecha en formato Date
            hour: item.hour, // Hora en formato HH:MM
            luzu: item.luzu,
            olga: item.olga,
            gelatina: item.gelatina,
            blender: item.blender,
            lacasa: item.lacasa,
            vorterix: item.vorterix,
            bondi: item.bondi,
            carajo: item.carajo,
            azz: item.azz,
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