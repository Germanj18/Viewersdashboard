"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';

// Declarar tipos para el SDK
declare global {
  interface Window {
    MercadoPago: any;
  }
}

export default function MercadoPagoPayment() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Servicio de Métricas LaCasa');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [mp, setMp] = useState<any>(null);
  const [checkout, setCheckout] = useState<any>(null);

  // Cargar SDK de Mercado Pago
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      // Inicializar MercadoPago con tu public key
      const mercadopago = new window.MercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY);
      setMp(mercadopago);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleCreatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (!mp) {
      alert('Mercado Pago no está cargado. Intenta nuevamente.');
      return;
    }

    setIsLoading(true);

    try {
      // Crear orden en tu backend
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
        // Crear checkout con la orden
        const checkoutInstance = mp.checkout({
          preference: {
            id: data.preferenceId
          },
          render: {
            container: '.mercadopago-checkout', // Contenedor donde se renderiza
            label: 'Pagar', // Texto del botón
          }
        });

        setCheckout(checkoutInstance);
        setShowCheckout(true);
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
      {!showCheckout ? (
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
            disabled={isLoading || !mp}
            className={`w-full py-3 px-6 rounded-lg text-white text-lg font-semibold transition duration-300 ${
              isLoading || !mp
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isLoading ? 'Creando pago...' : !mp ? 'Cargando Mercado Pago...' : 'Procesar Pago'}
          </button>

          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <h3 className="font-semibold mb-2">💳 Métodos de pago disponibles:</h3>
            <ul className="text-sm space-y-1">
              <li>• Tarjetas de crédito y débito</li>
              <li>• Mercado Pago</li>
              <li>• Rapipago, Pago Fácil</li>
              <li>• Transferencia bancaria</li>
            </ul>
            <p className="text-xs mt-2 text-gray-500">
              El pago se procesará directamente en esta página sin redirecciones
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Procesar Pago</h3>
            <button
              onClick={() => {
                setShowCheckout(false);
                if (checkout) {
                  checkout.unmount();
                }
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

          {/* Contenedor donde se renderiza el checkout de Mercado Pago */}
          <div className="mercadopago-checkout"></div>
        </div>
      )}

      {paymentUrl && (
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-800' : 'bg-green-100'}`}>
          <p className="text-center">
            ✅ Pago creado exitosamente. Se abrió una nueva ventana para procesar el pago.
          </p>
          <p className="text-center mt-2">
            <a 
              href={paymentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Hacer clic aquí si la ventana no se abrió automáticamente
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
