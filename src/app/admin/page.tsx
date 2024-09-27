"use client";

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

import AdminGraphQuery from '../components/AdminGraphQuery';
import AuthenticatedFileUpload from '../components/AuthenticatedFileUpload'; // Import the AuthenticatedFileUpload component
import FileUpload from '../components/FileUpload'; // Import the FileUpload component
import { useTheme } from '../ThemeContext'; // Importar el contexto del tema
import Preloader from '../components/Preloader'; // Importar el componente Preloader
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons'; // Importar los iconos

interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  rol?: string | null | undefined; // Agregar la propiedad 'rol' a la interfaz User
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
  const { data: session, status } = useSession(); // Obtener el estado de la sesión
  const { theme, toggleTheme } = useTheme(); // Obtener el tema y la función para cambiarlo
  const [activeComponent, setActiveComponent] = useState<string>(''); // Estado para controlar el componente activo

  const handleFileUpload = (uploadedData: UploadedDataProgram[]) => {
    setData(uploadedData);
  };

  const handleChannelFileUpload = (uploadedData: UploadedDataChannel[]) => {
    setChannelData(uploadedData);
  };

  if (status === 'loading') {
    // Mostrar el preloader mientras la sesión se está cargando
    return <Preloader />;
  }

  if (!session) {
    return <p>Por favor, inicia sesión para acceder al dashboard.</p>;
  }

  const user = session.user as User;

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      {/* Barra superior */}
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

      {/* Contenido principal */}
      <div className="flex flex-1">
        {/* Barra de navegación lateral */}
        <aside className="w-64 bg-gray-800 text-white flex flex-col items-center py-8">
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
          {activeComponent === 'upload' && <AuthenticatedFileUpload onFileUpload={handleFileUpload} />}
          {activeComponent === 'uploadChannels' && <FileUpload onFileUpload={handleChannelFileUpload} />}
          {activeComponent === 'query' && <AdminGraphQuery data={data} theme={theme} />}
        </main>
      </div>
    </div>
  );
}