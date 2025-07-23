import { prisma } from '../prisma';
import { Block, CreateBlockData } from '../../api/types/user';

export class BlockService {
  static async createBlock(userId: string, data: CreateBlockData): Promise<Block> {
    const block = await prisma.block.create({
      data: {
        userId,
        name: data.name,
        viewers: data.viewers,
        minutes: data.minutes,
        startTime: data.startTime || new Date(),
        endTime: new Date(Date.now() + data.minutes * 60 * 1000), // Calcular tiempo de fin
      },
    });
    return block as Block; // Cast para solucionar conflicto de tipos
  }

  static async getUserBlocks(userId: string, activeOnly: boolean = false): Promise<Block[]> {
    const where = activeOnly 
      ? { userId, isActive: true }
      : { userId };

    const blocks = await prisma.block.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return blocks as Block[]; // Cast para solucionar conflicto de tipos
  }

  static async getBlockById(blockId: string, userId: string): Promise<Block | null> {
    const block = await prisma.block.findFirst({
      where: { id: blockId, userId },
    });
    return block as Block | null; // Cast para solucionar conflicto de tipos
  }

  static async updateBlock(blockId: string, userId: string, data: Partial<Block>): Promise<Block> {
    const block = await prisma.block.update({
      where: { id: blockId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
    return block as Block; // Cast para solucionar conflicto de tipos
  }

  static async deactivateBlock(blockId: string, userId: string): Promise<Block> {
    const block = await prisma.block.update({
      where: { id: blockId },
      data: {
        isActive: false,
        endTime: new Date(),
        updatedAt: new Date(),
      },
    });
    return block as Block; // Cast para solucionar conflicto de tipos
  }

  static async deleteBlock(blockId: string, userId: string): Promise<void> {
    await prisma.block.delete({
      where: { id: blockId },
    });
  }

  static async getActiveBlocks(userId: string): Promise<Block[]> {
    const blocks = await prisma.block.findMany({
      where: {
        userId,
        isActive: true,
        endTime: {
          gt: new Date(), // Solo bloques que no han expirado
        },
      },
      orderBy: { startTime: 'desc' },
    });
    return blocks as Block[]; // Cast para solucionar conflicto de tipos
  }

  static async getExpiredBlocks(userId: string): Promise<Block[]> {
    const blocks = await prisma.block.findMany({
      where: {
        userId,
        OR: [
          { isActive: false },
          { endTime: { lt: new Date() } },
        ],
      },
      orderBy: { endTime: 'desc' },
    });
    return blocks as Block[]; // Cast para solucionar conflicto de tipos
  }
}
