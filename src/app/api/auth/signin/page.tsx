// app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Preloader from '../../../components/Preloader'; // Importar el componente Preloader

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la visibilidad del preloader
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para controlar si el usuario ha iniciado sesión

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true); // Mostrar el preloader

    // Llama a la función signIn de NextAuth
    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError(result.error);
      setIsLoading(false); // Ocultar el preloader en caso de error
    } else {
      setIsLoggedIn(true); // Actualizar el estado para reflejar que el usuario ha iniciado sesión
      setIsLoading(false); // Ocultar el preloader
    }
  };

  return (
    <div>
      {isLoading ? (
        <Preloader /> // Mostrar el preloader mientras se procesa la solicitud de inicio de sesión
      ) : isLoggedIn ? (
        <p>Bienvenido, {username}!</p> // Mostrar un mensaje de bienvenida después de iniciar sesión
      ) : (
        <>
          <h1>Iniciar Sesión</h1>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Nombre de Usuario:</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="password">Contraseña:</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div style={{ color: "red" }}>{error}</div>}
            <button type="submit">Iniciar sesión</button>
          </form>
        </>
      )}
    </div>
  );
}