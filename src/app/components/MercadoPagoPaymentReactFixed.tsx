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
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState('');
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('ServicioAnalisisDatos');
  const [showPayment, setShowPayment] = useState(false);
  const [isComponentReady, setIsComponentReady] = useState(false);

  // Asegurar que el componente se inicialice correctamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const createPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/mercadopago/create-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreferenceId(data.preferenceId);
        setShowPayment(true);
        setIsLoading(false);
      } else {
        setError(`Error al crear el pago: ${data.error || 'Error desconocido'}`);
        setIsLoading(false);
        console.error('API Error details:', data);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setError('Error de conexión al procesar el pago');
      setIsLoading(false);
    }
  };

  if (!isComponentReady) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPayment ? (
        // Formulario para ingresar monto
        <div className={`p-6 rounded-lg border-2 border-blue-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-blue-600 mb-2">ServicioAnalisisDatos</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Análisis completo de datos para tu negocio - ServiceDG
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Descripción del Servicio</label>
              <div className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                {description}
              </div>
              <p className="text-sm text-gray-500 mt-1">Servicio predefinido</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Monto a Pagar (ARS)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-2xl font-bold placeholder-gray-400 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                }`}
                placeholder="50000"
                min="1"
                step="1"
              />
              <p className="text-sm text-gray-500 mt-1">Ingresa el monto en pesos argentinos</p>
            </div>

            {error && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={createPayment}
              disabled={isLoading || !amount}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition duration-300 ${
                isLoading || !amount 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? 'Preparando Pago...' : 'Continuar con el Pago'}
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold mb-2">Preparando tu pago...</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos configurando Mercado Pago para procesar tu pago de forma segura
          </p>
        </div>
      ) : error ? (
        <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error al cargar el pago</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                setShowPayment(false);
                setError('');
                setPreferenceId('');
              }}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 mx-2"
            >
              Volver
            </button>
            <button
              onClick={() => window.open('/api/mercadopago/create-simple', '_blank')}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 mx-2"
            >
              Debug API
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Información del servicio */}
          <div className={`p-6 rounded-lg border-2 border-blue-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{description}</h3>
              <p className="text-3xl font-bold mb-2">${parseFloat(amount).toLocaleString('es-AR')} ARS</p>
              <p className="text-gray-600 dark:text-gray-400">
                Servicio profesional - ServiceDG
              </p>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setPreferenceId('');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                ← Cambiar monto o descripción
              </button>
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
