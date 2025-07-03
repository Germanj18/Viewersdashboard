"use client";
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago con tu public key
if (typeof window !== 'undefined') {
  initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '');
}

export default function MercadoPagoPaymentReact() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('ServicioAnalisisDatos');
  const [isLoading, setIsLoading] = useState(false);
  const [preferenceId, setPreferenceId] = useState('');
  const [showWallet, setShowWallet] = useState(false);

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/mercadopago/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPreferenceId(data.preferenceId);
        setShowWallet(true);
      } else {
        alert('Error al crear el pago: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el pago');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showWallet ? (
        <>
          <div>
            <label htmlFor="amount" className="block text-lg font-medium mb-2">
              Monto (ARS $)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ingresa el monto"
              className={`w-full p-3 border rounded-lg text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="1"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-medium mb-2">
              Descripción del servicio
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción del servicio"
              className={`w-full p-3 border rounded-lg text-lg ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-black'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              rows={3}
            />
          </div>

          <button
            onClick={handleCreatePayment}
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg text-white text-lg font-semibold transition duration-300 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Creando pago...' : 'Procesar Pago'}
          </button>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="font-semibold mb-2">🚀 Checkout API - Nueva experiencia:</h3>
            <ul className="text-sm space-y-1">
              <li>• ✅ Pago directo en tu página (sin redirecciones)</li>
              <li>• ✅ Todos los métodos de pago disponibles</li>
              <li>• ✅ Cuotas sin interés disponibles</li>
              <li>• ✅ Optimizado para móviles</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Procesar Pago</h3>
            <button
              onClick={() => {
                setShowWallet(false);
                setPreferenceId('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Volver
            </button>
          </div>
          
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p><strong>Monto:</strong> ${amount} ARS</p>
            <p><strong>Descripción:</strong> {description}</p>
          </div>

          {/* Wallet de Mercado Pago usando SDK React */}
          <div className="wallet-container">
            <Wallet 
              initialization={{ preferenceId: preferenceId }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
