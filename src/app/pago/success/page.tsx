"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PaymentLoading from '../../components/PaymentLoading';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <header className={`w-full flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin')}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <h1 className="text-2xl font-bold">Resultado del Pago</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`w-full max-w-md p-8 rounded-lg shadow-lg text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-green-500 mb-4">¡Pago Exitoso!</h2>
          <p className="text-lg mb-4">Tu pago ha sido procesado correctamente.</p>
          
          {paymentId && (
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-sm"><strong>ID de Pago:</strong> {paymentId}</p>
              {status && <p className="text-sm"><strong>Estado:</strong> {status}</p>}
              {externalReference && <p className="text-sm"><strong>Referencia:</strong> {externalReference}</p>}
            </div>
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Recibirás un email de confirmación en breve.
          </p>

          <button
            onClick={() => router.push('/admin')}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
          >
            Volver al Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
