import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const where = activeOnly 
      ? { userId, isActive: true, endTime: { gt: new Date() } }
      : { userId };

    const blocks = await prisma.block.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        operations: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({
      success: true,
      blocks,
    });
  } catch (error) {
    console.error('Get blocks error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch blocks',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, viewers, minutes } = body;

    if (!userId || !name || !viewers || !minutes) {
      return NextResponse.json(
        { success: false, message: 'userId, name, viewers, and minutes are required' },
        { status: 400 }
      );
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + minutes * 60 * 1000);

    const block = await prisma.block.create({
      data: {
        userId,
        name,
        viewers: parseInt(viewers),
        minutes: parseInt(minutes),
        startTime,
        endTime,
      },
    });

    // Crear la operación inicial
    await prisma.operation.create({
      data: {
        userId,
        blockId: block.id,
        type: 'add',
        viewers: parseInt(viewers),
        description: `Block created: ${name}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Block created successfully',
      block,
    });
  } catch (error) {
    console.error('Create block error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create block',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { blockId, userId, action, viewers: additionalViewers } = body;

    if (!blockId || !userId || !action) {
      return NextResponse.json(
        { success: false, message: 'blockId, userId, and action are required' },
        { status: 400 }
      );
    }

    const block = await prisma.block.findFirst({
      where: { id: blockId, userId },
    });

    if (!block) {
      return NextResponse.json(
        { success: false, message: 'Block not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'add_viewers':
        if (!additionalViewers) {
          return NextResponse.json(
            { success: false, message: 'viewers amount is required for add_viewers action' },
            { status: 400 }
          );
        }

        const updatedBlock = await prisma.block.update({
          where: { id: blockId },
          data: { 
            viewers: block.viewers + parseInt(additionalViewers),
            updatedAt: new Date(),
          },
        });

        // Crear operación
        await prisma.operation.create({
          data: {
            userId,
            blockId,
            type: 'add',
            viewers: parseInt(additionalViewers),
            description: `Added ${additionalViewers} viewers to ${block.name}`,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Viewers added successfully',
          block: updatedBlock,
        });

      case 'deactivate':
        const deactivatedBlock = await prisma.block.update({
          where: { id: blockId },
          data: { 
            isActive: false,
            endTime: new Date(),
            updatedAt: new Date(),
          },
        });

        // Crear operación
        await prisma.operation.create({
          data: {
            userId,
            blockId,
            type: 'subtract',
            viewers: 0,
            description: `Block deactivated: ${block.name}`,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Block deactivated successfully',
          block: deactivatedBlock,
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Update block error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update block',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const blockId = searchParams.get('blockId');
    const userId = searchParams.get('userId');

    if (!blockId || !userId) {
      return NextResponse.json(
        { success: false, message: 'blockId and userId are required' },
        { status: 400 }
      );
    }

    // Verificar que el bloque pertenece al usuario
    const block = await prisma.block.findFirst({
      where: { id: blockId, userId },
    });

    if (!block) {
      return NextResponse.json(
        { success: false, message: 'Block not found' },
        { status: 404 }
      );
    }

    // Eliminar el bloque (las operaciones se eliminan en cascada)
    await prisma.block.delete({
      where: { id: blockId },
    });

    return NextResponse.json({
      success: true,
      message: 'Block deleted successfully',
    });
  } catch (error) {
    console.error('Delete block error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete block',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
