import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabase: !!process.env.POSTGRES_PRISMA_URL,
    session: null as any,
    headers: {} as any
  };

  try {
    // Verificar sesión
    const session = await getServerSession();
    diagnostics.session = session ? {
      authenticated: true,
      userId: session.user?.id || 'no-id',
      name: session.user?.name || 'no-name',
      email: session.user?.email || 'no-email'
    } : {
      authenticated: false
    };

  } catch (error) {
    diagnostics.session = {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  return NextResponse.json(diagnostics);
}

export async function POST(request: Request) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    url: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabase: !!process.env.POSTGRES_PRISMA_URL,
    requestData: null as any,
    session: null as any,
    headers: {} as any
  };

  try {
    // Leer datos de la request
    const body = await request.json();
    diagnostics.requestData = {
      received: true,
      keys: Object.keys(body),
      userId: body.userId || 'no-userId',
      blockTitle: body.blockTitle || 'no-blockTitle'
    };

    // Verificar headers importantes
    diagnostics.headers = {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      'origin': request.headers.get('origin'),
      'referer': request.headers.get('referer'),
      'cookie': request.headers.get('cookie') ? 'present' : 'absent'
    };

    // Verificar sesión
    const session = await getServerSession();
    diagnostics.session = session ? {
      authenticated: true,
      userId: session.user?.id || 'no-id',
      name: session.user?.name || 'no-name'
    } : {
      authenticated: false
    };

    console.log('🔍 PRODUCTION DIAGNOSTICS:', JSON.stringify(diagnostics, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Diagnostic data logged',
      diagnostics
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      diagnostics
    }, { status: 500 });
  }
}
