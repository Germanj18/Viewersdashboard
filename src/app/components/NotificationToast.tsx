
import React, { useEffect } from 'react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

const toastColors: Record<string, string> = {
  success: 'linear-gradient(135deg, #10b981, #059669)',
  error: 'linear-gradient(135deg, #ef4444, #dc2626)',
  warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
  info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
};

const toastIcons: Record<string, string> = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div
      style={{
        background: toastColors[type],
        color: 'white',
        borderRadius: 8,
        padding: '12px 16px',
        minWidth: 240,
        maxWidth: 380,
        margin: '0px 0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontWeight: 500,
        fontSize: 14,
        zIndex: 10001
      }}
    >
      <span style={{ fontSize: 18 }}>{toastIcons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          fontSize: 16,
          cursor: 'pointer',
          marginLeft: 6
        }}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
};

export default NotificationToast;
