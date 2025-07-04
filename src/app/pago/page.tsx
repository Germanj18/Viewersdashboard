"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faArrowLeft, faCreditCard, faUniversity, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import MercadoPagoPaymentReactFixed from '../components/MercadoPagoPaymentReactFixed';
import StripePayment from '../components/StripePayment';
import TakenosPayment from '../components/TakenosPayment';

type PaymentMethod = 'mercadopago' | 'stripe' | 'takenos' | null;

export default function PagoPage() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

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
          <h1 className="text-2xl font-bold">Servicios - ServiceDG</h1>
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
        <div className={`w-full max-w-4xl p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-3xl font-bold text-center mb-8">Realizar Pago - ServiceDG</h2>
          
          {!selectedMethod ? (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Selecciona tu método de pago preferido
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Mercado Pago - ARS */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-blue-500 hover:border-blue-400' 
                      : 'bg-blue-50 border-blue-300 hover:border-blue-500'
                  }`}
                  onClick={() => setSelectedMethod('mercadopago')}
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faUniversity} className="text-4xl text-blue-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Mercado Pago</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pago en pesos argentinos (ARS)
                    </p>
                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        ✓ Checkout oficial de Mercado Pago
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        ✓ Todos los métodos de pago locales
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        ✓ Financiación disponible
                      </p>
                    </div>
                    <button className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition duration-300">
                      Pagar en ARS
                    </button>
                  </div>
                </div>

                {/* Stripe - USD */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-indigo-500 hover:border-indigo-400' 
                      : 'bg-indigo-50 border-indigo-300 hover:border-indigo-500'
                  }`}
                  onClick={() => setSelectedMethod('stripe')}
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faCreditCard} className="text-4xl text-indigo-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Stripe</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pago en dólares estadounidenses (USD)
                    </p>
                    <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                        ✓ Tarjetas de crédito/débito
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        ✓ Procesamiento internacional
                      </p>
                      <p className="text-sm text-indigo-700 dark:text-indigo-300">
                        ✓ Máxima seguridad
                      </p>
                    </div>
                    <button className="w-full bg-indigo-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-600 transition duration-300">
                      Pagar en USD
                    </button>
                  </div>
                </div>

                {/* Takenos - USD */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-purple-500 hover:border-purple-400' 
                      : 'bg-purple-50 border-purple-300 hover:border-purple-500'
                  }`}
                  onClick={() => setSelectedMethod('takenos')}
                >
                  <div className="text-center">
                    <FontAwesomeIcon icon={faDollarSign} className="text-4xl text-purple-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Takenos</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Pago en dólares con link personalizado
                    </p>
                    <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mb-4">
                      <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                        ✓ Link de pago personalizado
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        ✓ Proceso asistido
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        ✓ Soporte directo
                      </p>
                    </div>
                    <button className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-600 transition duration-300">
                      Solicitar Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className={`mt-8 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <div className="text-center">
                  <h4 className="font-semibold mb-2">🔒 Pagos 100% Seguros</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ambos métodos utilizan encriptación de nivel bancario y protección contra fraude.
                    Tus datos financieros están completamente protegidos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Botón para volver */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                >
                  ← Cambiar método de pago
                </button>
                <div className="flex items-center space-x-2">
                  {selectedMethod === 'mercadopago' ? (
                    <>
                      <FontAwesomeIcon icon={faUniversity} className="text-blue-500" />
                      <span className="font-semibold">Mercado Pago (ARS)</span>
                    </>
                  ) : selectedMethod === 'stripe' ? (
                    <>
                      <FontAwesomeIcon icon={faCreditCard} className="text-indigo-500" />
                      <span className="font-semibold">Stripe (USD)</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faDollarSign} className="text-purple-500" />
                      <span className="font-semibold">Takenos (USD)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Componente de pago correspondiente */}
              {selectedMethod === 'mercadopago' ? (
                <MercadoPagoPaymentReactFixed />
              ) : selectedMethod === 'stripe' ? (
                <StripePayment />
              ) : (
                <TakenosPayment />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
