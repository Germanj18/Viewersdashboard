"use client";
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCoins, 
  faLock, 
  faShieldAlt, 
  faCheck,
  faExclamationTriangle,
  faSpinner,
  faQrcode,
  faExternalLinkAlt
} from '@fortawesome/free-solid-svg-icons';

export default function BinancePayment() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Servicio de Análisis de Datos');
  const [currency, setCurrency] = useState('USD');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);

  const createOrder = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/binance/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          currency
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPaymentData(data);
        setShowPayment(true);
        setIsLoading(false);
      } else {
        setError(data.error || 'Error al crear la orden');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al procesar el pago');
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentData?.checkoutUrl) {
      window.open(paymentData.checkoutUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {!showPayment ? (
        // Formulario para crear orden
        <div className={`p-6 rounded-lg border-2 border-yellow-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}`}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-600 text-2xl" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-yellow-600 mb-2">Pago con Binance Pay</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Paga con tarjeta de crédito/débito o criptomonedas
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Descripción del Servicio</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                }`}
                placeholder="Servicio de Análisis de Datos"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monto</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-xl font-bold placeholder-gray-400 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                  }`}
                  placeholder="100"
                  min="1"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Moneda</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
                  }`}
                >
                  <option value="USD">USD - Dólares</option>
                  <option value="EUR">EUR - Euros</option>
                  <option value="BTC">BTC - Bitcoin</option>
                  <option value="USDT">USDT - Tether</option>
                  <option value="BUSD">BUSD - Binance USD</option>
                </select>
              </div>
            </div>

            {error && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={createOrder}
              disabled={isLoading || !amount}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition duration-300 ${
                isLoading || !amount 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              {isLoading ? 'Creando Orden...' : 'Continuar con Binance Pay'}
            </button>
          </div>
        </div>
      ) : (
        // Mostrar opciones de pago
        <>
          {/* Información del pago */}
          <div className={`p-6 rounded-lg border-2 border-yellow-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-50'}`}>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-600 mb-2">{description}</h3>
              <p className="text-3xl font-bold mb-2">{amount} {currency}</p>
              <p className="text-gray-600 dark:text-gray-400">
                Orden: {paymentData?.merchantTradeNo}
              </p>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setPaymentData(null);
                }}
                className="mt-4 text-yellow-600 hover:text-yellow-800 text-sm font-medium"
              >
                ← Cambiar monto o moneda
              </button>
            </div>
          </div>

          {/* Opciones de pago */}
          <div className="space-y-4">
            {/* Pago directo */}
            <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h4 className="text-lg font-semibold mb-4 flex items-center">
                <FontAwesomeIcon icon={faCoins} className="text-yellow-600 mr-2" />
                Pago Directo
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Serás redirigido a Binance Pay para completar el pago con tarjeta o criptomonedas
              </p>
              <button
                onClick={handlePayment}
                className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition duration-300 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-2" />
                Pagar con Binance Pay
              </button>
            </div>

            {/* Código QR */}
            {paymentData?.qrCodeUrl && (
              <div className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FontAwesomeIcon icon={faQrcode} className="text-yellow-600 mr-2" />
                  Código QR
                </h4>
                <div className="text-center">
                  <img 
                    src={paymentData.qrCodeUrl} 
                    alt="QR Code" 
                    className="mx-auto mb-4 w-48 h-48 border rounded-lg"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Escanea con la app de Binance para pagar
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Información de seguridad */}
          <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-yellow-500 mr-2">🔒</span>
              <span className="font-semibold">Pago 100% seguro con Binance Pay</span>
            </div>
            <div className="text-sm text-center space-y-1">
              <p>• Acepta tarjetas de crédito/débito y criptomonedas</p>
              <p>• Conversión automática a USDT</p>
              <p>• Protección avanzada contra fraudes</p>
              <p>• Procesamiento instantáneo</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
