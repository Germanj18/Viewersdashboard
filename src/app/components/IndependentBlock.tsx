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
}

export interface BlockConfig {
  totalOperations: number;
  serviceId: number;
  count: number;
  decrement: number;
  operationType: 'add' | 'subtract';
  autoStart: boolean;
  startTime: string;
}

export interface PersistedBlockState {
  config: BlockConfig;
  lastEditedConfig: BlockConfig;
  status: BlockStatus[];
  currentOperation: number;
  state: 'idle' | 'running' | 'paused' | 'completed';
  totalViewers: number;
  isPaused: boolean;
}

export interface IndependentBlockProps {
  title: string;
  link: string;
  onTotalViewersChange?: (title: string, viewers: number) => void;
  initialConfig?: Partial<BlockConfig>;
}

const IndependentBlock: React.FC<IndependentBlockProps> = ({
  title,
  link,
  onTotalViewersChange,
  initialConfig = {}
}) => {
  const { theme } = useTheme();
  
  // Función para obtener el localStorage key único por bloque
  const getStorageKey = useCallback(() => `block_${title}_${link}`, [title, link]);
  
  // Función para cargar estado persistente
  const loadPersistedState = (): PersistedBlockState | null => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error(`Error loading persisted state for ${title}:`, error);
      return null;
    }
  };
  
  // Función para guardar estado persistente
  const savePersistedState = useCallback((state: PersistedBlockState) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(state));
    } catch (error) {
      console.error(`Error saving persisted state for ${title}:`, error);
    }
  }, [getStorageKey, title]);
  
  // Configuración por defecto
  const defaultConfig: BlockConfig = {
    totalOperations: initialConfig.totalOperations || 35,
    serviceId: initialConfig.serviceId || 335,
    count: initialConfig.count || 100,
    decrement: initialConfig.decrement || 50,
    operationType: initialConfig.operationType || 'subtract',
    autoStart: initialConfig.autoStart || false,
    startTime: initialConfig.startTime || ''
  };
  
  // Cargar estado persistente al inicializar
  const persistedState = loadPersistedState();
  
  // Estados del bloque independiente (inicializados con datos persistentes si existen)
  const [status, setStatus] = useState<BlockStatus[]>(persistedState?.status || []);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(persistedState?.isPaused || false);
  const [currentOperation, setCurrentOperation] = useState<number>(persistedState?.currentOperation || 0);
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>(persistedState?.state || 'idle');
  const [totalViewers, setTotalViewers] = useState<number>(persistedState?.totalViewers || 0);
  
  // Refs para valores actuales
  const stateRef = useRef<'idle' | 'running' | 'paused' | 'completed'>(persistedState?.state || 'idle');
  const currentOperationRef = useRef<number>(persistedState?.currentOperation || 0);
  const totalViewersRef = useRef<number>(persistedState?.totalViewers || 0);
  
  // Actualizar refs cuando cambian los estados
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  useEffect(() => {
    currentOperationRef.current = currentOperation;
  }, [currentOperation]);
  
  useEffect(() => {
    totalViewersRef.current = totalViewers;
  }, [totalViewers]);
  
  // Configuración del bloque (inicializada con datos persistentes si existen)
  const savedConfig = persistedState?.config || defaultConfig;
  const [totalOperations, setTotalOperations] = useState(savedConfig.totalOperations);
  const [serviceId, setServiceId] = useState(savedConfig.serviceId);
  const [count, setCount] = useState(savedConfig.count);
  const [decrement, setDecrement] = useState(savedConfig.decrement);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>(savedConfig.operationType);
  const [autoStart, setAutoStart] = useState(savedConfig.autoStart);
  const [startTime, setStartTime] = useState(savedConfig.startTime);
  
  // Última configuración editada (separada de la configuración actual)
  const [lastEditedConfig, setLastEditedConfig] = useState<BlockConfig>(
    persistedState?.lastEditedConfig || defaultConfig
  );
  
  // Estados de UI
  const [showWarning, setShowWarning] = useState<{ type: string } | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editValues, setEditValues] = useState({
    operations: totalOperations,
    serviceId: serviceId,
    count: count,
    decrement: decrement,
    operationType: operationType,
    autoStart: autoStart,
    startTime: startTime
  });

  // Referencia para auto-start timeout
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Efecto para guardar estado cuando cambie
  useEffect(() => {
    const currentState: PersistedBlockState = {
      config: {
        totalOperations,
        serviceId,
        count,
        decrement,
        operationType,
        autoStart,
        startTime
      },
      lastEditedConfig,
      status,
      currentOperation,
      state,
      totalViewers,
      isPaused
    };
    
    savePersistedState(currentState);
  }, [status, currentOperation, state, totalViewers, isPaused, totalOperations, serviceId, count, decrement, operationType, autoStart, startTime, lastEditedConfig, savePersistedState]);
  
  // Notificar cambio de total viewers al cargar estado persistente
  useEffect(() => {
    if (persistedState?.totalViewers && onTotalViewersChange) {
      onTotalViewersChange(title, persistedState.totalViewers);
    }
  }, [onTotalViewersChange, title, persistedState?.totalViewers]);

  // Función para obtener duración del servicio
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

  // Función para generar Excel
  const generateExcel = useCallback(() => {
    try {
      console.log(`Generando Excel para el bloque: ${title}`);

      // Crear el resumen para el Excel
      const summary = status.map((status) => ({
        'Estado': status.status,
        'Mensaje': status.message,
        'Timestamp': status.timestamp,
        'Order ID': status.orderId,
        'Order Status': status.orderStatus,
        'Duración (minutos)': status.duration,
        'Cantidad de Viewers': status.count,
        'Costo de la Operación': status.details?.res?.sum || 0,
        ...status.details,
      }));

      // Generar intervalos de tiempo desde las 10:25 AM hasta las 23:00 PM
      const startTimeDate = new Date("1970-01-01T10:25:00Z");
      const endTimeDate = new Date("1970-01-01T23:00:00Z");
      const timeIntervals: { Hora: string; [key: string]: number | string }[] = [];

      let currentTime = new Date(startTimeDate);

      while (currentTime <= endTimeDate) {
        if (!isNaN(currentTime.getTime())) {
          timeIntervals.push({ Hora: currentTime.toISOString().substr(11, 5) });
        }
        currentTime = new Date(currentTime.getTime() + 60000);
      }

      // Crear una fila para los costos de cada operación
      const costRow: { Hora: string; [key: string]: number | string } = { Hora: 'Costo' };

      // Rellenar las columnas de cada operación
      status.forEach((statusItem) => {
        if (statusItem.status === 'success' && statusItem.count && statusItem.timestamp) {
          const operationStartTime = new Date(`1970-01-01T${statusItem.timestamp}Z`);
          if (!isNaN(operationStartTime.getTime())) {
            const startTimeString = operationStartTime.toISOString().substr(11, 5);
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
        }
      });

      const allRows = [costRow, ...timeIntervals];

      // Crear hojas en el libro de Excel
      const wsSummary = XLSX.utils.json_to_sheet(summary);
      const wsViewers = XLSX.utils.json_to_sheet(allRows);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen de Operaciones');
      XLSX.utils.book_append_sheet(wb, wsViewers, 'Viewers por Minuto');

      XLSX.writeFile(wb, `${title}.xlsx`);
      console.log(`Archivo Excel generado para el bloque: ${title}`);
    } catch (error) {
      console.error('Error al generar el archivo Excel:', error);
    }
  }, [title, status]);

  // Función para hacer llamada a la API
  const handleApiCall = useCallback(async () => {
    if (!link || stateRef.current !== 'running') {
      console.log(`${title}: Skipping API call - link: ${link}, state: ${stateRef.current}`);
      return;
    }

    try {
      // Calcular la cantidad para la operación actual
      const operationCount = operationType === 'add'
        ? count + decrement * currentOperationRef.current
        : count - decrement * currentOperationRef.current;

      console.log(`${title}: Starting operation ${currentOperationRef.current + 1} with count: ${operationCount}`);

      const response = await fetch(`/api/proxy?service_id=${serviceId}&count=${operationCount}&link=${encodeURIComponent(link)}`);
      const data = await response.json();
      const timestamp = new Date().toLocaleTimeString();
      const duration = getServiceDuration(serviceId);

      console.log(`${title}, Operation ${currentOperationRef.current + 1}:`, data);

      const newStatus: BlockStatus = {
        status: data.error ? 'error' : 'success',
        message: data.error ? 'Error en la operación' : 'Operación exitosa',
        details: data,
        timestamp,
        orderId: data.res?.order_id,
        duration,
        count: operationCount,
        serviceId,
      };

      setStatus(prev => [...prev, newStatus]);

      // Actualizar total de espectadores
      if (newStatus.status === 'success') {
        const newTotal = totalViewersRef.current + operationCount;
        setTotalViewers(newTotal);
        onTotalViewersChange?.(title, newTotal);
      }

      const nextOperation = currentOperationRef.current + 1;
      setCurrentOperation(nextOperation);

      // Verificar si completamos todas las operaciones
      if (nextOperation >= totalOperations) {
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        setState('completed');
        generateExcel();
      }

    } catch (error) {
      console.error(`${title}, Operation ${currentOperation + 1}:`, error);

      const newStatus: BlockStatus = {
        status: 'error',
        message: 'Error en la operación',
        details: error,
        timestamp: new Date().toLocaleTimeString(),
        duration: 0,
      };

      setStatus(prev => [...prev, newStatus]);
      const nextOperation = currentOperation + 1;
      setCurrentOperation(nextOperation);

      if (nextOperation >= totalOperations) {
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }
        setState('completed');
        generateExcel();
      }
    }
  }, [link, title, operationType, count, decrement, serviceId, totalOperations, intervalId, currentOperation, onTotalViewersChange, generateExcel]);

  // Funciones de control
  const startBlock = useCallback(() => {
    if (stateRef.current === 'running') {
      console.log(`${title}: Already running, skipping start`);
      return;
    }
    
    console.log(`${title}: Starting block`);
    setState('running');
    setIsPaused(false);
    
    // Ejecutar primera operación inmediatamente
    setTimeout(() => {
      handleApiCall();
    }, 100); // Pequeño delay para asegurar que el estado se actualice
    
    // Configurar intervalo para las siguientes operaciones
    const newIntervalId = setInterval(() => {
      handleApiCall();
    }, 120000); // 2 minutos
    setIntervalId(newIntervalId);
  }, [title, handleApiCall]);

  const pauseBlock = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsPaused(true);
    setState('paused');
  };

  const resumeBlock = () => {
    setIsPaused(false);
    setState('running');
    
    // Configurar intervalo y ejecutar inmediatamente
    const newIntervalId = setInterval(handleApiCall, 120000);
    setIntervalId(newIntervalId);
    handleApiCall();
  };

  const finalizeBlock = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (state !== 'completed') {
      setState('completed');
      generateExcel();
    }
    setAutoStart(false);
  };

  const resetBlock = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }
    
    // Restaurar a la última configuración editada, no a los valores por defecto
    setTotalOperations(lastEditedConfig.totalOperations);
    setServiceId(lastEditedConfig.serviceId);
    setCount(lastEditedConfig.count);
    setDecrement(lastEditedConfig.decrement);
    setOperationType(lastEditedConfig.operationType);
    setAutoStart(lastEditedConfig.autoStart);
    setStartTime(lastEditedConfig.startTime);
    
    // Resetear el estado de ejecución
    setStatus([]);
    setCurrentOperation(0);
    setState('idle');
    setTotalViewers(0);
    setIsPaused(false);
    
    onTotalViewersChange?.(title, 0);
    
    console.log(`${title}: Block reset to last edited configuration`);
  };

  // Manejo del modal de edición
  const handleEditBlock = () => {
    setEditValues({
      operations: totalOperations,
      serviceId: serviceId,
      count: count,
      decrement: decrement,
      operationType: operationType,
      autoStart: autoStart,
      startTime: startTime
    });
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    setTotalOperations(editValues.operations);
    setServiceId(editValues.serviceId);
    setCount(editValues.count);
    setDecrement(editValues.decrement);
    setOperationType(editValues.operationType);
    setAutoStart(editValues.autoStart);
    setStartTime(editValues.autoStart ? editValues.startTime : '');
    
    // Guardar como última configuración editada
    const newConfig: BlockConfig = {
      totalOperations: editValues.operations,
      serviceId: editValues.serviceId,
      count: editValues.count,
      decrement: editValues.decrement,
      operationType: editValues.operationType,
      autoStart: editValues.autoStart,
      startTime: editValues.autoStart ? editValues.startTime : ''
    };
    setLastEditedConfig(newConfig);
    
    setEditMode(false);
    
    console.log(`${title}: Configuration saved and stored as last edited config`);
  };

  // Auto-start effect
  useEffect(() => {
    if (autoStart && startTime && state === 'idle') {
      const [hours, minutes] = startTime.split(':').map(Number);
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
      const delay = start.getTime() - now.getTime();

      if (delay > 0) {
        autoStartTimeoutRef.current = setTimeout(() => {
          startBlock();
        }, delay);
      }
    }

    return () => {
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
    };
  }, [autoStart, startTime, state, startBlock]);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
      }
    };
  }, [intervalId]);

  // Función para limpiar estado persistente (útil para debugging o reset completo)
  const clearPersistedState = () => {
    try {
      localStorage.removeItem(getStorageKey());
      console.log(`${title}: Persistent state cleared`);
    } catch (error) {
      console.error(`Error clearing persisted state for ${title}:`, error);
    }
  };
  
  return (
    <>
      <div className={`block ${theme}`}>
        <h2 className="block-title">{title}</h2>
        {autoStart && startTime && (
          <div className="auto-start-info">
            ⏰ Inicio automático: {startTime}
          </div>
        )}
        {(state === 'paused' || state === 'completed') && (
          <button onClick={generateExcel} className="download-icon">
            <span className="icon-download"></span>
          </button>
        )}
        <div className="status">
          {Array.from({ length: totalOperations }).map((_, statusIndex) => (
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
            <>
              <button 
                onClick={startBlock} 
                className="start-button"
                disabled={!link}
                title={!link ? 'Ingresa un link de YouTube para iniciar' : ''}
              >
                ▶️ Iniciar
              </button>
              <button onClick={handleEditBlock} className="edit-button">
                ✏️ Editar
              </button>
            </>
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
              <button onClick={() => setShowWarning({ type: 'finalizar' })} className="finalize-button">
                🏁 Finalizar
              </button>
              <button onClick={() => setShowWarning({ type: 'reiniciar' })} className="reset-button">
                🔄 Reiniciar
              </button>
            </>
          )}
          
          {state === 'completed' && (
            <>
              <div className="completed-message">✅ Bloque finalizado</div>
              <button onClick={() => setShowWarning({ type: 'reiniciar' })} className="reset-button">
                🔄 Reiniciar
              </button>
            </>
          )}
        </div>
        <div className="total-viewers">👥 {totalViewers}</div>
      </div>

      {/* Modal de confirmación */}
      {showWarning && (
        <div className="warning-modal">
          <div className={`warning-content ${theme}`}>
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-bold mb-4">
                {showWarning.type === 'finalizar' ? '🏁 Finalizar Bloque' : '🔄 Reiniciar Bloque'}
              </h3>
              <p className="mb-6">
                Estás por {showWarning.type === 'finalizar' ? 'finalizar' : 'reiniciar'} este bloque de operaciones.
                <br />
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => {
                  if (showWarning.type === 'finalizar') {
                    finalizeBlock();
                  } else {
                    resetBlock();
                  }
                  setShowWarning(null);
                }} className="continue-button">
                  ✅ Continuar
                </button>
                <button 
                  onClick={() => {
                    clearPersistedState();
                    // Recargar la página para aplicar el reset completo
                    window.location.reload();
                  }} 
                  className="continue-button"
                  style={{ backgroundColor: '#dc3545' }}
                >
                  Reset completo (limpiar todo)
                </button>
                <button onClick={() => setShowWarning(null)} className="cancel-button">
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {editMode && (
        <div className="modal">
          <div className={`modal-content ${theme}`}>
            <h2>✏️ Editar Bloque</h2>
            <div className="grid grid-cols-1 gap-4">
              <label>
                🔢 Cantidad de Operaciones:
                <input
                  type="number"
                  value={editValues.operations}
                  onChange={(e) => setEditValues(prev => ({ ...prev, operations: Number(e.target.value) }))}
                  className={`input-${theme}`}
                />
              </label>
              <label>
                ⏱️ Duración:
                <select
                  value={editValues.serviceId}
                  onChange={(e) => setEditValues(prev => ({ ...prev, serviceId: Number(e.target.value) }))}
                  className={`input-${theme}`}
                >
                  <option value={334}>1h</option>
                  <option value={335}>1.30h</option>
                  <option value={336}>2h</option>
                  <option value={337}>2.30h</option>
                  <option value={338}>3h</option>
                  <option value={459}>4h</option>
                  <option value={460}>6h</option>
                  <option value={657}>8h</option>
                </select>
              </label>
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  � Solo múltiplos de 10 (ej: 30, 40, 100, 150...)
                </p>
              </div>
              <label>
                👥 Cantidad:
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={editValues.count}
                  onChange={(e) => setEditValues(prev => ({ ...prev, count: Number(e.target.value) }))}
                  className={`input-${theme} ${editValues.count % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>
              <label>
                ➕➖ Cantidad a Modificar:
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={editValues.decrement}
                  onChange={(e) => setEditValues(prev => ({ ...prev, decrement: Number(e.target.value) }))}
                  className={`input-${theme} ${editValues.decrement % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>
              <label>
                🔄 Operación:
                <select
                  value={editValues.operationType}
                  onChange={(e) => setEditValues(prev => ({ ...prev, operationType: e.target.value as 'add' | 'subtract' }))}
                  className={`input-${theme}`}
                >
                  <option value="add">➕ Sumar</option>
                  <option value="subtract">➖ Restar</option>
                </select>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editValues.autoStart}
                  onChange={(e) => setEditValues(prev => ({ ...prev, autoStart: e.target.checked }))}
                  className="w-5 h-5"
                />
                <span>🕐 Inicio Automático</span>
              </label>
              {editValues.autoStart && (
                <label>
                  ⏰ Hora de Inicio:
                  <input
                    type="time"
                    value={editValues.startTime}
                    onChange={(e) => setEditValues(prev => ({ ...prev, startTime: e.target.value }))}
                    className={`input-${theme}`}
                  />
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} className="save-button">
                💾 Guardar
              </button>
              <button onClick={() => setEditMode(false)} className="cancel-button">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IndependentBlock;
