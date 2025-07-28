'use client';

import { useState, useCallback } from 'react';
import NotificationToast from '../components/NotificationToast';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const ToastContainer = () => (
    <div style={{ position: 'fixed', top: 0, right: 0, zIndex: 10000 }}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            transition: 'transform 0.3s ease'
          }}
        >
          <NotificationToast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { showToast, ToastContainer };
};

// Export standalone function for compatibility (NO duplica ni hace bucle)
// Si tienes acceso al hook, usa useToast().showToast en componentes React.
// Esta función solo hace log si no hay instancia React activa.
export const showToastMessage = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  // Aquí podrías conectar con un sistema global si lo implementas, pero por defecto solo loguea
  if (typeof window !== 'undefined' && (window as any).__REACT_TOAST__) {
    (window as any).__REACT_TOAST__(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
};
