const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUsers() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    
    // Usuarios a crear
    const users = [
      {
        name: 'German Admin',
        username: 'germana@expansionholding.com',
        password: 'admin',
        rol: 'admin'
      },
      {
        name: 'David',
        username: 'davido@expansionholding.com',
        password: 'Davido',
        rol: 'user'
      }
    ];

    for (const userData of users) {
      console.log(`\n📝 Procesando usuario: ${userData.username}`);
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUser) {
        console.log(`⚠️  El usuario ${userData.username} ya existe. Actualizando contraseña...`);
        
        // Hashear la nueva contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Actualizar el usuario existente
        const updatedUser = await prisma.user.update({
          where: { username: userData.username },
          data: {
            name: userData.name,
            password: hashedPassword,
            rol: userData.rol,
            updatedAt: new Date()
          }
        });
        
        console.log(`✅ Usuario ${userData.username} actualizado correctamente`);
        console.log(`   - ID: ${updatedUser.id}`);
        console.log(`   - Nombre: ${updatedUser.name}`);
        console.log(`   - Rol: ${updatedUser.rol}`);
        
      } else {
        console.log(`➕ Creando nuevo usuario: ${userData.username}`);
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        
        // Crear el nuevo usuario
        const newUser = await prisma.user.create({
          data: {
            name: userData.name,
            username: userData.username,
            password: hashedPassword,
            rol: userData.rol
          }
        });
        
        console.log(`✅ Usuario ${userData.username} creado correctamente`);
        console.log(`   - ID: ${newUser.id}`);
        console.log(`   - Nombre: ${newUser.name}`);
        console.log(`   - Rol: ${newUser.rol}`);
      }
    }

    console.log('\n🎉 Proceso completado exitosamente');
    console.log('\n📋 Resumen de usuarios creados/actualizados:');
    
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        rol: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.table(allUsers.map(user => ({
      ID: user.id.substring(0, 8) + '...',
      Nombre: user.name,
      Email: user.username,
      Rol: user.rol,
      Creado: user.createdAt.toLocaleDateString(),
      Actualizado: user.updatedAt.toLocaleDateString()
    })));

    console.log('\n🔐 Credenciales de acceso:');
    console.log('1. germana@expansionholding.com / admin (Administrador)');
    console.log('2. davido@expansionholding.com / Davido (Usuario)');

  } catch (error) {
    console.error('❌ Error al crear/actualizar usuarios:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

// Ejecutar el script
createUsers();
