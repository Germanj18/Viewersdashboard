"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BlocksProvider } from '../admin/BlocksContext';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import Viewers from '../components/Viewers';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  if (status === 'loading') {
    return <Preloader />;
  }

  if (!session) {
    router.replace('/');
    return null;
  }

  return (
    <BlocksProvider>
      <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
        <header className={`w-full flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
          <h1 className="text-2xl font-bold">Metricas LaCasa</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
            >
              {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className={`w-64 flex flex-col items-center py-8 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
            <button
              className="bg-blue-500 text-white py-1 px-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-2 text-sm"
              disabled
            >
              Administrar Viewers
            </button>
            <button
              onClick={() => router.push('/pago')}
              className="bg-green-500 text-white py-1 px-2 rounded-lg shadow-md hover:bg-green-600 transition duration-300 mb-2 text-sm"
            >
              Pagos
            </button>
          </aside>

          <main className="flex-1 flex flex-col items-center justify-start p-8">
            <Viewers />
          </main>
        </div>

        <footer className={`w-full p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
          <p className="text-center">© 2023 Metricas LaCasa. Todos los derechos reservados.</p>
        </footer>
      </div>
    </BlocksProvider>
  );
}