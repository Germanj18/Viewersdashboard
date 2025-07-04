'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from './ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faChartLine, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Charts from './components/Charts';
//import LiveChart from './components/LiveChart';
import SummaryTable from './components/SummaryTable';
import Modal from './components/Modal';
import { useRouter } from 'next/navigation';

import 'animate.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Image from 'next/image';
import './page.css';

const logoServiceDG = '/servicedg-logo.svg';

interface UploadedData {
  channel_name: string;
  fecha: string;
  hora: string;
  youtube: number;
  likes: number;
  title: string;
}

interface UploadedDataChannel extends UploadedData {
  date: string;
  hour: string;
  luzu: number;
  olga: number;
  gelatina: number;
  blender: number;
  lacasa: number;
  vorterix: number;
  bondi: number;
  carajo: number;
  azz: number;
}

const Preloader = () => (
  <div className="preloader">
    <div className="preloader-chart">
      <div className="line"></div>
    </div>
    <style jsx>{`
      .preloader {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
      }
      .preloader-chart {
        width: 100px;
        height: 100px;
        position: relative;
      }
      .line {
        width: 100%;
        height: 100%;
        border-left: 2px solid #4CAF50;
        border-bottom: 2px solid #4CAF50;
        position: absolute;
        top: 0;
        left: 0;
      }
      .line::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #4CAF50, #4CAF50 50%, transparent 50%);
        background-size: 200% 100%;
        animation: zigzag 2s infinite;
      }
      @keyframes zigzag {
        0% {
          clip-path: polygon(0% 100%, 0% 100%, 0% 100%, 0% 100%);
        }
        25% {
          clip-path: polygon(0% 100%, 25% 75%, 50% 100%, 75% 75%, 100% 100%);
        }
        50% {
          clip-path: polygon(0% 100%, 25% 75%, 50% 50%, 75% 25%, 100% 0%);
        }
        75% {
          clip-path: polygon(0% 100%, 25% 75%, 50% 50%, 75% 25%, 100% 0%);
        }
        100% {
          clip-path: polygon(0% 100%, 25% 75%, 50% 50%, 75% 25%, 100% 0%);
        }
      }
    `}</style>
  </div>
);

export default function Home() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<UploadedDataChannel[]>([]);
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado para el preloader
  const [showLiveChart, setShowLiveChart] = useState(false); // Estado para mostrar el gráfico en vivo
 const router = useRouter();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleSignInClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleConsultMetricsClick = () => {
    setShowDateInputs(true);
  };

  const handleFetchData = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true); // Mostrar preloader
    const response = await fetch(`/api/fetchData?startDate=${startDate}&endDate=${endDate}`);
    const result = await response.json();
    console.log('Datos obtenidos:', result);
    setData(result);
    setIsLoading(false); // Ocultar preloader
  };

  const handleChartsRendered = () => {
    setIsLoading(false); // Ocultar preloader cuando los gráficos estén renderizados
  };

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
        <div className="flex items-center">
          <Image src={logoServiceDG} alt="ServiceDG Logo" width={50} height={50} className="mr-4 rounded-xl" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            YouTube Viewers Analysis
          </h1>
        </div>
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
            onClick={() => {
              if (session) {
                router.push('/admin');
              } else {
                handleSignInClick();
              }
            }}
            className="px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            {session ? 'Dashboard' : 'Acceder'}
          </button>
          
          {status === 'loading' ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          ) : !session ? (
            <button 
              onClick={handleSignInClick} 
              className="px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Iniciar sesión
            </button>
          ) : (
            <button 
              onClick={() => signOut()} 
              className="px-6 py-2 rounded-xl font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Cerrar sesión
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex">
        <div className={`w-80 p-6 backdrop-blur-sm ${
          theme === 'dark' 
            ? 'bg-slate-800/60 border-r border-slate-700/50' 
            : 'bg-white/80 border-r border-gray-200/50 shadow-sm'
        }`}>

          {showDateInputs && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FontAwesomeIcon icon={faChartLine} className="text-white text-lg" />
                </div>
                <h3 className="font-bold text-lg">Consultar Métricas</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Selecciona el rango de fechas
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-100 focus:border-green-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-green-500 shadow-sm'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-semibold mb-2 ${
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-slate-700/50 border-slate-600 text-slate-100 focus:border-green-500' 
                      : 'bg-white border-gray-200 text-gray-900 focus:border-green-500 shadow-sm'
                  }`}
                />
              </div>

              <button 
                onClick={handleFetchData} 
                className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <FontAwesomeIcon icon={faChartLine} className="mr-2" />
                Consultar Datos
              </button>
            </div>
          )}
        </div>

        <section className="flex-grow p-8">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className={`p-8 rounded-2xl backdrop-blur-sm ${
                theme === 'dark' 
                  ? 'bg-slate-800/60 border border-slate-700/50' 
                  : 'bg-white/80 border border-gray-200/50 shadow-xl'
              }`}>
                <Preloader />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {data.length > 0 && (
                <>
                  <section>
                    <div className={`p-8 rounded-2xl backdrop-blur-sm ${
                      theme === 'dark' 
                        ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl' 
                        : 'bg-white/80 border border-gray-200/50 shadow-xl'
                    }`}>
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                          <span className="text-white text-xl">📈</span>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          Gráficos de Línea
                        </h2>
                      </div>
                      <Charts data={data} onRendered={handleChartsRendered} />
                    </div>
                  </section>

                  <section>
                    <div className={`p-8 rounded-2xl backdrop-blur-sm ${
                      theme === 'dark' 
                        ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl' 
                        : 'bg-white/80 border border-gray-200/50 shadow-xl'
                    }`}>
                      <div className="flex items-center mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mr-4">
                          <span className="text-white text-xl">📊</span>
                        </div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Resumen de Datos
                        </h2>
                      </div>
                      <div className="w-full">
                        <SummaryTable data={data} onRendered={handleChartsRendered} />
                      </div>
                    </div>
                  </section>
                </>
              )}
              
              {data.length === 0 && !isLoading && (
                <div className="flex items-center justify-center h-96">
                  <div className={`text-center p-12 rounded-2xl backdrop-blur-sm ${
                    theme === 'dark' 
                      ? 'bg-slate-800/60 border border-slate-700/50' 
                      : 'bg-white/80 border border-gray-200/50 shadow-xl'
                  }`}>
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-white text-3xl">📊</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Sin datos para mostrar</h3>
                  
                  </div>
                </div>
              )}
            </div>
          )}

          <Modal isOpen={isModalOpen} onClose={handleModalClose} />
        </section>
      </main>

      <footer className={`w-full p-6 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-t border-slate-700/50' 
          : 'bg-white/80 border-t border-gray-200/50 shadow-sm'
      }`}>
        <p className={`text-center ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
          &copy; 2025 YouTube Viewers Analysis - ServiceDG. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}