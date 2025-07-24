const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

let lastOperationHistoryCount = 0;
let lastUserCount = 0;

async function monitorDatabase() {
  try {
    const currentTime = new Date().toLocaleTimeString();
    
    // Contar datos actuales
    const operationHistoryCount = await prisma.operationHistory.count();
    const userCount = await prisma.user.count();
    
    // Detectar cambios
    const newOperations = operationHistoryCount - lastOperationHistoryCount;
    const newUsers = userCount - lastUserCount;
    
    console.clear();
    console.log('🔴 MONITOR EN TIEMPO REAL - Dashboard Viewers');
    console.log('═'.repeat(60));
    console.log(`🕐 ${currentTime}`);
    console.log('═'.repeat(60));
    
    // Estado actual
    console.log('📊 ESTADO ACTUAL:');
    console.log(`   � Usuarios: ${userCount} total`);
    console.log(`   📋 Historial Operaciones: ${operationHistoryCount} total`);
    
    // Detectar actividad nueva
    if (newOperations > 0) {
      console.log(`\n🆕 NUEVA ACTIVIDAD DETECTADA:`);
      console.log(`   ⚡ +${newOperations} nuevas operaciones en historial`);
      
      // Mostrar las últimas operaciones
      const recentOps = await prisma.operationHistory.findMany({
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });
      
      console.log('\n📋 ÚLTIMAS OPERACIONES:');
      recentOps.forEach((op, index) => {
        console.log(`   ${index + 1}. ${op.user.name} - ${op.operationType} ${op.viewers} viewers (Bloque ${op.blockId})`);
      });
    }
    
    if (newUsers > 0) {
      console.log(`\n� +${newUsers} nuevos usuarios registrados`);
    }
    
    if (newOperations === 0 && newUsers === 0) {
      console.log('\n💤 Sin actividad nueva...');
    }
    
    // Actualizar contadores
    lastOperationHistoryCount = operationHistoryCount;
    lastUserCount = userCount;
    
    console.log('\n⏰ Próxima verificación en 5 segundos...');
    console.log('Presiona Ctrl+C para detener el monitor');
    
  } catch (error) {
    console.error('❌ Error en el monitor:', error.message);
    console.log('🔧 Posibles causas:');
    console.log('   • Las tablas aún no han sido migradas');
    console.log('   • La base de datos no está disponible');
    console.log('   • Error de conexión');
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
