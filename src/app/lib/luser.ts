import { PrismaClient } from '@prisma/client';
import { User } from '../../app/api/types/user'; // Asegúrate de que la ruta sea correcta

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("Conectado a la base de datos"))
  .catch((e: any) => console.error("Error al conectar a la base de datos", e));

export async function getUserByUsername(username: string | undefined): Promise<User | null> {
  if (!username) return null;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  return user || null;
}