"use client";
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <FontAwesomeIcon icon={faCheckCircle} className="text-6xl text-green-500 mb-6" />
        
        <h1 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Tu pago ha sido procesado correctamente. Tu servicio de análisis de datos está confirmado.
        </p>
        
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-700 mb-2">Servicio Adquirido:</h3>
          <p className="text-sm text-gray-600"><strong>Análisis de Datos - ServiceDG</strong></p>
          <p className="text-sm text-gray-600"><strong>Monto:</strong> $50.000 ARS</p>
          {paymentId && <p className="text-sm text-gray-600"><strong>ID:</strong> {paymentId}</p>}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-700 mb-2">Próximos Pasos:</h3>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• ✅ Pago confirmado y procesado</li>
            <li>• 📧 Recibirás email de confirmación</li>
            <li>• � Te contactaremos en 24-48 horas</li>
            <li>• 📊 Entrega en 5-7 días hábiles</li>
          </ul>
        </div>
        
        <a
          href="/"
          className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          <FontAwesomeIcon icon={faHome} className="mr-2" />
          Ir al Inicio
        </a>
      </div>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
