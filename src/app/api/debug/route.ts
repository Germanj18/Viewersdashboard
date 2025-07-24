import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { getServerSession } from "next-auth/next";

export async function GET(request: Request) {
  try {
    console.log('🔍 DEBUG: Starting database diagnostics...');
    
    // 1. Verificar conexión a la base de datos
    console.log('🔍 DEBUG: Testing database connection...');
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', dbTest);

    // 2. Verificar que las tablas existen
    console.log('🔍 DEBUG: Checking tables...');
    const userCount = await prisma.user.count();
    
    // Verificar OperationHistory con try/catch
    let operationsCount = 0;
    try {
      operationsCount = await (prisma as any).operationHistory.count();
    } catch (e) {
      console.error('Error accessing operationHistory:', e);
    }
    console.log('✅ Tables exist - Users:', userCount, 'Operations:', operationsCount);

    // 3. Verificar variables de entorno críticas
    console.log('🔍 DEBUG: Checking environment variables...');
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'SET' : 'NOT SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.POSTGRES_PRISMA_URL ? 'SET' : 'NOT SET',
      hasDatabase: !!process.env.POSTGRES_PRISMA_URL,
    };
    console.log('✅ Environment variables:', envVars);

    // 4. Probar autenticación
    console.log('🔍 DEBUG: Testing authentication...');
    const session = await getServerSession();
    console.log('✅ Session status:', session ? 'AUTHENTICATED' : 'NOT AUTHENTICATED');

    // 5. Verificar última operación
    console.log('🔍 DEBUG: Getting latest operation...');
    let latestOperation = null;
    try {
      latestOperation = await (prisma as any).operationHistory.findFirst({
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true, username: true } } }
      });
    } catch (e) {
      console.error('Error accessing latest operation:', e);
    }
    console.log('✅ Latest operation:', latestOperation);

    return NextResponse.json({
      success: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        userCount,
        operationsCount,
        latestOperation
      },
      environment_variables: envVars,
      session: session ? {
        authenticated: true,
        user: session.user?.name || 'Unknown'
      } : {
        authenticated: false
      }
    });

  } catch (error) {
    console.error('❌ DEBUG ERROR:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
