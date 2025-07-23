const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function insertTestData() {
  try {
    console.log('🧪 Insertando datos de prueba en la base de datos...\n');

    // Obtener un usuario existente
    const user = await prisma.user.findFirst({
      where: { username: process.env.ADMIN_EMAIL || 'admin@company.com' }
    });

    if (!user) {
      console.log('❌ No se encontró el usuario administrador configurado');
      console.log('Ejecuta primero: node scripts/create-users.js');
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.name} (${user.username})`);

    // 1. Crear algunos bloques de prueba
    console.log('\n📦 Creando bloques de prueba...');
    
    const blocks = [
      {
        name: 'Bloque Test 1',
        viewers: 1000,
        minutes: 30,
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        endTime: new Date(),
        isActive: false
      },
      {
        name: 'Bloque Test 2',
        viewers: 1500,
        minutes: 45,
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
        endTime: null,
        isActive: true
      },
      {
        name: 'Bloque Test 3',
        viewers: 800,
        minutes: 20,
        startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 minutos atrás
        endTime: null,
        isActive: true
      }
    ];

    const createdBlocks = [];
    for (const blockData of blocks) {
      const block = await prisma.block.create({
        data: {
          ...blockData,
          userId: user.id
        }
      });
      createdBlocks.push(block);
      console.log(`   ✅ Creado: ${block.name} (${block.viewers} viewers)`);
    }

    // 2. Crear operaciones de prueba
    console.log('\n⚡ Creando operaciones de prueba...');
    
    const operations = [
      { type: 'add', viewers: 500, blockId: createdBlocks[0].id },
      { type: 'add', viewers: 300, blockId: createdBlocks[0].id },
      { type: 'subtract', viewers: 100, blockId: createdBlocks[0].id },
      { type: 'add', viewers: 1500, blockId: createdBlocks[1].id },
      { type: 'add', viewers: 800, blockId: createdBlocks[2].id },
      { type: 'reset', viewers: 0, blockId: createdBlocks[0].id },
      { type: 'add', viewers: 200, blockId: null }, // Operación sin bloque específico
    ];

    for (let i = 0; i < operations.length; i++) {
      const opData = operations[i];
      const operation = await prisma.operation.create({
        data: {
          ...opData,
          userId: user.id,
          createdAt: new Date(Date.now() - (operations.length - i) * 2 * 60 * 1000) // Espaciados cada 2 minutos
        }
      });
      console.log(`   ✅ Operación: ${operation.type} ${operation.viewers} viewers`);
      
      // Pequeña pausa para simular actividad real
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // 3. Crear métricas de usuario
    console.log('\n📊 Creando métricas de usuario...');
    
    const totalViewers = operations.reduce((sum, op) => {
      return op.type === 'add' ? sum + op.viewers : sum;
    }, 0);

    const userMetrics = await prisma.userMetrics.create({
      data: {
        userId: user.id,
        totalViewers: totalViewers,
        totalBlocks: createdBlocks.length,
        totalOperations: operations.length,
        avgViewersPerBlock: Math.round(totalViewers / createdBlocks.length)
      }
    });

    console.log(`   ✅ Métricas creadas: ${userMetrics.totalViewers} viewers, ${userMetrics.totalBlocks} bloques`);

    // 4. Verificar que todo se guardó correctamente
    console.log('\n🔍 Verificando datos insertados...');
    
    const verification = {
      blocksCreated: await prisma.block.count({ where: { userId: user.id } }),
      operationsCreated: await prisma.operation.count({ where: { userId: user.id } }),
      metricsCreated: await prisma.userMetrics.count({ where: { userId: user.id } })
    };

    console.log('📊 Resumen de datos insertados:');
    console.log(`   📦 Bloques: ${verification.blocksCreated}`);
    console.log(`   ⚡ Operaciones: ${verification.operationsCreated}`);
    console.log(`   📈 Métricas: ${verification.metricsCreated}`);

    console.log('\n✅ ¡Datos de prueba insertados exitosamente!');
    console.log('💡 Ahora puedes usar el dashboard y los datos se guardarán en la nueva base de datos');
    console.log('🔍 Ejecuta "node scripts/check-database-data.js" para verificar los datos');
    console.log('📡 Ejecuta "node scripts/monitor-database.js" para monitorear en tiempo real');

  } catch (error) {
    console.error('❌ Error al insertar datos de prueba:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// Ejecutar inserción de datos de prueba
insertTestData();
