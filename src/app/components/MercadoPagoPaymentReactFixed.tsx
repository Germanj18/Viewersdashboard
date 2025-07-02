"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago con tu public key
if (typeof window !== 'undefined') {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '');
}

export default function MercadoPagoPaymentReact() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [preferenceId, setPreferenceId] = useState('');
  const [error, setError] = useState('');

  // Configuración fija del servicio
  const FIXED_AMOUNT = 50000;
  const FIXED_DESCRIPTION = 'ServicioAnalisisDatos';

  useEffect(() => {
    createPaymentAutomatically();
  }, []);

  const createPaymentAutomatically = async () => {
    try {
      const response = await fetch('/api/mercadopago/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: FIXED_AMOUNT,
          description: FIXED_DESCRIPTION,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreferenceId(data.preferenceId);
        setIsLoading(false);
      } else {
        setError('Error al crear el pago: ' + data.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al procesar el pago');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Preparando tu pago...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos configurando Mercado Pago para procesar tu pago de forma segura
          </p>
        </div>
      ) : error ? (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {/* Información del servicio */}
          <div className={`p-6 rounded-lg border-2 border-blue-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">ServicioAnalisisDatos</h3>
              <p className="text-3xl font-bold mb-2">$50.000 ARS</p>
              <p className="text-gray-600 dark:text-gray-400">
                Análisis completo de datos y métricas para tu negocio
              </p>
            </div>
          </div>

          {/* Wallet de Mercado Pago - Interfaz oficial */}
          <div className="wallet-container bg-white rounded-lg shadow-lg">
            {preferenceId && (
              <Wallet 
                initialization={{ preferenceId: preferenceId }}
              />
            )}
          </div>

          {/* Información de seguridad */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-green-500 mr-2">🔒</span>
              <span className="font-semibold">Pago 100% seguro con Mercado Pago</span>
            </div>
            <div className="text-sm text-center space-y-1">
              <p>• Todos los métodos de pago disponibles</p>
              <p>• Hasta 12 cuotas sin interés</p>
              <p>• Protección al comprador</p>
              <p>• Datos encriptados SSL</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
