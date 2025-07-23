import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const days = parseInt(searchParams.get('days') || '7');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    // Calcular métricas en tiempo real
    const realTimeMetrics = await calculateRealTimeMetrics(userId);

    // Obtener métricas históricas
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const historicalMetrics = await prisma.userMetrics.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      success: true,
      realTimeMetrics,
      historicalMetrics,
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    // Calcular métricas actuales
    const metrics = await calculateRealTimeMetrics(userId);

    // Guardar métricas del día
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const savedMetrics = await prisma.userMetrics.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalViewersSent: metrics.totalViewersSent,
        totalOperations: metrics.totalOperations,
        activeBlocks: metrics.activeBlocks,
        expiredBlocks: metrics.expiredBlocks,
        averageViewersPerHour: metrics.averageViewersPerHour,
        peakViewers: metrics.peakViewers,
        peakViewersTime: metrics.peakViewersTime,
      },
      create: {
        userId,
        date: today,
        totalViewersSent: metrics.totalViewersSent,
        totalOperations: metrics.totalOperations,
        activeBlocks: metrics.activeBlocks,
        expiredBlocks: metrics.expiredBlocks,
        averageViewersPerHour: metrics.averageViewersPerHour,
        peakViewers: metrics.peakViewers,
        peakViewersTime: metrics.peakViewersTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Metrics saved successfully',
      metrics: savedMetrics,
    });
  } catch (error) {
    console.error('Save metrics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save metrics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function calculateRealTimeMetrics(userId: string) {
  // Obtener todas las operaciones del usuario
  const operations = await prisma.operation.findMany({
    where: { userId },
  });

  // Obtener bloques activos y expirados
  const now = new Date();
  const activeBlocks = await prisma.block.count({
    where: {
      userId,
      isActive: true,
      endTime: { gt: now },
    },
  });

  const expiredBlocks = await prisma.block.count({
    where: {
      userId,
      OR: [
        { isActive: false },
        { endTime: { lt: now } },
      ],
    },
  });

  // Calcular total de viewers enviados
  const totalViewersSent = operations.reduce((sum, op) => sum + op.viewers, 0);

  // Calcular promedio por hora (últimas 24 horas)
  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);
  
  const recentOperations = operations.filter(op => op.timestamp >= last24Hours);
  const totalViewersLast24h = recentOperations.reduce((sum, op) => sum + op.viewers, 0);
  const averageViewersPerHour = totalViewersLast24h / 24;

  // Encontrar pico de viewers y su hora
  const viewersByHour = new Map<string, number>();
  recentOperations.forEach(op => {
    const hour = op.timestamp.toISOString().slice(0, 13); // YYYY-MM-DDTHH
    viewersByHour.set(hour, (viewersByHour.get(hour) || 0) + op.viewers);
  });

  let peakViewers = 0;
  let peakViewersTime: Date | undefined;
  
  viewersByHour.forEach((viewers, hour) => {
    if (viewers > peakViewers) {
      peakViewers = viewers;
      peakViewersTime = new Date(hour + ':00:00Z');
    }
  });

  return {
    totalViewersSent,
    totalOperations: operations.length,
    activeBlocks,
    expiredBlocks,
    averageViewersPerHour,
    peakViewers,
    peakViewersTime,
  };
}
