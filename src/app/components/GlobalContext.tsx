import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

interface GlobalContextProps {
  link: string;
  setLink: (link: string) => void;
  totalViewers: number;
  updateBlockViewers: (blockId: string, viewers: number) => void;
  getExpiredViewersCount: () => number;
  getTotalViewersSent: () => number;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [link, setLink] = useState<string>(() => localStorage.getItem('link') || '');
  const [blockViewers, setBlockViewers] = useState<Record<string, number>>({});
  const [expiredViewers, setExpiredViewers] = useState<number>(0);
  
  // Calcular viewers que deben descontarse por haber completado su duración
  const getExpiredViewersCount = useCallback(() => {
    try {
      const globalHistoryKey = 'globalOperationsHistory';
      const globalHistory = localStorage.getItem(globalHistoryKey);
      
      if (!globalHistory) return 0;
      
      const operations = JSON.parse(globalHistory);
      const now = new Date();
      let expiredViewers = 0;
      
      operations.forEach((op: any) => {
        // Solo procesar operaciones exitosas con duración
        if (op.status === 'success' && op.duration && (op.savedAt || op.startTime)) {
          try {
            const baseTime = op.savedAt || op.startTime;
            const startDate = new Date(baseTime);
            
            if (!isNaN(startDate.getTime())) {
              const endTime = new Date(startDate.getTime() + (op.duration * 60 * 1000));
              
              // Si la operación ya terminó naturalmente, descontar sus viewers
              if (now > endTime) {
                expiredViewers += op.count || 0;
              }
            }
          } catch (error) {
            console.warn('Error calculando operación expirada:', error);
          }
        }
      });
      
      return expiredViewers;
    } catch (error) {
      console.error('Error calculando viewers expirados:', error);
      return 0;
    }
  }, []);

  // Actualizar viewers expirados cada minuto
  useEffect(() => {
    const updateExpiredViewers = () => {
      const expired = getExpiredViewersCount();
      setExpiredViewers(expired);
    };
    
    // Actualizar inmediatamente
    updateExpiredViewers();
    
    // Actualizar cada minuto
    const interval = setInterval(updateExpiredViewers, 60000);
    
    return () => clearInterval(interval);
  }, [getExpiredViewersCount]);

  // Guardar link en localStorage
  useEffect(() => {
    localStorage.setItem('link', link);
  }, [link]);

  const updateBlockViewers = useCallback((blockId: string, viewers: number) => {
    setBlockViewers(prev => {
      // Solo actualizar si el valor ha cambiado
      if (prev[blockId] !== viewers) {
        return {
          ...prev,
          [blockId]: viewers
        };
      }
      return prev;
    });
  }, []);

  // Calcular total de viewers: suma de bloques activos - viewers de operaciones que ya terminaron
  const currentActiveViewers = Object.values(blockViewers).reduce((acc, viewers) => acc + viewers, 0);

  // Función para calcular el total de viewers enviados incluyendo reiniciados
  const getTotalViewersSent = useCallback(() => {
    try {
      // Viewers activos actuales (sin restar nada - estos son los de los bloques)
      const activeViewers = currentActiveViewers;
      
      // Viewers expirados (que terminaron su duración)
      const expiredViewers = getExpiredViewersCount();
      
      // Viewers de bloques reiniciados
      const resetHistoryKey = 'blockResetHistory';
      const resetHistory = localStorage.getItem(resetHistoryKey);
      let resetViewers = 0;
      
      if (resetHistory) {
        try {
          const resets = JSON.parse(resetHistory);
          resetViewers = resets.reduce((sum: number, reset: any) => sum + (reset.viewersLost || 0), 0);
        } catch (error) {
          console.error('Error calculando viewers reiniciados:', error);
        }
      }
      
      // Total enviados = activos + expirados + reiniciados
      // IMPORTANTE: No se resta nada, esto es el TOTAL ENVIADO HISTÓRICO
      return activeViewers + expiredViewers + resetViewers;
    } catch (error) {
      console.error('Error calculando total de viewers enviados:', error);
      return currentActiveViewers;
    }
  }, [currentActiveViewers, getExpiredViewersCount]);

  // Total cargados = Total enviados - expirados
  const totalViewers = Math.max(0, getTotalViewersSent() - expiredViewers);

  return (
    <GlobalContext.Provider value={{
      link,
      setLink,
      totalViewers,
      updateBlockViewers,
      getExpiredViewersCount,
      getTotalViewersSent
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
