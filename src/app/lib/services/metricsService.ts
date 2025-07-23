import { prisma } from '../prisma';
import { UserMetrics, CreateMetricsData } from '../../api/types/user';

export class MetricsService {
  static async createOrUpdateDailyMetrics(userId: string, data: CreateMetricsData): Promise<UserMetrics> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Inicio del día

    const metrics = await prisma.userMetrics.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        totalViewersSent: data.totalViewersSent,
        totalOperations: data.totalOperations,
        activeBlocks: data.activeBlocks,
        expiredBlocks: data.expiredBlocks,
        averageViewersPerHour: data.averageViewersPerHour,
        peakViewers: data.peakViewers,
        peakViewersTime: data.peakViewersTime,
      },
      create: {
        userId,
        date: today,
        totalViewersSent: data.totalViewersSent,
        totalOperations: data.totalOperations,
        activeBlocks: data.activeBlocks,
        expiredBlocks: data.expiredBlocks,
        averageViewersPerHour: data.averageViewersPerHour,
        peakViewers: data.peakViewers,
        peakViewersTime: data.peakViewersTime,
      },
    });
    return metrics as UserMetrics; // Cast para solucionar conflicto de tipos
  }

  static async getUserMetrics(userId: string, days: number = 7): Promise<UserMetrics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.userMetrics.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      orderBy: { date: 'desc' },
    });
    return metrics as UserMetrics[]; // Cast para solucionar conflicto de tipos
  }

  static async getTodayMetrics(userId: string): Promise<UserMetrics | null> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const metrics = await prisma.userMetrics.findFirst({
      where: {
        userId,
        date: today,
      },
    });
    return metrics as UserMetrics | null; // Cast para solucionar conflicto de tipos
  }

  static async getMetricsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<UserMetrics[]> {
    const metrics = await prisma.userMetrics.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
    return metrics as UserMetrics[]; // Cast para solucionar conflicto de tipos
  }

  static async calculateRealTimeMetrics(userId: string): Promise<CreateMetricsData> {
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
}
