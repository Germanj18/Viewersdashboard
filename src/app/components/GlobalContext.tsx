import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

interface GlobalContextProps {
  link: string;
  setLink: (link: string) => void;
  totalViewers: number;
  updateBlockViewers: (blockId: string, viewers: number) => void;
}

const GlobalContext = createContext<GlobalContextProps | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [link, setLink] = useState<string>(() => localStorage.getItem('link') || '');
  const [blockViewers, setBlockViewers] = useState<Record<string, number>>({});

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

  const totalViewers = Object.values(blockViewers).reduce((acc, viewers) => acc + viewers, 0);

  return (
    <GlobalContext.Provider value={{
      link,
      setLink,
      totalViewers,
      updateBlockViewers
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
