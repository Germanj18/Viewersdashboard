import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, username, password, name } = body;

    switch (action) {
      case 'register':
        if (!username || !password || !name) {
          return NextResponse.json(
            { success: false, message: 'Username, password, and name are required' },
            { status: 400 }
          );
        }

        // Verificar si el usuario ya existe
        const existingUser = await prisma.user.findUnique({
          where: { username },
        });

        if (existingUser) {
          return NextResponse.json(
            { success: false, message: 'Username already exists' },
            { status: 409 }
          );
        }

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 12);

        // Crear el usuario
        const newUser = await prisma.user.create({
          data: {
            username,
            password: hashedPassword,
            name,
            rol: 'user',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'User created successfully',
          user: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            rol: newUser.rol,
          },
        });

      case 'login':
        if (!username || !password) {
          return NextResponse.json(
            { success: false, message: 'Username and password are required' },
            { status: 400 }
          );
        }

        // Buscar el usuario
        const user = await prisma.user.findUnique({
          where: { username },
        });

        if (!user) {
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }

        // Verificar la contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            rol: user.rol,
          },
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
