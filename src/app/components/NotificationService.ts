// Utilidad para notificaciones del navegador
export class NotificationService {
  private static hasPermission = false;
  
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  static async showNotification(title: string, options: {
    body?: string;
    icon?: string;
    tag?: string;
    silent?: boolean;
  } = {}) {
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto cerrar después de 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  static playSound(type: 'success' | 'error' | 'warning' | 'info') {
    // Crear un contexto de audio para reproducir sonidos
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const frequencies = {
        success: [523, 659, 784], // C, E, G - acorde mayor
        error: [370, 415, 466],   // F#, G#, A# - disonante
        warning: [440, 554],      // A, C# - quinta aumentada
        info: [523, 698]          // C, F - cuarta justa
      };

      const freq = frequencies[type];
      
      freq.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        const startTime = audioContext.currentTime + (index * 0.1);
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.3);
      });
    } catch (error) {
      console.warn('No se pudo reproducir el sonido:', error);
    }
  }
}

// Función para mostrar notificaciones toast en la UI
export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 3000) => {
  // Crear elemento toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  // Agregar estilos inline
  Object.assign(toast.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: '10000',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    maxWidth: '300px',
    wordWrap: 'break-word'
  });

  // Colores según el tipo
  const colors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
  };
  
  toast.style.background = colors[type];
  
  // Agregar al DOM
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Remover después del tiempo especificado
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
};

function getToastIcon(type: string): string {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  return icons[type as keyof typeof icons] || 'ℹ️';
}
