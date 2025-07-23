const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function simpleDataCheck() {
  try {
    console.log('🔍 Verificación simple de datos en la base de datos...\n');

    // 1. Verificar usuarios
    console.log('👥 USUARIOS:');
    const users = await prisma.user.findMany({
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
        Creado: user.createdAt.toLocaleDateString()
      })));
    }

    // 2. Verificar bloques
    console.log('\n📦 BLOQUES:');
    const blocks = await prisma.block.findMany({
      include: {
        user: {
          select: { name: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    if (blocks.length === 0) {
      console.log('❌ No hay bloques en la base de datos');
      console.log('💡 Esto es normal si acabas de migrar. Los bloques se crearán cuando uses el dashboard.');
    } else {
      console.table(blocks.map(block => ({
        ID: block.id.substring(0, 8) + '...',
        Nombre: block.name,
        Usuario: block.user.name,
        Viewers: block.viewers,
        Minutos: block.minutes,
        Activo: block.isActive ? '✅' : '❌',
        Inicio: block.startTime.toLocaleString(),
        Fin: block.endTime ? block.endTime.toLocaleString() : 'En curso'
      })));
    }

    // 3. Verificar operaciones
    console.log('\n⚡ OPERACIONES:');
    const operations = await prisma.operation.findMany({
      include: {
        user: { select: { name: true } },
        block: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    if (operations.length === 0) {
      console.log('❌ No hay operaciones en la base de datos');
      console.log('💡 Las operaciones se crearán cuando agregues/quites viewers en el dashboard.');
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

    // 4. Verificar métricas
    console.log('\n📊 MÉTRICAS:');
    const metrics = await prisma.userMetrics.findMany({
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (metrics.length === 0) {
      console.log('❌ No hay métricas en la base de datos');
      console.log('💡 Las métricas se generarán automáticamente cuando uses el dashboard.');
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
      totalMétricas: await prisma.userMetrics.count()
    };

    console.log('📊 Resumen:');
    console.log(`   👥 Usuarios: ${stats.totalUsuarios}`);
    console.log(`   📦 Bloques: ${stats.totalBloques} (${stats.bloquesActivos} activos)`);
    console.log(`   ⚡ Operaciones: ${stats.totalOperaciones}`);
    console.log(`   📈 Métricas: ${stats.totalMétricas}`);

    if (stats.totalBloques === 0 && stats.totalOperaciones === 0) {
      console.log('\n💡 PRÓXIMOS PASOS:');
      console.log('1. Accede al dashboard en http://localhost:3000/admin');
      console.log('2. Inicia sesión con: germana@expansionholding.com / admin');
      console.log('3. Crea algunos bloques y agrega viewers');
      console.log('4. Ejecuta este script nuevamente para ver los datos');
      console.log('\n🚀 O ejecuta "node scripts/insert-test-data.js" para agregar datos de prueba');
    }

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// Ejecutar verificación
simpleDataCheck();
