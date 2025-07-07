"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCreditCard, 
  faLock, 
  faShieldAlt, 
  faCheck,
  faExclamationTriangle,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';


// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ amount, description, onSuccess, onError }: {
  amount: number;
  description: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}) {
  const { theme } = useTheme();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState({
    cardNumber: false,
    cardExpiry: false,
    cardCvc: false,
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });
  const [cardholderName, setCardholderName] = useState('');

  const isFormComplete = cardComplete.cardNumber && cardComplete.cardExpiry && cardComplete.cardCvc && cardholderName.trim();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !isFormComplete) {
      return;
    }

    setIsLoading(true);

    try {
      // Crear PaymentIntent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creating payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement)!,
          billing_details: {
            name: cardholderName.trim() || 'Cliente ServiceDG',
          },
        },
      });

      if (error) {
        onError(error.message || 'Error al procesar el pago');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      onError(error.message || 'Error de conexión al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme === 'dark' ? '#ffffff' : '#424770',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: theme === 'dark' ? '#9ca3af' : '#aab7c4',
        },
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a',
      },
      complete: {
        color: theme === 'dark' ? '#10b981' : '#059669',
        iconColor: theme === 'dark' ? '#10b981' : '#059669',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header con información del pago */}
      <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <FontAwesomeIcon icon={faCreditCard} className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pago con Tarjeta</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Procesado por Stripe</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">${amount.toFixed(2)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">USD</p>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'}`}>
          <p className="text-sm font-medium">{description}</p>
        </div>
      </div>

      {/* Formulario de tarjeta */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* Nombre del titular */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
              Nombre del titular
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className={`w-full p-4 rounded-lg border transition-all ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                  : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
              }`}
              placeholder="Nombre como aparece en la tarjeta"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa el nombre exacto que aparece en tu tarjeta</p>
          </div>

          {/* Número de tarjeta */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center">
              <FontAwesomeIcon icon={faCreditCard} className="mr-2 text-gray-500" />
              Número de tarjeta
            </label>
            <div className={`relative p-4 rounded-lg border transition-all ${
              cardErrors.cardNumber 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : cardComplete.cardNumber 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500' 
                    : 'border-gray-300 bg-white focus-within:border-blue-500'
            }`}>
              <CardNumberElement
                options={elementOptions}
                onChange={(event) => {
                  setCardComplete(prev => ({ ...prev, cardNumber: event.complete }));
                  setCardErrors(prev => ({ ...prev, cardNumber: event.error?.message || '' }));
                }}
              />
              {cardComplete.cardNumber && (
                <FontAwesomeIcon 
                  icon={faCheck} 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" 
                />
              )}
            </div>
            {cardErrors.cardNumber && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <FontAwesomeIcon icon={faExclamationTriangle} className="mr-1" />
                {cardErrors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha de expiración */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha de expiración
              </label>
              <div className={`relative p-4 rounded-lg border transition-all ${
                cardErrors.cardExpiry 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : cardComplete.cardExpiry 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500' 
                      : 'border-gray-300 bg-white focus-within:border-blue-500'
              }`}>
                <CardExpiryElement
                  options={elementOptions}
                  onChange={(event) => {
                    setCardComplete(prev => ({ ...prev, cardExpiry: event.complete }));
                    setCardErrors(prev => ({ ...prev, cardExpiry: event.error?.message || '' }));
                  }}
                />
                {cardComplete.cardExpiry && (
                  <FontAwesomeIcon 
                    icon={faCheck} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" 
                  />
                )}
              </div>
              {cardErrors.cardExpiry && (
                <p className="text-red-500 text-xs mt-1">{cardErrors.cardExpiry}</p>
              )}
            </div>

            {/* CVC */}
            <div>
              <label className="block text-sm font-medium mb-2">
                CVC
              </label>
              <div className={`relative p-4 rounded-lg border transition-all ${
                cardErrors.cardCvc 
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                  : cardComplete.cardCvc 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 focus-within:border-blue-500' 
                      : 'border-gray-300 bg-white focus-within:border-blue-500'
              }`}>
                <CardCvcElement
                  options={elementOptions}
                  onChange={(event) => {
                    setCardComplete(prev => ({ ...prev, cardCvc: event.complete }));
                    setCardErrors(prev => ({ ...prev, cardCvc: event.error?.message || '' }));
                  }}
                />
                {cardComplete.cardCvc && (
                  <FontAwesomeIcon 
                    icon={faCheck} 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500" 
                  />
                )}
              </div>
              {cardErrors.cardCvc && (
                <p className="text-red-500 text-xs mt-1">{cardErrors.cardCvc}</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de seguridad */}
        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="flex items-center space-x-3 mb-2">
            <FontAwesomeIcon icon={faShieldAlt} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Tu pago está protegido
            </span>
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Encriptación SSL de 256 bits</p>
            <p>• No almacenamos tu información de tarjeta</p>
            <p>• Validación del nombre del titular</p>
            <p>• Procesamiento PCI DSS Level 1</p>
            <p>• En tu estado de cuenta aparecerá como &quot;*SERVICEDG&quot;</p>
          </div>
        </div>

        {/* Botón de pago */}
        <button
          type="submit"
          disabled={!stripe || isLoading || !isFormComplete}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center space-x-2 ${
            !stripe || isLoading || !isFormComplete
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faLock} />
              <span>Pagar ${amount.toFixed(2)} USD</span>
            </>
          )}
        </button>
      </form>

      {/* Badges de confianza */}
      <div className="flex items-center justify-center space-x-6 pt-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Powered by</div>
          <div className="font-bold text-indigo-600">Stripe</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Security</div>
          <div className="font-bold text-green-600">256-bit SSL</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">Compliance</div>
          <div className="font-bold text-blue-600">PCI DSS</div>
        </div>
      </div>
    </div>
  );
}

export default function StripePayment() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Servicio de Análisis de Datos');
  const [showPayment, setShowPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isComponentReady, setIsComponentReady] = useState(false);

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
      const inputs = document.querySelectorAll('.stripe-form input, .stripe-form textarea, .stripe-form select, .stripe-form .StripeElement');
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

      const titles = document.querySelectorAll('.stripe-form h1, .stripe-form h2, .stripe-form h3, .stripe-form h4');
      titles.forEach((title) => {
        const titleElement = title as HTMLElement;
        titleElement.style.textAlign = 'center';
        titleElement.style.width = '100%';
        titleElement.style.display = 'block';
      });
    }
  }, [isComponentReady]);

  const handleSuccess = (id: string) => {
    setPaymentIntentId(id);
    setSuccess(true);
    setShowPayment(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (!isComponentReady) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className={`p-8 rounded-xl border-2 border-green-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-green-50'} text-center`}>
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon icon={faCheck} className="text-4xl text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-green-600 mb-4">¡Pago Exitoso!</h3>
          <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
            Tu pago de <strong>${amount} USD</strong> ha sido procesado correctamente.
          </p>
          
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} mb-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Servicio:</p>
                <p className="font-medium">{description}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Monto:</p>
                <p className="font-medium">${amount} USD</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">ID de Pago:</p>
                <p className="font-mono text-xs">{paymentIntentId}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-600 dark:text-gray-400">Estado:</p>
                <p className="font-medium text-green-600">Completado</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSuccess(false);
                setAmount('');
                setError('');
                setPaymentIntentId('');
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 transition duration-300 font-semibold"
            >
              Realizar otro pago
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recibirás una confirmación por email en breve.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 stripe-form" style={{ width: '100%', display: 'block' }}>
      {!showPayment ? (
        // Formulario para ingresar monto
        <div className={`p-8 rounded-xl border-2 border-blue-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}`}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faCreditCard} className="text-3xl text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-blue-600 mb-2">Pago Internacional</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Procesamiento seguro en USD con Stripe
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Descripción del Servicio
              </label>
              <div className={`w-full px-4 py-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'} font-medium`}>
                {description}
              </div>
              <p className="text-sm text-gray-500 mt-2">Servicio profesional de ServiceDG</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Monto a Pagar (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-gray-500">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-4 py-4 rounded-xl border text-3xl font-bold placeholder-gray-400 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
                  } transition-all duration-200`}
                  placeholder="50.00"
                  min="1"
                  step="0.01"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg font-semibold text-gray-500">USD</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Mínimo: $1.00 USD • Máximo: $999,999.00 USD</p>
            </div>

            {error && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                <span className="text-red-600 font-medium">{error}</span>
              </div>
            )}

            <button
              onClick={() => {
                if (!amount || parseFloat(amount) <= 0) {
                  setError('Por favor ingresa un monto válido');
                  return;
                }
                if (parseFloat(amount) > 999999) {
                  setError('El monto máximo es $999,999 USD');
                  return;
                }
                setError('');
                setShowPayment(true);
              }}
              disabled={!amount}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                !amount 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
              }`}
            >
              <FontAwesomeIcon icon={faLock} className="mr-2" />
              Continuar al Pago Seguro
            </button>

            {/* Información adicional */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-2xl text-green-500 mb-2" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Seguridad SSL</p>
              </div>
              <div className="text-center">
                <FontAwesomeIcon icon={faCreditCard} className="text-2xl text-blue-500 mb-2" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Todas las Tarjetas</p>
              </div>
              <div className="text-center">
                <FontAwesomeIcon icon={faCheck} className="text-2xl text-indigo-500 mb-2" />
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Procesamiento Global</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setShowPayment(false);
                  setError('');
                }}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
              >
                ← Cambiar monto
              </button>
            </div>

            <CheckoutForm
              amount={parseFloat(amount)}
              description={description}
              onSuccess={handleSuccess}
              onError={handleError}
            />

            {error && (
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-600 mr-2" />
                <span className="text-red-600 font-medium">{error}</span>
              </div>
            )}
          </div>
        </Elements>
      )}
    </div>
  );
}
