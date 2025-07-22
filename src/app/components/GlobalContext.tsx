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
      // CORREGIDO: Calcular viewers enviados desde el historial global (fuente única de verdad)
      const globalHistoryKey = 'globalOperationsHistory';
      const globalHistory = localStorage.getItem(globalHistoryKey);
      let totalViewersFromOperations = 0;
      
      if (globalHistory) {
        try {
          const operations = JSON.parse(globalHistory);
          totalViewersFromOperations = operations
            .filter((op: any) => op.status === 'success') // Solo operaciones exitosas
            .reduce((sum: number, op: any) => sum + (op.count || 0), 0); // Sumar viewers enviados
        } catch (error) {
          console.error('Error calculando viewers del historial:', error);
        }
      }
      
      // Viewers de bloques reiniciados (ya incluidos en el historial global, no sumar dos veces)
      // El historial global ya contiene todas las operaciones históricas, incluyendo las de bloques reiniciados
      
      console.log('📊 Cálculo de viewers enviados:', {
        viewersFromOperations: totalViewersFromOperations,
        note: 'Este es el total REAL de viewers enviados desde operaciones exitosas'
      });
      
      return totalViewersFromOperations;
    } catch (error) {
      console.error('Error calculando total de viewers enviados:', error);
      return 0;
    }
  }, [getExpiredViewersCount]);

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
