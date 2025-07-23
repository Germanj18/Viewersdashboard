"use client";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { GlobalProvider } from '../components/GlobalContext';
import Viewers from '../components/Viewers';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (status === 'loading') {
    return <Preloader />;
  }

  if (!session) {
    router.replace('/');
    return null;
  }

  return (
    <GlobalProvider>
      <div className={`flex flex-col min-h-screen transition-all duration-300 overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
      }`}>
          <header className={`w-full flex justify-between items-center p-4 lg:p-6 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-900/80 border-b border-slate-700/50' 
              : 'bg-white/80 border-b border-gray-200/50 shadow-sm'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Botón hamburguesa para móvil */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`lg:hidden px-3 py-2 rounded-xl font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                }`}
              >
                <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
              </button>
              
              <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 bg-clip-text text-transparent">
                ServiceDG Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button
                onClick={toggleTheme}
                className={`px-3 py-2 lg:px-4 lg:py-2 rounded-xl font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                }`}
              >
                {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
              </button>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-4 py-2 lg:px-6 lg:py-2 rounded-xl font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl text-sm lg:text-base"
              >
                Cerrar sesión
              </button>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Overlay para móvil cuando el sidebar está abierto */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <aside className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
              lg:translate-x-0 
              fixed lg:relative
              z-50 lg:z-auto
              w-80 lg:w-64 xl:w-80 
              flex-shrink-0 
              flex flex-col 
              p-4 lg:p-6 
              backdrop-blur-sm 
              overflow-y-auto 
              transition-transform duration-300 ease-in-out
              h-full lg:h-auto
              ${theme === 'dark' 
                ? 'bg-slate-800/95 lg:bg-slate-800/60 border-r border-slate-700/50' 
                : 'bg-white/95 lg:bg-white/80 border-r border-gray-200/50 shadow-sm'
              }
            `}>
              <div className="space-y-4">
                <div className="text-center mb-6 lg:mb-8">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg lg:text-2xl">📊</span>
                  </div>
                  <h2 className="text-lg lg:text-xl font-bold mb-2">Panel de Control</h2>
                  <p className={`text-xs lg:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    Gestiona tu dashboard
                  </p>
                </div>

                {/* Información del usuario logueado */}
                <div className={`p-3 lg:p-4 rounded-2xl border transition-all duration-200 mb-4 ${
                  theme === 'dark'
                    ? 'bg-slate-700/40 border-slate-600/50 text-slate-200'
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-br from-green-500 to-green-600' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      <span className="text-white text-lg lg:text-xl">
                        {session?.user?.name?.charAt(0)?.toUpperCase() || '👤'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm lg:text-base truncate">
                        {session?.user?.name || 'Usuario'}
                      </div>
                      <div className={`text-xs truncate ${
                        theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {session?.user?.email}
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          (session?.user as any)?.rol === 'admin'
                            ? theme === 'dark'
                              ? 'bg-green-900/50 text-green-300 border border-green-800'
                              : 'bg-green-100 text-green-700 border border-green-200'
                            : theme === 'dark'
                              ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                              : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {(session?.user as any)?.rol === 'admin' ? '👑 Admin' : '👤 Usuario'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`mt-3 pt-3 border-t text-xs ${
                    theme === 'dark' 
                      ? 'border-slate-600 text-slate-400' 
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>Sesión iniciada</span>
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Activa
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  className={`w-full p-3 lg:p-4 rounded-2xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                  }`}
                  disabled
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 flex-shrink-0">
                      <span className="text-white text-xs lg:text-sm">📈</span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-sm lg:text-base">Administrar Viewers</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                        Gestión de datos
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    router.push('/pago');
                    setSidebarOpen(false); // Cerrar sidebar al navegar
                  }}
                  className={`w-full p-3 lg:p-4 rounded-2xl font-medium transition-all duration-200 hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-slate-700/60 hover:bg-slate-600/80 text-slate-200 border border-slate-600/50 hover:border-green-500/50'
                      : 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 hover:border-green-400'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4 flex-shrink-0">
                      <span className="text-white text-xs lg:text-sm">💳</span>
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-semibold text-sm lg:text-base">Pagos</div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
                        Métodos de pago
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8 overflow-auto">
              <div className={`w-full max-w-none p-4 lg:p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl' 
                  : 'bg-white/80 border border-gray-200/50 shadow-xl'
              }`}>
                <div className="w-full">
                  <Viewers />
                </div>
              </div>
            </main>
          </div>

          <footer className={`w-full p-4 lg:p-6 backdrop-blur-sm ${
            theme === 'dark' 
              ? 'bg-slate-900/80 border-t border-slate-700/50' 
              : 'bg-white/80 border-t border-gray-200/50 shadow-sm'
          }`}>
            <p className={`text-center text-xs lg:text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              © 2025 ServiceDG. Todos los derechos reservados.
            </p>
          </footer>
      </div>
    </GlobalProvider>
  );
}