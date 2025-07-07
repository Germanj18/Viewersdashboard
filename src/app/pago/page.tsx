"use client";
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../ThemeContext';
import Preloader from '../components/Preloader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faArrowLeft, faCreditCard, faUniversity, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import MercadoPagoPaymentReactFixed from '../components/MercadoPagoPaymentReactFixed';
import StripePayment from '../components/StripePayment';
import PayoneerPayment from '../components/PayoneerPayment';

type PaymentMethod = 'mercadopago' | 'stripe' | 'payoneer' | null;

export default function PagoPage() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Pre-cargar estilos cuando se monta el componente
  useEffect(() => {
    // Forzar la carga de todos los CSS modules y aplicar estilos inline críticos
    if (typeof window !== 'undefined') {
      // Crear estilos críticos para prevenir layout shifts
      const style = document.createElement('style');
      style.textContent = `
        .payment-component-wrapper * {
          box-sizing: border-box !important;
        }
        .payment-component-wrapper input,
        .payment-component-wrapper textarea,
        .payment-component-wrapper select {
          width: 100% !important;
          display: block !important;
          min-height: 48px !important;
          padding: 12px 16px !important;
          box-sizing: border-box !important;
          font-size: 16px !important;
          border-radius: 8px !important;
          border: 2px solid #d1d5db !important;
          background-color: white !important;
        }
        .payment-component-wrapper h1,
        .payment-component-wrapper h2,
        .payment-component-wrapper h3,
        .payment-component-wrapper h4 {
          text-align: center !important;
          width: 100% !important;
          display: block !important;
          margin-bottom: 16px !important;
          font-weight: bold !important;
          line-height: 1.2 !important;
        }
        .payment-component-wrapper h3 {
          font-size: 1.875rem !important;
          line-height: 2.25rem !important;
        }
        .payment-component-wrapper label {
          display: block !important;
          width: 100% !important;
          margin-bottom: 8px !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
          text-align: left !important;
          min-height: 20px !important;
        }
        /* Estilos específicos y forzados para labels con iconos */
        .payment-component-wrapper .label-with-icon {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: left !important;
          vertical-align: middle !important;
          height: auto !important;
          min-height: 24px !important;
          max-height: 40px !important;
        }
        .payment-component-wrapper .label-with-icon > * {
          align-self: center !important;
        }
        .payment-component-wrapper .label-with-icon .w-5,
        .payment-component-wrapper .label-with-icon > div:first-child {
          flex-shrink: 0 !important;
          margin-right: 12px !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        /* Evitar que otros estilos interfieran con labels con iconos */
        .payment-component-wrapper label.label-with-icon.flex {
          display: flex !important;
        }
        .payment-component-wrapper label[class*="label-with-icon"] {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: flex-start !important;
        }
        /* Forzar estilos para iconos dentro de labels */
        .payment-component-wrapper .label-with-icon svg,
        .payment-component-wrapper .label-with-icon .fa {
          margin-right: 12px !important;
          width: 16px !important;
          height: 16px !important;
          flex-shrink: 0 !important;
          display: inline-block !important;
          vertical-align: middle !important;
        }
        /* Resetear cualquier estilo que pueda estar causando problemas */
        .payment-component-wrapper .label-with-icon * {
          vertical-align: middle !important;
        }
        /* Prevenir text-align center en labels con iconos */
        .payment-component-wrapper .text-center .label-with-icon {
          text-align: left !important;
        }
        .payment-component-wrapper label .fa,
        .payment-component-wrapper label svg {
          margin-right: 8px !important;
          width: 16px !important;
          height: 16px !important;
          flex-shrink: 0 !important;
        }
        .payment-component-wrapper button {
          min-height: 48px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          padding: 12px 24px !important;
          font-size: 16px !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }
        .payment-component-wrapper .space-y-6 > * + * {
          margin-top: 1.5rem !important;
        }
        .payment-component-wrapper .space-y-4 > * + * {
          margin-top: 1rem !important;
        }
        .payment-component-wrapper .space-y-8 > * + * {
          margin-top: 2rem !important;
        }
        .payment-component-wrapper .text-center {
          text-align: center !important;
        }
        .payment-component-wrapper .flex {
          display: flex !important;
        }
        .payment-component-wrapper .items-center {
          align-items: center !important;
        }
        .payment-component-wrapper .justify-center {
          justify-content: center !important;
        }
        .payment-component-wrapper .w-full {
          width: 100% !important;
        }
        .payment-component-wrapper .block {
          display: block !important;
        }
        /* Proteger el grid de métodos de pago */
        .payment-methods-grid {
          display: grid !important;
        }
        .payment-methods-grid.lg\\:grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
        .payment-methods-grid.md\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
        @media (max-width: 1023px) {
          .payment-methods-grid.lg\\:grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 767px) {
          .payment-methods-grid.lg\\:grid-cols-3,
          .payment-methods-grid.md\\:grid-cols-2 {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
        }
        .payment-component-wrapper .w-20 {
          width: 5rem !important;
          height: 5rem !important;
          flex-shrink: 0 !important;
        }
        .payment-component-wrapper .h-20 {
          height: 5rem !important;
        }
        .payment-component-wrapper .w-5 {
          width: 1.25rem !important;
          height: 1.25rem !important;
          flex-shrink: 0 !important;
        }
        .payment-component-wrapper .h-5 {
          height: 1.25rem !important;
        }
        .payment-component-wrapper .mr-3 {
          margin-right: 0.75rem !important;
        }
        .payment-component-wrapper .mb-3 {
          margin-bottom: 0.75rem !important;
        }
        .payment-component-wrapper .mb-6 {
          margin-bottom: 1.5rem !important;
        }
        .payment-component-wrapper .mx-auto {
          margin-left: auto !important;
          margin-right: auto !important;
        }
        /* Forzar que los contenedores mantengan su estructura */
        .payment-component-wrapper > div {
          width: 100% !important;
          display: block !important;
        }
        /* Prevenir layout shifts con FontAwesome */
        .payment-component-wrapper .fa,
        .payment-component-wrapper svg {
          display: inline-block !important;
          vertical-align: middle !important;
        }
        /* Asegurar que los gradientes de fondo se rendericen correctamente */
        .payment-component-wrapper .bg-gradient-to-br {
          background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)) !important;
        }
        /* Forzar layout para elementos específicos de Stripe */
        .payment-component-wrapper .StripeElement {
          width: 100% !important;
          display: block !important;
          min-height: 48px !important;
          padding: 12px 16px !important;
          border-radius: 8px !important;
          border: 2px solid #d1d5db !important;
          background-color: white !important;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        if (document.head.contains(style)) {
          document.head.removeChild(style);
        }
      };
    }
  }, []);

  const handleMethodSelect = (method: PaymentMethod) => {
    setIsTransitioning(true);
    // Pequeño delay para suavizar la transición y asegurar layout correcto
    setTimeout(() => {
      setSelectedMethod(method);
      setIsTransitioning(false);
      
      // Forzar re-layout después de la transición SOLO si hay un método seleccionado
      if (method) {
        setTimeout(() => {
          const paymentWrapper = document.querySelector('.payment-component-wrapper') as HTMLElement;
          if (paymentWrapper) {
            // Forzar recalculo de layout
            paymentWrapper.style.display = 'none';
            paymentWrapper.offsetHeight; // Trigger reflow
            paymentWrapper.style.display = 'block';
            
            // Aplicar estilos forzados a elementos específicos del formulario
            const inputs = paymentWrapper.querySelectorAll('input, textarea, select');
            inputs.forEach((input) => {
              const inputElement = input as HTMLElement;
              inputElement.style.width = '100%';
              inputElement.style.display = 'block';
              inputElement.style.minHeight = '48px';
              inputElement.style.padding = '12px 16px';
              inputElement.style.boxSizing = 'border-box';
            });
            
            const titles = paymentWrapper.querySelectorAll('h1, h2, h3, h4');
            titles.forEach((title) => {
              const titleElement = title as HTMLElement;
              titleElement.style.textAlign = 'center';
              titleElement.style.width = '100%';
              titleElement.style.display = 'block';
            });
            
            // Manejar labels específicamente con mayor agresividad
            const labels = paymentWrapper.querySelectorAll('label');
            labels.forEach((label) => {
              const labelElement = label as HTMLElement;
              const hasIconClass = labelElement.classList.contains('label-with-icon');
              
              if (hasIconClass) {
                // Labels con iconos - forzar layout con cssText para máxima prioridad
                labelElement.style.cssText = `
                  display: flex !important;
                  flex-direction: row !important;
                  align-items: center !important;
                  justify-content: flex-start !important;
                  text-align: left !important;
                  width: 100% !important;
                  margin-bottom: 8px !important;
                  height: auto !important;
                  min-height: 24px !important;
                  max-height: 40px !important;
                `;
                
                // Buscar iconos tanto en divs como FontAwesome directos
                const iconContainer = labelElement.querySelector('.w-5') || labelElement.querySelector('svg') || labelElement.querySelector('.fa');
                if (iconContainer) {
                  const iconElement = iconContainer as HTMLElement;
                  if (iconElement.tagName === 'svg' || iconElement.classList.contains('fa')) {
                    // Es un icono directo
                    iconElement.style.cssText = `
                      margin-right: 12px !important;
                      width: 16px !important;
                      height: 16px !important;
                      flex-shrink: 0 !important;
                      display: inline-block !important;
                      vertical-align: middle !important;
                    `;
                  } else {
                    // Es un contenedor de icono
                    iconElement.style.cssText = `
                      flex-shrink: 0 !important;
                      margin-right: 12px !important;
                      width: 20px !important;
                      height: 20px !important;
                      display: flex !important;
                      align-items: center !important;
                      justify-content: center !important;
                    `;
                  }
                }
              } else {
                // Labels normales
                labelElement.style.display = 'block';
                labelElement.style.textAlign = 'left';
                labelElement.style.width = '100%';
                labelElement.style.marginBottom = '8px';
              }
            });
          }
        }, 100);
      } else {
        // Cuando se regresa al grid, restablecer el grid layout
        setTimeout(() => {
          const grid = document.querySelector('.payment-methods-grid') as HTMLElement;
          if (grid) {
            grid.style.display = 'grid';
            // Forzar recalculo del grid
            grid.offsetHeight;
          }
        }, 50);
      }
    }, 150);
  };

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
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
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
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600 bg-clip-text text-transparent">
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

              <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 payment-methods-grid">
                {/* Mercado Pago - ARS */}
                <div 
                  className={`group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-blue-500/30 hover:border-blue-400 hover:bg-slate-700/80 hover:shadow-xl hover:shadow-blue-500/10' 
                      : 'bg-white/90 border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-xl hover:shadow-blue-500/10'
                  }`}
                  onClick={() => handleMethodSelect('mercadopago')}
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
                  onClick={() => handleMethodSelect('stripe')}
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

                {/* Payoneer - USD */}
                <div 
                  className={`group p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    theme === 'dark' 
                      ? 'bg-slate-800/80 border-emerald-500/30 hover:border-emerald-400 hover:bg-slate-700/80 hover:shadow-xl hover:shadow-emerald-500/10' 
                      : 'bg-white/90 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-xl hover:shadow-emerald-500/10'
                  }`}
                  onClick={() => handleMethodSelect('payoneer')}
                >
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <FontAwesomeIcon icon={faDollarSign} className="text-3xl text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-emerald-600">Payoneer</h3>
                    <p className={`mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      Pago en dólares con link personalizado - Acepta tarjetas argentinas
                    </p>
                    <div className={`p-4 rounded-xl mb-6 ${
                      theme === 'dark' ? 'bg-emerald-900/30' : 'bg-emerald-50'
                    }`}>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-2">
                        ✓ Acepta tarjetas argentinas
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        ✓ Proceso asistido
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        ✓ Soporte directo
                      </p>
                    </div>
                    <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                      Solicitar Link Payoneer
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
                    'bg-gradient-to-br from-emerald-500 to-emerald-600'
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
                      'text-emerald-600'
                    }`}>
                      {selectedMethod === 'mercadopago' ? 'Mercado Pago' :
                       selectedMethod === 'stripe' ? 'Stripe' : 'Payoneer'}
                    </span>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                      {selectedMethod === 'mercadopago' ? 'Pago en ARS' :
                       selectedMethod === 'stripe' ? 'Pago en USD' : 'Link personalizado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Componente de pago correspondiente */}
              {isTransitioning ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <div className="payment-component-wrapper payment-method-container">
                  {selectedMethod === 'mercadopago' ? (
                    <div style={{ width: '100%', display: 'block' }}>
                      <MercadoPagoPaymentReactFixed key="mercadopago" />
                    </div>
                  ) : selectedMethod === 'stripe' ? (
                    <div style={{ width: '100%', display: 'block' }}>
                      <StripePayment key="stripe" />
                    </div>
                  ) : selectedMethod === 'payoneer' ? (
                    <div style={{ width: '100%', display: 'block' }}>
                      <PayoneerPayment key="payoneer" />
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
