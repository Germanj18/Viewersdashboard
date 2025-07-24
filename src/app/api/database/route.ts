import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar conexión y obtener estadísticas básicas
    const userCount = await prisma.user.count();
    const operationHistoryCount = await prisma.operationHistory.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      statistics: {
        users: userCount,
        operationHistory: operationHistoryCount,
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId } = await request.json();

    if (action === 'test-user-data') {
      if (!userId) {
        return NextResponse.json(
          { success: false, message: 'userId is required' },
          { status: 400 }
        );
      }

      // Obtener datos del usuario
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          operationHistory: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          operationHistoryCount: user.operationHistory.length,
          recentOperations: user.operationHistory,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'API error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
