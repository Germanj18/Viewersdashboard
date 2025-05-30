import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByUsername } from "../../../lib/luser"; // Asegúrate de que la ruta sea correcta

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) return null;

        const user = await getUserByUsername(credentials.username);
        if (user && user.password === credentials.password) {
          return {
            id: user.id,
            name: user.name,
            email: user.username, // NextAuth espera un campo 'email'
            rol: user.rol || "", // Asegúrate de que 'rol' sea una cadena
          };
        }
        return null; // Credenciales no válidas
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Ruta de inicio de sesión
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          rol: token.rol as string ?? '',
        } as { rol?: string; name?: string | null | undefined; email?: string | null | undefined; image?: string | null | undefined; };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.rol = (user as { rol?: string }).rol;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // Asegúrate de tener esta variable de entorno configurada
});

export { handler as GET, handler as POST };