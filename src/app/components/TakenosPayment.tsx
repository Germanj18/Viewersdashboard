"use client";
import { useState } from 'react';
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

export default function TakenosPayment() {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Datos del formulario
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Servicio de Análisis de Datos');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [customerName, setCustomerName] = useState('');

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
      const response = await fetch('/api/takenos/request-payment', {
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

  if (success) {
    return (
      <div className="space-y-6">
        {/* Mensaje de confirmación */}
        <div className={`p-8 rounded-lg border-2 border-green-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-green-50'}`}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCheck} className="text-green-600 text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mb-4">¡Solicitud Enviada!</h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              Tu solicitud de pago ha sido enviada correctamente
            </p>
            
            {/* Resumen de la solicitud */}
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} mb-6`}>
              <h4 className="font-semibold mb-3">Resumen de tu solicitud:</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {customerName}</p>
                <p><strong>Monto:</strong> ${parseFloat(amount).toFixed(2)} USD</p>
                <p><strong>Servicio:</strong> {description}</p>
                <p><strong>Email:</strong> {email}</p>
                <p><strong>WhatsApp:</strong> +{whatsapp}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-2">
                  📧 Te enviaremos el link de pago a tu email
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Revisa tu bandeja de entrada y spam
                </p>
              </div>

              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-green-900' : 'bg-green-100'}`}>
                <p className="text-green-800 dark:text-green-200 font-medium mb-2">
                  📱 También te contactaremos por WhatsApp
                </p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Tiempo estimado: 15-30 minutos
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="mt-6 bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-300"
            >
              Hacer otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg border-2 border-purple-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-purple-50'}`}>
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faDollarSign} className="text-purple-600 text-2xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-purple-600 mb-2">Pago con Takenos</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Te enviaremos un link personalizado para pagar en dólares
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium mb-2">Nombre Completo</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-gray-500" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              placeholder="tu@email.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Te enviaremos el link de pago aquí</p>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faCommentDots} className="mr-2 text-green-500" />
              Número de WhatsApp
            </label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              placeholder="5491123456789 (sin +)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">También te contactaremos por WhatsApp</p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium mb-2">Servicio</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              placeholder="Servicio de Análisis de Datos"
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium mb-2">Monto en USD</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border text-2xl font-bold placeholder-gray-400 ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
              }`}
              placeholder="100.00"
              min="1"
              step="0.01"
              required
            />
            <p className="text-sm text-gray-500 mt-1">Monto en dólares estadounidenses</p>
          </div>

          {error && (
            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition duration-300 ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                Enviando solicitud...
              </>
            ) : (
              'Solicitar Link de Pago'
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className={`mt-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className="font-semibold mb-2">📋 ¿Cómo funciona?</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>1. Completas este formulario con tus datos</p>
            <p>2. Te enviamos un link personalizado de Takenos</p>
            <p>3. Pagas con cualquier tarjeta en dólares</p>
            <p>4. Confirmamos tu pago automáticamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
