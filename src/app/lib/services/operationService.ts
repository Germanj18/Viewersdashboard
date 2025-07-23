import { prisma } from '../prisma';
import { Operation, CreateOperationData } from '../../api/types/user';

export class OperationService {
  static async createOperation(userId: string, data: CreateOperationData): Promise<Operation> {
    const operation = await prisma.operation.create({
      data: {
        userId,
        blockId: data.blockId,
        type: data.type,
        viewers: data.viewers,
        description: data.description,
      },
    });
    return operation as Operation; // Cast para solucionar conflicto de tipos
  }

  static async getUserOperations(userId: string, limit?: number): Promise<Operation[]> {
    const operations = await prisma.operation.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        block: {
          select: {
            name: true,
          },
        },
      },
    });
    return operations as Operation[]; // Cast para solucionar conflicto de tipos
  }

  static async getBlockOperations(blockId: string, userId: string): Promise<Operation[]> {
    const operations = await prisma.operation.findMany({
      where: { blockId, userId },
      orderBy: { timestamp: 'desc' },
    });
    return operations as Operation[]; // Cast para solucionar conflicto de tipos
  }

  static async getOperationsByType(userId: string, type: 'add' | 'subtract' | 'reset'): Promise<Operation[]> {
    const operations = await prisma.operation.findMany({
      where: { userId, type },
      orderBy: { timestamp: 'desc' },
    });
    return operations as Operation[]; // Cast para solucionar conflicto de tipos
  }

  static async getOperationsByDateRange(
    userId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Operation[]> {
    const operations = await prisma.operation.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
    return operations as Operation[]; // Cast para solucionar conflicto de tipos
  }

  static async getTotalViewersSent(userId: string): Promise<number> {
    const result = await prisma.operation.aggregate({
      where: { userId },
      _sum: {
        viewers: true,
      },
    });
    return result._sum.viewers || 0;
  }

  static async getOperationsCount(userId: string): Promise<number> {
    const count = await prisma.operation.count({
      where: { userId },
    });
    return count;
  }

  static async deleteOperation(operationId: string, userId: string): Promise<void> {
    await prisma.operation.delete({
      where: { id: operationId },
    });
  }
}
