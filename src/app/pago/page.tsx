"use client";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import MercadoPagoPayment from '../components/MercadoPagoPayment';
// import MercadoPagoPaymentReact from '../components/MercadoPagoPaymentReact'; // Versión alternativa con SDK React

export default function PagoPage() {
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
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <header className={`w-full flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold">Pagos - Metricas LaCasa</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="bg-gray-700 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
          >
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`w-full max-w-2xl p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold text-center mb-8">Procesar Pago</h2>
          <MercadoPagoPayment />
        </div>
      </main>
    </div>
  );
}
