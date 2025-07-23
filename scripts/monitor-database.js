const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let lastOperationCount = 0;
let lastBlockCount = 0;

async function monitorDatabase() {
  try {
    const currentTime = new Date().toLocaleTimeString();
    
    // Contar datos actuales
    const operationCount = await prisma.operation.count();
    const blockCount = await prisma.block.count();
    const activeBlocks = await prisma.block.count({ where: { isActive: true } });
    
    // Detectar cambios
    const newOperations = operationCount - lastOperationCount;
    const newBlocks = blockCount - lastBlockCount;
    
    console.clear();
    console.log('🔴 MONITOR EN TIEMPO REAL - Dashboard Viewers');
    console.log('═'.repeat(60));
    console.log(`🕐 ${currentTime}`);
    console.log('═'.repeat(60));
    
    // Estado actual
    console.log('📊 ESTADO ACTUAL:');
    console.log(`   📦 Bloques: ${blockCount} total, ${activeBlocks} activos`);
    console.log(`   ⚡ Operaciones: ${operationCount} total`);
    
    // Detectar actividad nueva
    if (newOperations > 0) {
      console.log(`\n🆕 NUEVA ACTIVIDAD DETECTADA:`);
      console.log(`   ⚡ +${newOperations} nuevas operaciones`);
      
      // Mostrar las últimas operaciones
      const recentOps = await prisma.operation.findMany({
        include: {
          user: { select: { name: true } },
          block: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('\n📋 ÚLTIMAS OPERACIONES:');
      recentOps.forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.user.name} - ${op.type} ${op.viewers} viewers (${op.block?.name || 'Sin bloque'})`);
      });
    }
    
    if (newBlocks > 0) {
      console.log(`\n📦 +${newBlocks} nuevos bloques creados`);
    }
    
    if (newOperations === 0 && newBlocks === 0) {
      console.log('\n💤 Sin actividad nueva...');
    }
    
    // Actualizar contadores
    lastOperationCount = operationCount;
    lastBlockCount = blockCount;
    
    console.log('\n⏰ Próxima verificación en 5 segundos...');
    console.log('Presiona Ctrl+C para detener el monitor');
    
  } catch (error) {
    console.error('❌ Error en el monitor:', error.message);
  }
}

// Ejecutar cada 5 segundos
console.log('🚀 Iniciando monitor de base de datos...');
console.log('📝 Este script detectará cambios en tiempo real\n');

// Ejecutar inmediatamente y luego cada 5 segundos
monitorDatabase();
const interval = setInterval(monitorDatabase, 5000);

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Deteniendo monitor...');
  clearInterval(interval);
  await prisma.$disconnect();
  console.log('✅ Monitor detenido correctamente');
  process.exit(0);
});
