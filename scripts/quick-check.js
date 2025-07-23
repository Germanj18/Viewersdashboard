const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function quickCheck() {
  try {
    console.log('🔍 Verificación rápida de la base de datos...\n');

    // 1. Usuarios
    const users = await prisma.user.count();
    console.log(`👥 Usuarios: ${users}`);
    
    if (users > 0) {
      const userList = await prisma.user.findMany({
        select: { name: true, username: true, rol: true }
      });
      userList.forEach(user => {
        console.log(`   • ${user.name} (${user.username}) - ${user.rol}`);
      });
    }

    // 2. Bloques
    const totalBlocks = await prisma.block.count();
    const activeBlocks = await prisma.block.count({ where: { isActive: true } });
    console.log(`\n📦 Bloques: ${totalBlocks} total, ${activeBlocks} activos`);

    if (totalBlocks > 0) {
      const recentBlocks = await prisma.block.findMany({
        select: { name: true, viewers: true, isActive: true },
        take: 5,
        orderBy: { startTime: 'desc' }
      });
      recentBlocks.forEach(block => {
        console.log(`   • ${block.name}: ${block.viewers} viewers ${block.isActive ? '(activo)' : '(finalizado)'}`);
      });
    }

    // 3. Operaciones
    const operations = await prisma.operation.count();
    console.log(`\n⚡ Operaciones: ${operations}`);

    if (operations > 0) {
      const recentOps = await prisma.operation.findMany({
        include: { user: { select: { name: true } } },
        take: 5,
        orderBy: { timestamp: 'desc' }
      });
      recentOps.forEach(op => {
        console.log(`   • ${op.user.name}: ${op.type} ${op.viewers} viewers`);
      });
    }

    // 4. Métricas
    const metrics = await prisma.userMetrics.count();
    console.log(`\n📊 Métricas: ${metrics}`);

    // Estado general
    console.log('\n📋 ESTADO GENERAL:');
    if (totalBlocks === 0 && operations === 0) {
      console.log('✅ Base de datos lista, pero sin datos de uso aún');
      console.log('💡 Los datos se guardarán automáticamente cuando uses el dashboard');
      console.log('\n🎯 PARA PROBAR:');
      console.log('1. Ve a http://localhost:3000/admin');
      console.log('2. Inicia sesión con: germana@expansionholding.com / admin');
      console.log('3. Crea un bloque y agrega viewers');
      console.log('4. Ejecuta este script nuevamente');
    } else {
      console.log('✅ Base de datos funcionando con datos activos');
      console.log('📡 Los cambios del dashboard se están guardando correctamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickCheck();
