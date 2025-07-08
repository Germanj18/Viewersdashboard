"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import IndependentViewers from '../components/IndependentViewers';

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
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
    }`}>
        <header className={`w-full flex justify-between items-center p-6 backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-slate-900/80 border-b border-slate-700/50' 
            : 'bg-white/80 border-b border-gray-200/50 shadow-sm'
        }`}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 bg-clip-text text-transparent">
            ServiceDG Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
              }`}
            >
              {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="flex flex-1">
          <aside className={`w-80 flex flex-col p-6 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-800/60 border-r border-slate-700/50' 
              : 'bg-white/80 border-r border-gray-200/50 shadow-sm'
          }`}>
            <div className="space-y-4">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📊</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Panel de Control</h2>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Gestiona tu dashboard
                </p>
              </div>

              <button
                className={`w-full p-4 rounded-2xl font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                }`}
                disabled
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-sm">📈</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Administrar Viewers</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      Gestión de datos
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => router.push('/pago')}
                className={`w-full p-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105 ${
                  theme === 'dark'
                    ? 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50 hover:border-green-500/50'
                    : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-400'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-white text-sm">💳</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Pagos</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                      Métodos de pago
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col items-center justify-start p-8">
            <div className={`w-full max-w-7xl p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl' 
                : 'bg-white/80 border border-gray-200/50 shadow-xl'
            }`}>
              <IndependentViewers />
            </div>
          </main>
        </div>

        <footer className={`w-full p-6 backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-slate-900/80 border-t border-slate-700/50' 
            : 'bg-white/80 border-t border-gray-200/50 shadow-sm'
        }`}>
          <p className={`text-center text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            © 2025 ServiceDG. Todos los derechos reservados.
          </p>
        </footer>
    </div>
  );
}