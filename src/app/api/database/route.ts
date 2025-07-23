import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Verificar conexión y obtener estadísticas básicas
    const userCount = await prisma.user.count();
    const blockCount = await prisma.block.count();
    const operationCount = await prisma.operation.count();
    const metricsCount = await prisma.userMetrics.count();

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      statistics: {
        users: userCount,
        blocks: blockCount,
        operations: operationCount,
        metrics: metricsCount,
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
          blocks: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          operations: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          metrics: {
            orderBy: { date: 'desc' },
            take: 7,
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
          blocksCount: user.blocks.length,
          operationsCount: user.operations.length,
          metricsCount: user.metrics.length,
          recentBlocks: user.blocks,
          recentOperations: user.operations,
          recentMetrics: user.metrics,
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
