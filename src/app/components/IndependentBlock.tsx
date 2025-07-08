import React, { useState, useEffect, useRef } from 'react';
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

export interface IndependentBlockProps {
  title: string;
  link: string;
  onTotalViewersChange?: (title: string, viewers: number) => void;
  initialConfig?: {
    totalOperations?: number;
    serviceId?: number;
    count?: number;
    decrement?: number;
    operationType?: 'add' | 'subtract';
    autoStart?: boolean;
    startTime?: string;
  };
}

const IndependentBlock: React.FC<IndependentBlockProps> = ({
  title,
  link,
  onTotalViewersChange,
  initialConfig = {}
}) => {
  const { theme } = useTheme();
  
  // Estados del bloque independiente
  const [status, setStatus] = useState<BlockStatus[]>([]);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<number>(0);
  const [state, setState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const [totalViewers, setTotalViewers] = useState<number>(0);
  
  // Refs para valores actuales
  const stateRef = useRef<'idle' | 'running' | 'paused' | 'completed'>('idle');
  const currentOperationRef = useRef<number>(0);
  const totalViewersRef = useRef<number>(0);
  
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
  
  // Configuración del bloque
  const [totalOperations, setTotalOperations] = useState(initialConfig.totalOperations || 35);
  const [serviceId, setServiceId] = useState(initialConfig.serviceId || 335);
  const [count, setCount] = useState(initialConfig.count || 100);
  const [decrement, setDecrement] = useState(initialConfig.decrement || 50);
  const [operationType, setOperationType] = useState<'add' | 'subtract'>(initialConfig.operationType || 'subtract');
  const [autoStart, setAutoStart] = useState(initialConfig.autoStart || false);
  const [startTime, setStartTime] = useState(initialConfig.startTime || '');
  
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
  const generateExcel = () => {
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
  };

  // Función para hacer llamada a la API
  const handleApiCall = async () => {
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
  };

  // Funciones de control
  const startBlock = () => {
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
  };

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
    
    setStatus([]);
    setCurrentOperation(0);
    setState('idle');
    setTotalViewers(0);
    setIsPaused(false);
    setAutoStart(false);
    setStartTime('');
    
    onTotalViewersChange?.(title, 0);
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
    setEditMode(false);
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
  }, [autoStart, startTime, state]);

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
  }, []);

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
            <button 
              onClick={startBlock} 
              className="start-button"
              disabled={!link}
              title={!link ? 'Ingresa un link de YouTube para iniciar' : ''}
            >
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
          <button onClick={handleEditBlock} className="edit-button">
            ✏️ Editar
          </button>
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
                  💡 Solo múltiplos de 10 (ej: 30, 40, 100, 150...)
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
