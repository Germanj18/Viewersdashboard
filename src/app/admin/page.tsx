"use client";
// src/app/admin/page.tsx
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

import AdminGraphQuery from '../components/AdminGraphQuery';
import AuthenticatedFileUpload from '../components/AuthenticatedFileUpload';
import FileUpload from '../components/FileUpload';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import ProgramCards from '../components/ProgramCards'; // Importar el componente ProgramCards

interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  rol?: string | null | undefined;
}

interface UploadedDataProgram {
  programa: string;
  hora: string;
  real: number;
  chimi: number;
  total: number;
  fecha: string;
}

interface UploadedDataChannel {
  channel_name: string;
  created_date: string;
  youtube: number;
  likes: number;
  title: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<UploadedDataProgram[]>([]);
  const [channelData, setChannelData] = useState<UploadedDataChannel[]>([]);
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [activeComponent, setActiveComponent] = useState<string>('ProgramCards'); // Estado para controlar el componente activo
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // Estado para la fecha seleccionada

  const handleFileUpload = (uploadedData: UploadedDataProgram[]) => {
    setData(uploadedData);
  };

  const handleChannelFileUpload = (uploadedData: UploadedDataChannel[]) => {
    setChannelData(uploadedData);
  };

  if (status === 'loading') {
    return <Preloader />;
  }

  if (!session) {
    return <p>Por favor, inicia sesión para acceder al dashboard.</p>;
  }

  const user = session.user as User;

  const handleHomeClick = () => {
    setSelectedDate(null); // Limpiar la fecha seleccionada
    setActiveComponent('ProgramCards'); // Mostrar ProgramCards
  };

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <header className="w-full bg-gray-800 text-white flex justify-between items-center p-4">
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
        <aside className="w-64 bg-gray-800 text-white flex flex-col items-center py-8">
          <button
            onClick={handleHomeClick}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-4"
          >
            Home
          </button>
          {user.rol === 'admin' && (
            <>
              <button
                onClick={() => setActiveComponent('upload')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-4"
              >
                Subir Datos LaCasa
              </button>
              <button
                onClick={() => setActiveComponent('uploadChannels')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mb-4"
              >
                Subir Datos de Canales
              </button>
            </>
          )}
          <button
            onClick={() => setActiveComponent('query')}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Metricas de viewers
          </button>
        </aside>

        <main className="flex-1 flex flex-col items-center justify-start p-8">
          {activeComponent === 'ProgramCards' && <ProgramCards theme={theme} onDateSelect={setSelectedDate} selectedDate={selectedDate} />} {/* Mostrar las tarjetas por defecto */}
          {activeComponent === 'upload' && <AuthenticatedFileUpload onFileUpload={handleFileUpload} />}
          {activeComponent === 'uploadChannels' && <FileUpload onFileUpload={handleChannelFileUpload} />}
          {activeComponent === 'query' && <AdminGraphQuery data={data} theme={theme} startDate={new Date().toISOString().split('T')[0]} endDate={new Date().toISOString().split('T')[0]} />} {/* Mostrar AdminGraphQuery */}
        </main>
      </div>
    </div>
  );
}