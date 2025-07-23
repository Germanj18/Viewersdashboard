const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let lastCheck = { blocks: 0, operations: 0, metrics: 0 };

async function watchDatabase() {
  try {
    const current = {
      blocks: await prisma.block.count(),
      operations: await prisma.operation.count(),
      metrics: await prisma.userMetrics.count()
    };

    const changes = {
      blocks: current.blocks - lastCheck.blocks,
      operations: current.operations - lastCheck.operations,
      metrics: current.metrics - lastCheck.metrics
    };

    console.clear();
    console.log('🔴 MONITOR BASE DE DATOS - Dashboard Viewers');
    console.log('═'.repeat(50));
    console.log(`🕐 ${new Date().toLocaleTimeString()}`);
    console.log('═'.repeat(50));
    console.log(`📦 Bloques: ${current.blocks} ${changes.blocks > 0 ? `(+${changes.blocks})` : ''}`);
    console.log(`⚡ Operaciones: ${current.operations} ${changes.operations > 0 ? `(+${changes.operations})` : ''}`);
    console.log(`📊 Métricas: ${current.metrics} ${changes.metrics > 0 ? `(+${changes.metrics})` : ''}`);

    if (changes.blocks > 0 || changes.operations > 0 || changes.metrics > 0) {
      console.log('\n🆕 ¡NUEVA ACTIVIDAD DETECTADA!');
      if (changes.operations > 0) {
        const lastOp = await prisma.operation.findFirst({
          include: { user: { select: { name: true } } },
          orderBy: { timestamp: 'desc' }
        });
        if (lastOp) {
          console.log(`   ⚡ ${lastOp.user.name}: ${lastOp.type} ${lastOp.viewers} viewers`);
        }
      }
    } else {
      console.log('\n💤 Esperando actividad...');
    }

    console.log('\n💡 Ve al dashboard y crea bloques/agrega viewers para ver cambios');
    console.log('🌐 http://localhost:3000/admin');
    console.log('🔑 germana@expansionholding.com / admin');
    console.log('\nCtrl+C para detener');

    lastCheck = current;

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Ejecutar cada 3 segundos
setInterval(watchDatabase, 3000);
watchDatabase(); // Ejecución inmediata

// Manejar Ctrl+C
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n✅ Monitor detenido');
  process.exit(0);
});
