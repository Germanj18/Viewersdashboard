import { useTheme } from '../ThemeContext';

export default function PaymentLoading() {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
      <header className={`w-full flex justify-between items-center p-4 ${theme === 'dark' ? 'bg-black' : 'bg-white shadow-md'}`}>
        <h1 className="text-2xl font-bold">Resultado del Pago</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className={`w-full max-w-md p-8 rounded-lg shadow-lg text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Cargando...</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Procesando información del pago
          </p>
        </div>
      </main>
    </div>
  );
}
