"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMobileAlt, 
  faEnvelope, 
  faCheck,
  faSpinner,
  faCommentDots,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';

export default function PayoneerPayment() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isComponentReady, setIsComponentReady] = useState(false);
  
  // Datos del formulario
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Servicio de Análisis de Datos');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Asegurar que el componente se inicialice correctamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComponentReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Aplicar estilos forzados a todos los inputs después del renderizado
  useEffect(() => {
    if (isComponentReady) {
      const inputs = document.querySelectorAll('.payoneer-form input, .payoneer-form textarea, .payoneer-form select');
      inputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        inputElement.style.width = '100%';
        inputElement.style.display = 'block';
        inputElement.style.padding = '12px 16px';
        inputElement.style.borderRadius = '8px';
        inputElement.style.fontSize = '16px';
        inputElement.style.minHeight = '48px';
        inputElement.style.boxSizing = 'border-box';
      });

      const titles = document.querySelectorAll('.payoneer-form h1, .payoneer-form h2, .payoneer-form h3, .payoneer-form h4');
      titles.forEach((title) => {
        const titleElement = title as HTMLElement;
        titleElement.style.textAlign = 'center';
        titleElement.style.width = '100%';
        titleElement.style.display = 'block';
      });
    }
  }, [isComponentReady]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!amount || parseFloat(amount) <= 0) {
      setError('Por favor ingresa un monto válido');
      return;
    }
    
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    if (!whatsapp || whatsapp.length < 10) {
      setError('Por favor ingresa un número de WhatsApp válido');
      return;
    }
    
    if (!customerName.trim()) {
      setError('Por favor ingresa tu nombre completo');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payoneer/request-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          email,
          whatsapp,
          customerName,
          timestamp: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setIsLoading(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Error al procesar la solicitud');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión al procesar la solicitud');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setAmount('');
    setEmail('');
    setWhatsapp('');
    setCustomerName('');
    setError('');
  };

  if (!isComponentReady) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-8">
        {/* Mensaje de confirmación */}
        <div className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
          theme === 'dark' 
            ? 'bg-slate-800/60 border-green-500/30 backdrop-blur-sm' 
            : 'bg-white/90 border-green-300 shadow-xl'
        }`}>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FontAwesomeIcon icon={faCheck} className="text-white text-3xl" />
            </div>
            <h3 className="text-3xl font-bold text-green-600 mb-4">¡Solicitud Enviada!</h3>
            <p className={`text-lg mb-8 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
              Tu solicitud de pago ha sido enviada correctamente
            </p>
            
            {/* Resumen de la solicitud */}
            <div className={`p-6 rounded-2xl mb-8 ${
              theme === 'dark' 
                ? 'bg-slate-700/50 border border-slate-600/50' 
                : 'bg-gray-50/80 border border-gray-200/50'
            }`}>
              <h4 className="font-bold text-lg mb-4">Resumen de tu solicitud:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <strong>Nombre:</strong> <span>{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Monto:</strong> <span className="text-green-600 font-bold">${parseFloat(amount).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <strong>Servicio:</strong> <span>{description}</span>
                </div>
                <div className="flex justify-between">
                  <strong>Email:</strong> <span>{email}</span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <strong>WhatsApp:</strong> <span>+{whatsapp}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faEnvelope} className="text-white text-xl" />
                </div>
                <p className="text-blue-700 dark:text-blue-300 font-semibold mb-2">
                  📧 Te enviaremos el link de pago a tu email
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-sm">
                  Revisa tu bandeja de entrada y spam
                </p>
              </div>

              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-green-900/30 border border-green-800/50' : 'bg-green-50 border border-green-200'
              }`}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCommentDots} className="text-white text-xl" />
                </div>
                <p className="text-green-700 dark:text-green-300 font-semibold mb-2">
                  📱 También te contactaremos por WhatsApp
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm">
                  Tiempo estimado: 15-30 minutos
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className={`px-8 py-3 rounded-xl font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
              }`}
            >
              Hacer otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 payoneer-form" style={{ width: '100%', display: 'block' }}>
      {/* Header */}
      <div className={`p-8 rounded-2xl border-2 transition-all duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-800/60 border-emerald-500/30 backdrop-blur-sm' 
          : 'bg-white/90 border-emerald-300 shadow-xl'
      }`} style={{ width: '100%', display: 'block' }}>
        <div className="text-center mb-8" style={{ textAlign: 'center', width: '100%' }}>
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6" style={{ width: '5rem', height: '5rem', margin: '0 auto 1.5rem auto' }}>
            <FontAwesomeIcon icon={faDollarSign} className="text-white text-3xl" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-600 mb-4" style={{ textAlign: 'center', width: '100%', display: 'block', fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Pago con Payoneer</h3>
          <p className={`text-lg ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`} style={{ textAlign: 'center', width: '100%' }}>
            Te enviaremos un link personalizado para pagar en dólares con Payoneer
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6" style={{ width: '100%', display: 'block' }}>
          {/* Nombre completo */}
          <div style={{ width: '100%', display: 'block' }}>
            <label className={`block text-sm font-semibold mb-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`} style={{ display: 'block', width: '100%', marginBottom: '0.75rem', fontWeight: '600' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:bg-white shadow-sm'
              }`}
              style={{ 
                width: '100%', 
                display: 'block', 
                padding: '12px 16px', 
                borderRadius: '8px', 
                border: '2px solid #d1d5db', 
                fontSize: '16px',
                minHeight: '48px',
                boxSizing: 'border-box'
              }}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Email */}
          <div style={{ width: '100%', display: 'block' }}>
            <label className={`block text-sm font-semibold mb-3 flex items-center ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`} style={{ display: 'block', width: '100%', marginBottom: '0.75rem', fontWeight: '600' }}>
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-white text-xs" />
              </div>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:bg-white shadow-sm'
              }`}
              placeholder="tu@email.com"
              required
            />
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Te enviaremos el link de pago aquí
            </p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className={`block text-sm font-semibold mb-3 flex items-center ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`}>
              <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3">
                <FontAwesomeIcon icon={faCommentDots} className="text-white text-xs" />
              </div>
              Número de WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
              className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:bg-white shadow-sm'
              }`}
              placeholder="5491123456789 (sin +)"
              required
            />
            <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              También te contactaremos por WhatsApp
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Servicio
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:bg-white shadow-sm'
              }`}
              placeholder="Servicio de Análisis de Datos"
            />
          </div>

          {/* Monto */}
          <div>
            <label className={`block text-sm font-semibold mb-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-700'
            }`}>
              Monto en USD
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-6 rounded-xl border-2 text-3xl font-bold text-center transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-slate-700/50 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:bg-slate-700' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-emerald-500 focus:bg-white shadow-sm'
              }`}
              placeholder="100.00"
              min="1"
              step="0.01"
              required
            />
            <p className={`text-sm mt-2 text-center ${theme === 'dark' ? 'text-slate-500' : 'text-gray-500'}`}>
              Monto en dólares estadounidenses
            </p>
          </div>

          {error && (
            <div className={`p-4 rounded-xl text-center ${
              theme === 'dark' ? 'bg-red-900/50 border border-red-800/50' : 'bg-red-50 border border-red-200'
            }`}>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-5 px-6 rounded-xl font-bold text-lg text-white transition-all duration-300 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:scale-105'
            }`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-3" />
                Enviando solicitud...
              </>
            ) : (
              'Solicitar Link de Pago'
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className={`mt-8 p-6 rounded-2xl ${
          theme === 'dark' 
            ? 'bg-slate-700/50 border border-slate-600/50' 
            : 'bg-gray-50/80 border border-gray-200/50'
        }`}>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-lg">📋</span>
            </div>
            <h4 className="font-bold text-lg">¿Cómo funciona?</h4>
          </div>
          <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
              <span>Completas este formulario con tus datos</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
              <span>Te enviamos un link personalizado de Payoneer</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
              <span>Pagas con cualquier tarjeta en dólares (incluye tarjetas argentinas)</span>
            </div>
            <div className="flex items-center">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</span>
              <span>Confirmamos tu pago automáticamente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
