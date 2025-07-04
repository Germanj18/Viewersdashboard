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
    <div className={`flex flex-col min-h-screen transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-50 text-gray-900'
    }`}>
      <header className={`w-full flex justify-between items-center p-6 backdrop-blur-sm ${
        theme === 'dark' 
          ? 'bg-slate-900/80 border-b border-slate-700/50' 
          : 'bg-white/80 border-b border-gray-200/50 shadow-sm'
      }`}>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
            }`}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Volver
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Servicios - ServiceDG
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
            }`}
          >
            {theme === 'dark' ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`w-full max-w-6xl p-8 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800/60 border border-slate-700/50 shadow-2xl' 
            : 'bg-white/80 border border-gray-200/50 shadow-xl'
        }`}>
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Realizar Pago
            </h2>
            <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              ServiceDG - Análisis Profesional de Datos
            </p>
          </div>
          
          {!selectedMethod ? (
            <div className="space-y-6">
              <div className="text-center mb-10">
                <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Selecciona tu método de pago preferido
                </p>
              </div>

              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
                {/* Mercado Pago - ARS */}
                <div 
                  className={`group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-blue-500/30 hover:border-blue-400 hover:bg-slate-700/80 hover:shadow-xl hover:shadow-blue-500/10' 
                      : 'bg-white/90 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-500/10'
                  }`}
                  onClick={() => setSelectedMethod('mercadopago')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faUniversity} className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-blue-600">Mercado Pago</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Pago en pesos argentinos (ARS)
                    </p>
                    <div className={`p-4 rounded-xl mb-6 ${
                      theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
                    }`}>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        ✓ Checkout oficial de Mercado Pago
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        ✓ Todos los métodos de pago locales
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        ✓ Financiación disponible
                      </p>
                    </div>
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Pagar en ARS
                    </button>
                  </div>
                </div>

                {/* Stripe - USD */}
                <div 
                  className={`group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-indigo-500/30 hover:border-indigo-400 hover:bg-slate-700/80 hover:shadow-xl hover:shadow-indigo-500/10' 
                      : 'bg-white/90 border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-xl hover:shadow-indigo-500/10'
                  }`}
                  onClick={() => setSelectedMethod('stripe')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-indigo-600">Stripe</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Pago en dólares estadounidenses (USD)
                    </p>
                    <div className={`p-4 rounded-xl mb-6 ${
                      theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-50'
                    }`}>
                      <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">
                        ✓ Tarjetas de crédito/débito
                      </p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        ✓ Procesamiento internacional
                      </p>
                      <p className="text-sm text-indigo-600 dark:text-indigo-400">
                        ✓ Máxima seguridad
                      </p>
                    </div>
                    <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Pagar en USD
                    </button>
                  </div>
                </div>

                {/* Takenos - USD */}
                <div 
                  className={`group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-purple-500/30 hover:border-purple-400 hover:bg-slate-700/80 hover:shadow-xl hover:shadow-purple-500/10' 
                      : 'bg-white/90 border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-xl hover:shadow-purple-500/10'
                  }`}
                  onClick={() => setSelectedMethod('takenos')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faDollarSign} className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-purple-600">Takenos</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Pago en dólares con link personalizado
                    </p>
                    <div className={`p-4 rounded-xl mb-6 ${
                      theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'
                    }`}>
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                        ✓ Link de pago personalizado
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        ✓ Proceso asistido
                      </p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">
                        ✓ Soporte directo
                      </p>
                    </div>
                    <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Solicitar Link
                    </button>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className={`mt-12 p-6 rounded-2xl ${
                theme === 'dark' 
                  ? 'bg-slate-800/50 border border-slate-700/50' 
                  : 'bg-gray-50/80 border border-gray-200/50'
              }`}>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🔒</span>
                    </div>
                  </div>
                  <h4 className="font-bold text-lg mb-3 text-green-600">Pagos 100% Seguros</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                    Todos nuestros métodos de pago utilizan encriptación de nivel bancario y protección contra fraude.
                    Tus datos financieros están completamente protegidos.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Botón para volver mejorado */}
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => setSelectedMethod(null)}
                  className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Cambiar método de pago
                </button>
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedMethod === 'mercadopago' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                    selectedMethod === 'stripe' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' :
                    'bg-gradient-to-br from-purple-500 to-purple-600'
                  }`}>
                    {selectedMethod === 'mercadopago' ? (
                      <FontAwesomeIcon icon={faUniversity} className="text-white text-lg" />
                    ) : selectedMethod === 'stripe' ? (
                      <FontAwesomeIcon icon={faCreditCard} className="text-white text-lg" />
                    ) : (
                      <FontAwesomeIcon icon={faDollarSign} className="text-white text-lg" />
                    )}
                  </div>
                  <div>
                    <span className={`font-bold text-lg ${
                      selectedMethod === 'mercadopago' ? 'text-blue-600' :
                      selectedMethod === 'stripe' ? 'text-indigo-600' :
                      'text-purple-600'
                    }`}>
                      {selectedMethod === 'mercadopago' ? 'Mercado Pago' :
                       selectedMethod === 'stripe' ? 'Stripe' : 'Takenos'}
                    </span>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {selectedMethod === 'mercadopago' ? 'Pago en ARS' :
                       selectedMethod === 'stripe' ? 'Pago en USD' : 'Link personalizado'}
                    </p>
                  </div>
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
