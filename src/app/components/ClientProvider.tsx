"use client"; // Marcado como cliente

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "../ThemeContext"; // Importar el ThemeProvider
import AIChat from "./AIChat"; // Importar el chat IA

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <AIChat />
      </ThemeProvider>
    </SessionProvider>
  );
}