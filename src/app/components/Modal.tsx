import React, { useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './modallogin.css'; // Importar el archivo CSS

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });
    if (result?.error) {
      setError(result.error);
    } else {
      window.location.href = '/admin'; // Redirigir al dashboard protegido
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
      <div className="modal-card relative">
        <Image 
          src="/servicedg-logo.svg" 
          alt="ServiceDG" 
          width={32}
          height={32}
          className="absolute top-6 right-6 opacity-70 hover:opacity-100 transition-opacity"
        />
        <h2>🔐 Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6 relative">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              👤 Nombre de Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800/60 text-slate-100 border-2 border-slate-600/50 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-slate-400"
              placeholder="Ingresa tu usuario"
            />
          </div>
          <div className="password-container">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              🔒 Contraseña
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-slate-800/60 text-slate-100 border-2 border-slate-600/50 rounded-xl focus:border-blue-500 focus:outline-none transition-all duration-200 placeholder-slate-400"
              placeholder="Ingresa tu contraseña"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </button>
          </div>
          {error && (
            <div className="text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl backdrop-blur-sm">
              ⚠️ {error}
            </div>
          )}
          <div className="flex gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-600/60 border border-slate-600/50 rounded-xl text-slate-200 font-medium hover:bg-slate-600/80 hover:border-slate-600/80 transition-all duration-200 hover:-translate-y-0.5"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 border border-blue-500/20 rounded-xl text-white font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              🚀 Iniciar sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;