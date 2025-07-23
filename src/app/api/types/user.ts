import { DefaultUser } from "next-auth";

export interface User extends DefaultUser {
  id: string;
  name: string;
  username: string;
  password: string;
  rol: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Block {
  id: string;
  userId: string;
  name: string;
  viewers: number;
  minutes: number;
  isActive: boolean;
  startTime: Date;
  endTime: Date | null; // Cambiado de undefined a null para coincidir con Prisma
  createdAt: Date;
  updatedAt: Date;
}

export interface Operation {
  id: string;
  userId: string;
  blockId: string | null; // Cambiado de undefined a null para coincidir con Prisma
  type: 'add' | 'subtract' | 'reset';
  viewers: number;
  timestamp: Date;
  description: string | null; // Cambiado de undefined a null para coincidir con Prisma
}

export interface UserMetrics {
  id: string;
  userId: string;
  date: Date;
  totalViewersSent: number;
  totalOperations: number;
  activeBlocks: number;
  expiredBlocks: number;
  averageViewersPerHour: number;
  peakViewers: number;
  peakViewersTime: Date | null; // Cambiado de undefined a null para coincidir con Prisma
}

// Tipos para crear nuevos registros (sin campos auto-generados)
export interface CreateBlockData {
  name: string;
  viewers: number;
  minutes: number;
  startTime?: Date;
}

export interface CreateOperationData {
  blockId?: string;
  type: 'add' | 'subtract' | 'reset';
  viewers: number;
  description?: string;
}

export interface CreateMetricsData {
  totalViewersSent: number;
  totalOperations: number;
  activeBlocks: number;
  expiredBlocks: number;
  averageViewersPerHour: number;
  peakViewers: number;
  peakViewersTime?: Date;
}