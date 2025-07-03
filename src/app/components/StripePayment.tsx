"use client";
import { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
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

      const { clientSecret, paymentIntentId } = await response.json();

      if (!response.ok) {
        throw new Error('Error creating payment intent');
      }

      // Confirmar el pago
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: 'Cliente ServiceDG',
          },
        },
      });

      if (error) {
        onError(error.message || 'Error al procesar el pago');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (error) {
      onError('Error de conexión al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: theme === 'dark' ? '#ffffff' : '#424770',
        backgroundColor: theme === 'dark' ? '#374151' : '#ffffff',
        '::placeholder': {
          color: theme === 'dark' ? '#9ca3af' : '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
        <label className="block text-sm font-medium mb-2">
          Información de la Tarjeta
        </label>
        <CardElement options={cardElementOptions} />
      </div>

      <button
        type="submit"
        disabled={!stripe || isLoading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition duration-300 ${
          !stripe || isLoading
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isLoading ? 'Procesando...' : `Pagar $${amount} USD`}
      </button>
    </form>
  );
}

export default function StripePayment() {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('ServicioAnalisisDatos');
  const [showPayment, setShowPayment] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [paymentIntentId, setPaymentIntentId] = useState('');

  const handleSuccess = (id: string) => {
    setPaymentIntentId(id);
    setSuccess(true);
    setShowPayment(false);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className={`p-6 rounded-lg border-2 border-green-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-green-50'} text-center`}>
          <div className="text-6xl text-green-500 mb-4">✓</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago Exitoso!</h3>
          <p className="text-lg mb-4">Tu pago en USD ha sido procesado correctamente.</p>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
            <p className="text-sm"><strong>Servicio:</strong> {description}</p>
            <p className="text-sm"><strong>Monto:</strong> ${amount} USD</p>
            <p className="text-sm"><strong>ID de Pago:</strong> {paymentIntentId}</p>
          </div>

          <button
            onClick={() => {
              setSuccess(false);
              setAmount('');
              setError('');
              setPaymentIntentId('');
            }}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Realizar otro pago
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!showPayment ? (
        // Formulario para ingresar monto
        <div className={`p-6 rounded-lg border-2 border-indigo-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-50'}`}>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-indigo-600 mb-2">Pago con Stripe</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Pago en USD con tarjeta de crédito/débito - ServiceDG
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
              <label className="block text-sm font-medium mb-2">Monto a Pagar (USD)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border text-2xl font-bold placeholder-gray-400 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
                placeholder="50"
                min="1"
                step="0.01"
              />
              <p className="text-sm text-gray-500 mt-1">Ingresa el monto en dólares estadounidenses</p>
            </div>

            {error && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <button
              onClick={() => {
                if (!amount || parseFloat(amount) <= 0) {
                  setError('Por favor ingresa un monto válido');
                  return;
                }
                setError('');
                setShowPayment(true);
              }}
              disabled={!amount}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition duration-300 ${
                !amount 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              Continuar con Stripe
            </button>
          </div>
        </div>
      ) : (
        <Elements stripe={stripePromise}>
          <div className={`p-6 rounded-lg border-2 border-indigo-200 ${theme === 'dark' ? 'bg-gray-800' : 'bg-indigo-50'}`}>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-indigo-600 mb-2">{description}</h3>
              <p className="text-3xl font-bold mb-2">${parseFloat(amount).toFixed(2)} USD</p>
              <p className="text-gray-600 dark:text-gray-400">
                Pago seguro con Stripe
              </p>
              <button
                onClick={() => {
                  setShowPayment(false);
                  setError('');
                }}
                className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
              <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900' : 'bg-red-100'} text-center`}>
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
        </Elements>
      )}

      {/* Información de seguridad */}
      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <div className="flex items-center justify-center mb-2">
          <span className="text-indigo-500 mr-2">🔒</span>
          <span className="font-semibold">Pago 100% seguro con Stripe</span>
        </div>
        <div className="text-sm text-center space-y-1">
          <p>• Procesamiento en USD</p>
          <p>• Encriptación de nivel bancario</p>
          <p>• Soporte para todas las tarjetas principales</p>
          <p>• Protección contra fraude</p>
        </div>
      </div>
    </div>
  );
}
