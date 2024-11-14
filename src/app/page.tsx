'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from './ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faChartLine, faSignInAlt, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import Charts from './components/Charts';

import SummaryTable from './components/SummaryTable';
import Modal from './components/Modal';

import 'animate.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Image from 'next/image';
import './page.css';

const logoVerde = '/logo-expansion-verde.png';

interface UploadedData {
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
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <header className={`w-full flex justify-between items-center p-4 shadow-md ${theme === 'dark' ? 'header-dark' : 'header-light'}`}>
        <div className="flex items-center">
          <Image src={logoVerde} alt="Logo Verde" width={50} height={50} className="mr-4" />
          <h1 className="text-2xl font-bold">YouTube Viewers Analysis</h1>
        </div>
        <div className="flex items-center">
          <button onClick={toggleTheme} className="btn btn-theme mr-4 transition-transform transform hover:scale-110">
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
          </button>
          {status === 'loading' ? (
            <p>Cargando...</p>
          ) : !session ? (
            <button onClick={handleSignInClick} className="btn btn-primary p-2 rounded-lg bg-green-500 text-white hover:bg-green-700 transition-transform transform hover:scale-110">
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
              Iniciar sesión
            </button>
          ) : (
            <button onClick={() => signOut()} className="btn btn-secondary p-2 rounded-lg bg-red-500 text-white hover:bg-red-700 transition-transform transform hover:scale-110">
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
              Cerrar sesión
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex">
        <div className={`w-64 p-4 shadow-md ${theme === 'dark' ? 'bg-[#1e1e1e] text-white' : 'bg-white text-black'}`}>
          <button 
            onClick={handleConsultMetricsClick} 
            className="btn btn-primary w-full mb-4 p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110" 
            style={{ backgroundColor: '#4CAF50' }}
          >
            <FontAwesomeIcon icon={faChartLine} className="mr-2" />
            Consultar Métricas
          </button>

          {showDateInputs && (
            <div className="flex flex-col space-y-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
              />
              <button 
                onClick={handleFetchData} 
                className="btn btn-secondary w-full p-2 rounded-lg text-white hover:bg-gray-900 transition-transform transform hover:scale-110"
                style={{ backgroundColor: '#4CAF50' }}
              >
                Consultar
              </button>
            </div>
          )}
        </div>

        <section className="flex-grow p-8">
          {isLoading ? (
            <Preloader />
          ) : (
            data.length > 0 && (
              <>
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Gráficos de Línea</h2>
                  <Charts data={data} onRendered={handleChartsRendered} />
                </section>
                <section className="mb-8">
                  <h2 className="text-2xl font-bold mb-4">Gráficos de Barras</h2>
                  <div className="flex flex-col md:flex-row justify-between w-full space-y-4 md:space-y-0 md:space-x-4">
                   
                    <div className="chart-container-small-sumary w-full md:w-1/2">
                      <SummaryTable data={data} onRendered={handleChartsRendered} />
                    </div>
                  </div>
                </section>
              </>
            )
          )}

          <Modal isOpen={isModalOpen} onClose={handleModalClose} />
        </section>
      </main>

      <footer className={`w-full p-4 text-center ${theme === 'dark' ? 'footer-dark' : 'footer-light'}`}>
        <p>&copy; 2024 YouTube Viewers Analysis. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}