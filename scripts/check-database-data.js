const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseData() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');

    // 1. Verificar usuarios
    console.log('👥 USUARIOS:');
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            blocks: true,
            operations: true,
            metrics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      console.table(users.map(user => ({
        ID: user.id.substring(0, 8) + '...',
        Nombre: user.name,
        Email: user.username,
        Rol: user.rol,
        Bloques: user._count.blocks,
        Operaciones: user._count.operations,
        Métricas: user._count.metrics,
        Creado: user.createdAt.toLocaleDateString()
      })));
    }

    // 2. Verificar bloques
    console.log('\n📦 BLOQUES:');
    const blocks = await prisma.block.findMany({
      include: {
        user: {
          select: { name: true, username: true }
        },
        _count: {
          operations: true
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10 // Últimos 10
    });

    if (blocks.length === 0) {
      console.log('❌ No hay bloques en la base de datos');
    } else {
      console.table(blocks.map(block => ({
        ID: block.id.substring(0, 8) + '...',
        Nombre: block.name,
        Usuario: block.user.name,
        Viewers: block.viewers,
        Minutos: block.minutes,
        Activo: block.isActive ? '✅' : '❌',
        Operaciones: block._count.operations,
        Inicio: block.startTime.toLocaleString(),
        Fin: block.endTime ? block.endTime.toLocaleString() : 'En curso'
      })));
    }

    // 3. Verificar operaciones recientes
    console.log('\n⚡ OPERACIONES RECIENTES (últimas 20):');
    const operations = await prisma.operation.findMany({
      include: {
        user: {
          select: { name: true }
        },
        block: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    if (operations.length === 0) {
      console.log('❌ No hay operaciones en la base de datos');
    } else {
      console.table(operations.map(op => ({
        ID: op.id.substring(0, 8) + '...',
        Usuario: op.user.name,
        Bloque: op.block?.name || 'N/A',
        Tipo: op.type,
        Viewers: op.viewers,
        Tiempo: op.createdAt.toLocaleString()
      })));
    }

    // 4. Verificar métricas de usuario
    console.log('\n📊 MÉTRICAS DE USUARIO:');
    const metrics = await prisma.userMetrics.findMany({
      include: {
        user: {
          select: { name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (metrics.length === 0) {
      console.log('❌ No hay métricas en la base de datos');
    } else {
      console.table(metrics.map(metric => ({
        ID: metric.id.substring(0, 8) + '...',
        Usuario: metric.user.name,
        TotalViewers: metric.totalViewers,
        TotalBloques: metric.totalBlocks,
        Última: metric.updatedAt.toLocaleString()
      })));
    }

    // 5. Estadísticas generales
    console.log('\n📈 ESTADÍSTICAS GENERALES:');
    const stats = {
      totalUsuarios: await prisma.user.count(),
      totalBloques: await prisma.block.count(),
      bloquesActivos: await prisma.block.count({ where: { isActive: true } }),
      totalOperaciones: await prisma.operation.count(),
      operacionesHoy: await prisma.operation.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      totalViewers: await prisma.operation.aggregate({
        _sum: { viewers: true }
      }),
      últimaActividad: await prisma.operation.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
      })
    };

    console.log('📊 Resumen:');
    console.log(`   👥 Usuarios: ${stats.totalUsuarios}`);
    console.log(`   📦 Bloques: ${stats.totalBloques} (${stats.bloquesActivos} activos)`);
    console.log(`   ⚡ Operaciones: ${stats.totalOperaciones} (${stats.operacionesHoy} hoy)`);
    console.log(`   👀 Total Viewers: ${stats.totalViewers._sum?.viewers || 0}`);
    console.log(`   🕐 Última actividad: ${stats.últimaActividad ? stats.últimaActividad.createdAt.toLocaleString() : 'Nunca'}`);

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// Ejecutar verificación
checkDatabaseData();
