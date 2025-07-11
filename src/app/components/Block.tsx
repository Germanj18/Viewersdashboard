import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import * as XLSX from 'xlsx';

export interface BlockStatus {
  status: 'success' | 'error';
  message: string;
  details: any;
  timestamp: string;
  orderId?: number;
  orderStatus?: string;
  duration?: number;
  count?: number;
  serviceId?: number;
  cost?: number;
}

export interface BlockData {
  title: string;
  totalOperations: number;
  serviceId: number;
  count: number;
  decrement: number;
  operationType: 'add' | 'subtract';
  autoStart: boolean;
  startTime: string;
}

interface BlockProps {
  initialData: BlockData;
  link: string;
  onTotalViewersChange: (blockId: string, totalViewers: number) => void;
  blockId: string;
  onShowWarning: (blockId: string, warningType: string) => void;
  onShowEditModal: (blockId: string, blockData: BlockData) => void;
}

const Block: React.FC<BlockProps> = ({ initialData, link, onTotalViewersChange, blockId, onShowWarning, onShowEditModal }) => {
  const { theme } = useTheme();
  
  // Función para cargar estado desde localStorage
  const loadBlockState = useCallback(() => {
    const savedState = localStorage.getItem(`blockState_${blockId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Limpiar datos muy antiguos (más de 7 días)
        if (parsed.lastSaved) {
          const lastSavedDate = new Date(parsed.lastSaved);
          const now = new Date();
          const daysDiff = (now.getTime() - lastSavedDate.getTime()) / (1000 * 3600 * 24);
          if (daysDiff > 7) {
            localStorage.removeItem(`blockState_${blockId}`);
            return null;
          }
        }
        return parsed;
      } catch (error) {
        console.error('Error parsing saved block state:', error);
        localStorage.removeItem(`blockState_${blockId}`);
        return null;
      }
    }
    return null;
  }, [blockId]);

  // Estado local del bloque con carga desde localStorage
  const [status, setStatus] = useState<BlockStatus[]>(() => {
    const savedState = loadBlockState();
    return savedState?.status || [];
  });
  
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(() => {
    const savedState = loadBlockState();
    return savedState?.currentOperation || 0;
  });
  
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>(() => {
    const savedState = loadBlockState();
    const savedStateValue = savedState?.state || 'idle';
    // Si estaba 'running' antes de recargar, cambiar a 'paused' para evitar problemas
    return savedStateValue === 'running' ? 'paused' : savedStateValue;
  });
  
  const [totalViewers, setTotalViewers] = useState(() => {
    const savedState = loadBlockState();
    return savedState?.totalViewers || 0;
  });
  
  const [blockData, setBlockData] = useState<BlockData>(() => {
    const savedState = loadBlockState();
    return savedState?.blockData || initialData;
  });
  
  // Función para guardar estado en localStorage
  const saveBlockState = useCallback(() => {
    const stateToSave = {
      status,
      currentOperation,
      state,
      totalViewers,
      blockData,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`blockState_${blockId}`, JSON.stringify(stateToSave));
  }, [blockId, status, currentOperation, state, totalViewers, blockData]);

  // Guardar estado cada vez que cambie algún valor importante
  useEffect(() => {
    saveBlockState();
  }, [status, currentOperation, state, totalViewers, blockData, saveBlockState]);
  
  // Refs para mantener valores actualizados en el intervalo
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastReportedViewers = useRef<number>(0);
  const stateRef = useRef(state);
  const currentOperationRef = useRef(currentOperation);
  const blockDataRef = useRef(blockData);
  const statusRef = useRef(status);
  const totalViewersRef = useRef(totalViewers);

  // Actualizar refs cuando cambian los estados
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    currentOperationRef.current = currentOperation;
  }, [currentOperation]);

  useEffect(() => {
    blockDataRef.current = blockData;
  }, [blockData]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    totalViewersRef.current = totalViewers;
  }, [totalViewers]);

  // Efecto para auto-start
  useEffect(() => {
    if (blockData.autoStart && blockData.startTime && state === 'idle') {
      const [hours, minutes] = blockData.startTime.split(':').map(Number);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      const delay = start.getTime() - now.getTime();

      if (delay > 0) {
        const timeoutId = setTimeout(() => startBlock(), delay);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [blockData.autoStart, blockData.startTime, state]);

  // Efecto para notificar cambios en totalViewers (optimizado)
  useEffect(() => {
    if (lastReportedViewers.current !== totalViewers) {
      onTotalViewersChange(blockId, totalViewers);
      lastReportedViewers.current = totalViewers;
    }
  }, [totalViewers, blockId, onTotalViewersChange]);

  // Cleanup al desmontar y antes de cerrar la ventana
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Guardar estado final antes de cerrar
      const finalState = {
        status: statusRef.current,
        currentOperation: currentOperationRef.current,
        state: stateRef.current === 'running' ? 'paused' : stateRef.current,
        totalViewers: totalViewersRef.current,
        blockData: blockDataRef.current,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(`blockState_${blockId}`, JSON.stringify(finalState));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [blockId]);

  const getServiceDuration = (serviceId: number) => {
    switch (serviceId) {
      case 336: return 120;
      case 337: return 150;
      case 334: return 60;
      case 335: return 90;
      case 338: return 180;
      case 459: return 240;
      case 460: return 360;
      case 657: return 480;
      default: return 0;
    }
  };

  const generateExcel = useCallback(() => {
    // Crear el resumen para el Excel
    const currentStatus = statusRef.current;
    const currentBlockData = blockDataRef.current;
    
    const summary = currentStatus.map((statusItem) => ({
      'Estado': statusItem.status,
      'Mensaje': statusItem.message,
      'Timestamp': statusItem.timestamp,
      'Order ID': statusItem.orderId,
      'Order Status': statusItem.orderStatus,
      'Duración (minutos)': statusItem.duration,
      'Cantidad de Viewers': statusItem.count,
      'Costo de la Operación': statusItem.details?.res?.sum || 0,
      ...statusItem.details,
    }));

    // Generar intervalos de tiempo desde las 10:25 AM hasta las 23:00 PM
    const startTime = new Date("1970-01-01T10:25:00Z");
    const endTime = new Date("1970-01-01T23:00:00Z");
    const timeIntervals: { Hora: string; [key: string]: number | string }[] = [];

    let currentTime = new Date(startTime);

    while (currentTime <= endTime) {
      timeIntervals.push({ Hora: currentTime.toISOString().substr(11, 5) });
      currentTime = new Date(currentTime.getTime() + 60000);
    }

    const costRow: { Hora: string; [key: string]: number | string } = { Hora: 'Costo' };

    currentStatus.forEach((statusItem) => {
      if (statusItem.status === 'success' && statusItem.count && statusItem.timestamp) {
        // Intentar parsear el timestamp de manera más robusta
        let startTimeString: string;
        try {
          // Si el timestamp está en formato HH:MM:SS, extraer solo HH:MM
          const timeMatch = statusItem.timestamp.match(/(\d{1,2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2];
            startTimeString = `${hours}:${minutes}`;
          } else {
            // Si no se puede parsear, usar un valor por defecto
            console.warn('No se pudo parsear el timestamp:', statusItem.timestamp);
            startTimeString = '10:25'; // Valor por defecto
          }
        } catch (error) {
          console.error('Error parseando timestamp:', statusItem.timestamp, error);
          startTimeString = '10:25'; // Valor por defecto
        }
        
        const duration = statusItem.duration || 0;
        const orderIdColumn = `Operación ${statusItem.orderId}`;

        if (!(orderIdColumn in costRow)) {
          costRow[orderIdColumn] = statusItem.details?.res?.sum || 0;
        }

        timeIntervals.forEach((interval) => {
          if (!(orderIdColumn in interval)) {
            interval[orderIdColumn] = '';
          }
        });

        const startIndex = timeIntervals.findIndex((entry) => entry.Hora === startTimeString);

        if (startIndex !== -1) {
          for (let i = 0; i < duration && startIndex + i < timeIntervals.length; i++) {
            timeIntervals[startIndex + i][orderIdColumn] = statusItem.count;
          }
        }
      }
    });

    const allRows = [costRow, ...timeIntervals];

    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsViewers = XLSX.utils.json_to_sheet(allRows);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen de Operaciones');
    XLSX.utils.book_append_sheet(wb, wsViewers, 'Viewers por Minuto');

    XLSX.writeFile(wb, `${currentBlockData.title}.xlsx`);
  }, []);

  const handleApiCall = useCallback(async () => {
    // Verificar condiciones usando refs para valores actuales
    if (!link || stateRef.current !== 'running') {
      console.log(`${blockDataRef.current.title}: No ejecutando API call. Link: ${link}, State: ${stateRef.current}`);
      return;
    }

    try {
      const currentBlockData = blockDataRef.current;
      const currentOpNum = currentOperationRef.current;
      const { count, decrement, serviceId, operationType } = currentBlockData;
      
      // Calcula la cantidad para la operación actual
      const operationCount =
        operationType === 'add'
          ? count + (decrement || 0) * currentOpNum
          : count - (decrement || 0) * currentOpNum;

      console.log(`${currentBlockData.title}: Iniciando operación ${currentOpNum + 1} con ${operationCount} viewers`);

      const response = await fetch(`/api/proxy?service_id=${serviceId}&count=${operationCount}&link=${link}`);
      const data = await response.json();
      
      // Generar timestamp en formato consistente HH:MM:SS
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS
      
      const duration = getServiceDuration(serviceId);

      console.log(`${currentBlockData.title}, Operation ${currentOpNum + 1}:`, data);

      const newStatus: BlockStatus = {
        status: data.error ? 'error' : 'success',
        message: data.error ? 'Error en la operación' : 'Operación exitosa',
        details: data,
        timestamp,
        orderId: data.res?.order_id,
        duration,
        count: operationCount,
        serviceId,
        cost: data.res?.sum || 0,
      };

      setStatus(prev => [...prev, newStatus]);
      
      // Guardar en historial global inmediatamente
      saveToGlobalHistory(newStatus);

      // Actualizar el total de espectadores
      if (newStatus.status === 'success') {
        setTotalViewers((prev: number) => prev + operationCount);
      }

      const nextOperation = currentOpNum + 1;
      setCurrentOperation(nextOperation);

      if (nextOperation >= currentBlockData.totalOperations) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIntervalId(null);
        }
        setState('completed');
        stateRef.current = 'completed';
        
        // Notificación de bloque completado
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`🎉 ${currentBlockData.title} Completado`, {
            body: `El bloque se ha completado exitosamente con ${totalViewersRef.current} viewers totales`,
            icon: '/favicon.ico'
          });
        }
        
        // Auto-generar Excel al completar
        setTimeout(() => generateExcel(), 1000);
      }

    } catch (error) {
      console.error(`${blockDataRef.current.title}, Operation ${currentOperationRef.current + 1}:`, error);

      const newStatus: BlockStatus = {
        status: 'error',
        message: 'Error en la operación',
        details: error,
        timestamp: new Date().toTimeString().split(' ')[0], // Formato consistente HH:MM:SS
        duration: 0,
        cost: 0,
      };

      setStatus(prev => [...prev, newStatus]);
      
      // Guardar en historial global inmediatamente
      saveToGlobalHistory(newStatus);
      
      const nextOperation = currentOperationRef.current + 1;
      setCurrentOperation(nextOperation);

      if (nextOperation >= blockDataRef.current.totalOperations) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setIntervalId(null);
        }
        setState('completed');
        stateRef.current = 'completed';
        
        // Notificación de bloque completado (para casos de error también)
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(`🏁 ${blockDataRef.current.title} Finalizado`, {
            body: `El bloque ha finalizado (con errores) - Total viewers: ${totalViewersRef.current}`,
            icon: '/favicon.ico'
          });
        }
        
        setTimeout(() => generateExcel(), 1000);
      }
    }
  }, [link, generateExcel]);

  const startBlock = () => {
    if (state === 'running') return;

    setIsPaused(false);
    setState('running');
    
    // Actualizar el ref inmediatamente para que handleApiCall lo detecte
    stateRef.current = 'running';

    // Enviar la primera operación inmediatamente
    handleApiCall();

    // Configurar el intervalo para las siguientes operaciones
    const newIntervalId = setInterval(() => handleApiCall(), 120000); // 2 minutos
    intervalRef.current = newIntervalId;
    setIntervalId(newIntervalId);
  };

  const pauseBlock = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
      setIsPaused(true);
      setState('paused');
      
      // Actualizar el ref inmediatamente
      stateRef.current = 'paused';
    }
  };

  const resumeBlock = () => {
    setIsPaused(false);
    setState('running');
    
    // Actualizar el ref inmediatamente
    stateRef.current = 'running';

    // Llamar a la API inmediatamente después de reanudar
    handleApiCall();

    // Reiniciar el intervalo
    const newIntervalId = setInterval(handleApiCall, 120000);
    intervalRef.current = newIntervalId;
    setIntervalId(newIntervalId);
  };

  const finalizeBlock = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
    }
    if (state !== 'completed') {
      setState('completed');
      stateRef.current = 'completed';
      
      // Notificación de finalización manual
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`🏁 ${blockData.title} Finalizado Manualmente`, {
          body: `El bloque fue finalizado manualmente con ${totalViewers} viewers totales`,
          icon: '/favicon.ico'
        });
      }
      
      generateExcel();
    }
    setBlockData(prev => ({ ...prev, autoStart: false }));
  };

  const resetBlock = () => {
    // CORRIGIDO: No guardamos las operaciones nuevamente porque ya fueron guardadas
    // cuando se ejecutaron originalmente en handleApiCall (líneas 341 y 377)
    
    // Registrar el reset del bloque con las operaciones que se van a perder
    saveBlockReset();
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
    }
    setStatus([]);
    setIsPaused(false);
    setCurrentOperation(0);
    setState('idle');
    stateRef.current = 'idle';
    setTotalViewers(0);
    setBlockData(prev => ({ ...prev, autoStart: false, startTime: '' }));
    
    // Limpiar estado guardado del localStorage
    localStorage.removeItem(`blockState_${blockId}`);
  };

  const handleEditModal = () => {
    onShowEditModal(blockId, blockData);
  };

  // Función para actualizar blockData desde el componente padre
  const updateBlockData = (newData: BlockData) => {
    setBlockData(newData);
  };

  // Exponer funciones al componente padre mediante efectos
  React.useEffect(() => {
    (window as any)[`updateBlockData_${blockId}`] = updateBlockData;
    (window as any)[`finalizeBlock_${blockId}`] = finalizeBlock;
    (window as any)[`resetBlock_${blockId}`] = resetBlock;
    return () => {
      delete (window as any)[`updateBlockData_${blockId}`];
      delete (window as any)[`finalizeBlock_${blockId}`];
      delete (window as any)[`resetBlock_${blockId}`];
    };
  }, [blockId]);

  // Función para guardar operación en historial permanente
  const saveToGlobalHistory = useCallback((operation: BlockStatus) => {
    const globalHistoryKey = 'globalOperationsHistory';
    const existingHistory = localStorage.getItem(globalHistoryKey);
    let history = [];
    
    if (existingHistory) {
      try {
        history = JSON.parse(existingHistory);
      } catch (error) {
        console.error('Error parsing global history:', error);
        history = [];
      }
    }
    
    const historicalOperation = {
      ...operation,
      blockId,
      blockTitle: blockData.title,
      savedAt: new Date().toISOString()
    };
    
    history.push(historicalOperation);
    
    // Mantener solo las últimas 1000 operaciones para evitar problemas de memoria
    if (history.length > 1000) {
      history = history.slice(-1000);
    }
    
    localStorage.setItem(globalHistoryKey, JSON.stringify(history));
  }, [blockId, blockData.title]);

  // Función para registrar reset del bloque
  const saveBlockReset = useCallback(() => {
    const resetHistoryKey = 'blockResetHistory';
    const existingResets = localStorage.getItem(resetHistoryKey);
    let resets = [];
    
    if (existingResets) {
      try {
        resets = JSON.parse(existingResets);
      } catch (error) {
        console.error('Error parsing reset history:', error);
        resets = [];
      }
    }
    
    const resetRecord = {
      blockId,
      blockTitle: blockData.title,
      resetAt: new Date().toISOString(),
      operationsLost: status.length,
      viewersLost: totalViewers
    };
    
    resets.push(resetRecord);
    
    // Mantener solo los últimos 100 resets
    if (resets.length > 100) {
      resets = resets.slice(-100);
    }
    
    localStorage.setItem(resetHistoryKey, JSON.stringify(resets));
  }, [blockId, blockData.title, status.length, totalViewers]);

  return (
    <div className={`block ${theme}`}>
      <h2 className="block-title">{blockData.title}</h2>
      
      {blockData.autoStart && blockData.startTime && (
        <div className="auto-start-info">
          ⏰ Inicio automático: {blockData.startTime}
        </div>
      )}

      {(state === 'paused' || state === 'completed') && (
        <button onClick={generateExcel} className="download-icon">
          <span className="icon-download"></span>
        </button>
      )}

      <div className="status">
        {Array.from({ length: blockData.totalOperations }).map((_, statusIndex) => (
          <div key={statusIndex} className="status-item">
            {`Operación ${statusIndex + 1}: `}
            {status[statusIndex] ? (
              <>
                {status[statusIndex].status === 'success' ? (
                  <span className="status-success">✅</span>
                ) : (
                  <span className="status-error">❌</span>
                )}
                <span className="timestamp">{status[statusIndex].timestamp}</span>
                {status[statusIndex].orderStatus && (
                  <span className="order-status">{status[statusIndex].orderStatus}</span>
                )}
              </>
            ) : (
              <span className="status-pending">⏳</span>
            )}
          </div>
        ))}
      </div>

      <div className="block-controls">
        {state === 'idle' && (
          <button onClick={startBlock} className="start-button">
            ▶️ Iniciar
          </button>
        )}
        
        {state === 'running' && (
          <button onClick={pauseBlock} className="pause-button">
            ⏸️ Pausar
          </button>
        )}
        
        {state === 'paused' && (
          <>
            <button onClick={resumeBlock} className="resume-button">
              ▶️ Reanudar
            </button>
            <button onClick={() => onShowWarning(blockId, 'finalizar')} className="finalize-button">
              🏁 Finalizar
            </button>
            <button onClick={() => onShowWarning(blockId, 'reiniciar')} className="reset-button">
              🔄 Reiniciar
            </button>
          </>
        )}
        
        {state === 'completed' && (
          <>
            <div className="completed-message">✅ Bloque finalizado</div>
            <button onClick={() => onShowWarning(blockId, 'reiniciar')} className="reset-button">
              🔄 Reiniciar
            </button>
          </>
        )}
        
        
        <button onClick={handleEditModal} className="edit-button">
          ✏️ Editar
        </button>
      </div>

      <div className="total-viewers">👥 {totalViewers}</div>
    </div>
  );
};

export default Block;
