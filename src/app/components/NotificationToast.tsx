'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '../ThemeContext';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type,
  duration = 5000,
  onClose
}) => {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mostrar el toast con animación
    setTimeout(() => setVisible(true), 100);

    // Auto cerrar después de la duración especificada
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getBackgroundColor = () => {
    const baseColors = {
      success: theme === 'dark' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.95)',
      info: theme === 'dark' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(59, 130, 246, 0.95)',
      warning: theme === 'dark' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(245, 158, 11, 0.95)',
      error: theme === 'dark' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.95)'
    };
    return baseColors[type];
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 10000,
        background: getBackgroundColor(),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        maxWidth: '400px',
        minWidth: '300px',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s ease',
        fontSize: '0.875rem',
        fontWeight: '500'
      }}
    >
      <span style={{ fontSize: '1.25rem' }}>{getIcon()}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          color: 'white',
          borderRadius: '0.375rem',
          padding: '0.25rem 0.5rem',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '600',
          transition: 'background 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
      >
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;
