import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

// GET - Obtener historial de operaciones por fechas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Construir filtros de fecha
    const whereClause: any = {
      userId: userId
    };

    if (startDate || endDate) {
      whereClause.timestamp = {};
      if (startDate) {
        whereClause.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        // Agregar 1 día para incluir todo el día final
        const endDateTime = new Date(endDate);
        endDateTime.setDate(endDateTime.getDate() + 1);
        whereClause.timestamp.lt = endDateTime;
      }
    }

    const operations = await prisma.operationHistory.findMany({
      where: whereClause,
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json({ 
      operations,
      count: operations.length 
    });

  } catch (error) {
    console.error('Error obteniendo historial de operaciones:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// POST - Guardar nueva operación en historial
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      blockId, 
      blockTitle, 
      operationType, 
      viewers, 
      orderId, 
      orderStatus, 
      duration, 
      cost, 
      serviceId, 
      message, 
      timestamp 
    } = body;

    // Validar campos requeridos
    if (!userId || !blockTitle || !operationType || viewers === undefined) {
      return NextResponse.json({ 
        error: 'userId, blockTitle, operationType y viewers son requeridos' 
      }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Crear la operación en el historial
    const operation = await prisma.operationHistory.create({
      data: {
        userId: userId,
        blockId: blockId || null,
        blockTitle,
        operationType,
        viewers: parseInt(viewers),
        orderId: orderId || null,
        orderStatus: orderStatus || null,
        duration: duration || null,
        cost: cost || null,
        serviceId: serviceId || null,
        message: message || null,
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      operation 
    });

  } catch (error) {
    console.error('Error guardando operación en historial:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// DELETE - Limpiar historial (opcional)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId es requerido' }, { status: 400 });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Eliminar todas las operaciones del usuario
    const result = await prisma.operationHistory.deleteMany({
      where: {
        userId: userId
      }
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.count 
    });

  } catch (error) {
    console.error('Error eliminando historial:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
