import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import IndependentBlock from './IndependentBlock';
import './Viewers.css';

const IndependentViewers = () => {
  const { theme } = useTheme();
  const [link, setLink] = useState<string>(() => localStorage.getItem('link') || '');
  const [totalViewersCount, setTotalViewersCount] = useState<number>(0);
  const [blockViewers, setBlockViewers] = useState<{ [key: string]: number }>({});

  // Configuración inicial de los bloques
  const initialBlocks = [
    { title: 'Block 1', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 2', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 3', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 4', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 5', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 6', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 7', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
    { title: 'Block 8', totalOperations: 35, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract' as 'subtract', autoStart: false, startTime: '' },
  ];

  // Guardar el link en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('link', link);
  }, [link]);

  // Manejar cambios en el total de viewers de cada bloque
  const handleTotalViewersChange = (blockTitle: string, viewers: number) => {
    setBlockViewers(prev => {
      const newBlockViewers = { ...prev, [blockTitle]: viewers };
      
      // Calcular el total sumando todos los viewers de todos los bloques
      const newTotal = Object.values(newBlockViewers).reduce((sum, count) => sum + count, 0);
      setTotalViewersCount(newTotal);
      
      return newBlockViewers;
    });
  };

  const handleLinkChange = (newLink: string) => {
    setLink(newLink);
  };

  return (
    <div className={`viewers-container ${theme}`}>
      {/* Header con input de link y total de viewers */}
      <div className="viewers-header">
        <div className="link-input-container">
          <label htmlFor="link-input" className="link-label">
            🔗 Link de YouTube:
          </label>
          <input
            id="link-input"
            type="text"
            value={link}
            onChange={(e) => handleLinkChange(e.target.value)}
            placeholder="Ingresa el link de YouTube aquí..."
            className={`link-input ${theme}`}
          />
        </div>
        
        <div className="total-viewers-display">
          <span className="total-viewers-label">👥 Total de Viewers:</span>
          <span className="total-viewers-count">{totalViewersCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Grid de bloques independientes */}
      <div className="blocks-grid">
        {initialBlocks.map((blockConfig, index) => (
          <IndependentBlock
            key={`${blockConfig.title}-${index}`}
            title={blockConfig.title}
            link={link}
            onTotalViewersChange={handleTotalViewersChange}
            initialConfig={{
              totalOperations: blockConfig.totalOperations,
              serviceId: blockConfig.serviceId,
              count: blockConfig.count,
              decrement: blockConfig.decrement,
              operationType: blockConfig.operationType,
              autoStart: blockConfig.autoStart,
              startTime: blockConfig.startTime
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default IndependentViewers;
