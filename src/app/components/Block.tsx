import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { useSession } from 'next-auth/react';
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
  startTime?: string;
  estimatedEndTime?: string;
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
  intervalMinutes: number; // Intervalo personalizable en minutos (1-5)
}

interface BlockProps {
  initialData: BlockData;
  link: string;
  onTotalViewersChange: (blockId: string, totalViewers: number) => void;
  blockId: string;
  onShowWarning: (blockId: string, warningType: string) => void;
  onShowEditModal: (blockId: string, blockData: BlockData) => void;
  isRecentlyEdited?: boolean;
}

const Block: React.FC<BlockProps> = ({ initialData, link, onTotalViewersChange, blockId, onShowWarning, onShowEditModal, isRecentlyEdited = false }) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  
  // Estado para minimizar/expandir - por defecto minimizado
  const [isMinimized, setIsMinimized] = useState(true);
  
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
  
  const [blockStartTime, setBlockStartTime] = useState(() => {
    const savedState = loadBlockState();
    return savedState?.blockStartTime || null;
  });
  
  const [blockData, setBlockData] = useState<BlockData>(() => {
    const savedState = loadBlockState();
    const data = savedState?.blockData || initialData;
    // Asegurar que intervalMinutes tenga un valor por defecto
    if (!data.intervalMinutes) {
      data.intervalMinutes = 2; // 2 minutos por defecto
    }
    return data;
  });
  
  // Función para guardar estado en localStorage
  const saveBlockState = useCallback(() => {
    const stateToSave = {
      status,
      currentOperation,
      state,
      totalViewers,
      blockData,
      blockStartTime,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem(`blockState_${blockId}`, JSON.stringify(stateToSave));
  }, [blockId, status, currentOperation, state, totalViewers, blockData, blockStartTime]);

  // Guardar estado cada vez que cambie algún valor importante
  useEffect(() => {
    saveBlockState();
  }, [status, currentOperation, state, totalViewers, blockData, blockStartTime, saveBlockState]);
  
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
        blockStartTime: blockStartTime,
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

  // Calcular duración total estimada del bloque
  const getTotalEstimatedDuration = useCallback(() => {
    const operationInterval = blockData.intervalMinutes || 2;
    const totalDurationMinutes = (blockData.totalOperations - 1) * operationInterval;
    const hours = Math.floor(totalDurationMinutes / 60);
    const minutes = totalDurationMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }, [blockData.totalOperations, blockData.intervalMinutes]);

  // Calcular tiempo restante basado en operaciones pendientes
  const getRemainingTime = useCallback(() => {
    const operationsRemaining = blockData.totalOperations - currentOperation;
    
    if (operationsRemaining <= 0) {
      return "✅ Completado";
    }
    
    if (state === 'idle') {
      // Si no ha empezado, mostrar tiempo total
      return getTotalEstimatedDuration();
    }
    
    const operationInterval = blockData.intervalMinutes || 2;
    // Para las operaciones restantes, el tiempo es: (operaciones_restantes - 1) * intervalo
    // porque la última operación no necesita esperar el intervalo
    const remainingMinutes = Math.max(0, (operationsRemaining - 1) * operationInterval);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `⏳ ${hours}h ${minutes}m restante` : `⏳ ${hours}h restante`;
    }
    return minutes > 0 ? `⏳ ${minutes}m restante` : `⏳ Última operación`;
  }, [blockData.totalOperations, blockData.intervalMinutes, currentOperation, state, getTotalEstimatedDuration]);

  // Obtener duración de operación individual configurada
  const getOperationDuration = useCallback(() => {
    const duration = getServiceDuration(blockData.serviceId);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }, [blockData.serviceId]);

  // Calcular progreso del bloque
  const getProgress = useCallback(() => {
    const percentage = blockData.totalOperations > 0 ? (currentOperation / blockData.totalOperations) * 100 : 0;
    return Math.min(percentage, 100);
  }, [currentOperation, blockData.totalOperations]);

  // Formatear hora de inicio del bloque
  const getFormattedStartTime = useCallback(() => {
    if (!blockStartTime) return null;
    const date = new Date(blockStartTime);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }, [blockStartTime]);

  // Obtener estado resumido para vista minimizada
  const getSummaryStatus = useCallback(() => {
    const successCount = status.filter(s => s.status === 'success').length;
    const errorCount = status.filter(s => s.status === 'error').length;
    const totalCost = status.reduce((sum, s) => sum + (s.cost || 0), 0);
    
    return {
      success: successCount,
      errors: errorCount,
      totalCost: totalCost.toFixed(2),
      progress: getProgress()
    };
  }, [status, getProgress]);

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

  // Función para guardar operación en la base de datos (historial de operaciones)
  const saveOperationToDatabase = useCallback(async (operationData: BlockStatus) => {
    console.log('🔍 saveOperationToDatabase called with:', {
      hasSession: !!session,
      userId: session?.user?.id,
      operationStatus: operationData.status,
      operationCount: operationData.count,
      blockTitle: blockData.title,
      sessionData: session // 🆕 Log completo de la sesión
    });

    if (!session?.user?.id) {
      console.warn('⚠️ No user session available, operation not saved to database');
      console.log('📋 Session status:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasUserId: !!session?.user?.id,
        userData: session?.user,
        fullSession: session // 🆕 Log completo de la sesión
      });
      return;
    }

    const requestData = {
      userId: session.user.id,
      blockId: blockId,
      blockTitle: blockData.title,
      operationType: blockData.operationType,
      viewers: operationData.count || 0,
      orderId: operationData.orderId,
      orderStatus: operationData.orderStatus,
      duration: operationData.duration,
      cost: operationData.cost,
      serviceId: operationData.serviceId,
      message: operationData.message,
      timestamp: operationData.startTime || new Date().toISOString(),
    };

    console.log('📤 Enviando datos a la BD:', requestData);

    try {
      console.log('🌐 Enviando request a /api/operations-history...');
      const response = await fetch('/api/operations-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save operation to database:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText,
          url: response.url,
          requestData: requestData
        });
      } else {
        const result = await response.json();
        console.log('✅ Operation saved to history successfully:', {
          operationId: result.operation?.id,
          response: result
        });
      }
    } catch (error) {
      console.error('❌ Network error saving operation to database:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        requestData: requestData
      });
    }
  }, [session?.user?.id, blockId, blockData.title, blockData.operationType]);

  const handleApiCall = useCallback(async () => {
    // Verificar condiciones usando refs para valores actuales
    if (stateRef.current !== 'running') {
      console.log(`${blockDataRef.current.title}: No ejecutando API call. State: "${stateRef.current}"`);
      return;
    }

    if (!link) {
      console.log(`${blockDataRef.current.title}: ⚠️ Sin link configurado, pero manteniendo estado running`);
      return; // Solo retornar, mantener el estado running
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
      
      // Calcular hora de finalización estimada
      const startTime = now.toISOString();
      const estimatedEndTime = new Date(now.getTime() + (duration * 60 * 1000)).toISOString();

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
        startTime,
        estimatedEndTime,
      };

      setStatus(prev => [...prev, newStatus]);
      
      // Guardar en historial global inmediatamente
      saveToGlobalHistory(newStatus);

      // 🆕 GUARDAR TODAS LAS OPERACIONES EN HISTORIAL DE BD (exitosas y fallidas)
      console.log(`🔄 Intentando guardar operación en BD - Status: ${newStatus.status}`);
      await saveOperationToDatabase(newStatus);

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

      const now = new Date();
      const newStatus: BlockStatus = {
        status: 'error',
        message: 'Error en la operación',
        details: error,
        timestamp: now.toTimeString().split(' ')[0], // Formato consistente HH:MM:SS
        duration: 0,
        cost: 0,
        startTime: now.toISOString(),
        estimatedEndTime: now.toISOString(), // Sin duración para errores
      };

      setStatus(prev => [...prev, newStatus]);
      
      // Guardar en historial global inmediatamente
      saveToGlobalHistory(newStatus);
      
      // Error en operación - solo se registra localmente
      
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

    // Capturar la hora de inicio del bloque
    const startTime = new Date().toISOString();
    setBlockStartTime(startTime);

    setIsPaused(false);
    setState('running');
    
    // Actualizar el ref inmediatamente para que handleApiCall lo detecte
    stateRef.current = 'running';

    // Enviar la primera operación inmediatamente
    handleApiCall();

    // Configurar el intervalo para las siguientes operaciones usando el intervalo personalizado
    const intervalMs = (blockDataRef.current.intervalMinutes || 2) * 60 * 1000; // Convertir minutos a millisegundos
    const newIntervalId = setInterval(() => handleApiCall(), intervalMs);
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

    // Reiniciar el intervalo usando el intervalo personalizado
    const intervalMs = (blockDataRef.current.intervalMinutes || 2) * 60 * 1000;
    const newIntervalId = setInterval(handleApiCall, intervalMs);
    intervalRef.current = newIntervalId;
    setIntervalId(newIntervalId);
  };

  const finalizeBlock = useCallback(() => {
    console.log(`🏁 Finalizando bloque ${blockData.title}, estado actual: ${state}`);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIntervalId(null);
    }
    if (state !== 'completed') {
      console.log(`🏁 Cambiando estado de ${state} a completed`);
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
    } else {
      console.log(`🏁 Bloque ya estaba completado, no se realizó cambio de estado`);
    }
    setBlockData(prev => ({ ...prev, autoStart: false }));
  }, [state, blockData.title, totalViewers, generateExcel]);

  const resetBlock = useCallback(async () => {
    // Registrar el reset del bloque con las operaciones que se van a perder
    saveBlockReset();
    
    // Ejecutar la lógica de reset
    performReset();
  }, [blockId, blockData.title]);

  // 🆕 Reset silencioso (sin guardar en BD) - para Reset All
  const resetBlockSilent = useCallback(() => {
    // Solo limpiar estado local, NO guardar en base de datos ni historial
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
    setBlockStartTime(null);
    setBlockData(prev => ({ ...prev, autoStart: false, startTime: '' }));
    
    // Limpiar estado guardado del localStorage
    localStorage.removeItem(`blockState_${blockId}`);
  }, [blockId]);

  // Función común para ejecutar la lógica de reset
  const performReset = useCallback(() => {
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
    setBlockStartTime(null);
    setBlockData(prev => ({ ...prev, autoStart: false, startTime: '' }));
    
    // Limpiar estado guardado del localStorage
    localStorage.removeItem(`blockState_${blockId}`);
  }, [blockId]);

  const handleEditModal = () => {
    onShowEditModal(blockId, blockData);
  };

  // Función para actualizar blockData desde el componente padre
  const updateBlockData = useCallback((newData: BlockData) => {
    setBlockData(newData);
  }, []);

  // Exponer funciones al componente padre mediante efectos
  React.useEffect(() => {
    (window as any)[`updateBlockData_${blockId}`] = updateBlockData;
    (window as any)[`finalizeBlock_${blockId}`] = finalizeBlock;
    (window as any)[`resetBlock_${blockId}`] = resetBlock;
    (window as any)[`resetBlockSilent_${blockId}`] = resetBlockSilent; // 🆕 Reset sin BD
    return () => {
      delete (window as any)[`updateBlockData_${blockId}`];
      delete (window as any)[`finalizeBlock_${blockId}`];
      delete (window as any)[`resetBlock_${blockId}`];
      delete (window as any)[`resetBlockSilent_${blockId}`]; // 🆕 Limpiar
    };
  }, [blockId, updateBlockData, finalizeBlock, resetBlock, resetBlockSilent]);

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
    
    // Calcular operaciones exitosas enviadas y viewers enviados
    const successfulOperations = status.filter(op => op.status === 'success');
    const totalViewersSent = successfulOperations.reduce((sum, op) => sum + (op.count || 0), 0);
    
    console.log('📊 Registrando reset del bloque:', {
      blockId,
      blockTitle: blockData.title,
      totalOperations: status.length,
      successfulOperations: successfulOperations.length,
      totalViewers: totalViewers,
      calculatedViewers: totalViewersSent
    });
    
    const resetRecord = {
      blockId,
      blockTitle: blockData.title,
      resetAt: new Date().toISOString(),
      operationsLost: successfulOperations.length,  // Operaciones exitosas enviadas
      viewersLost: totalViewersSent,               // Viewers enviados de operaciones exitosas
      totalOperations: status.length,             // Total de operaciones realizadas
      totalViewers: totalViewers                  // Total de viewers del bloque
    };
    
    resets.push(resetRecord);
    
    // Mantener solo los últimos 100 resets
    if (resets.length > 100) {
      resets = resets.slice(-100);
    }
    
    localStorage.setItem(resetHistoryKey, JSON.stringify(resets));
    
    console.log('✅ Reset registrado:', resetRecord);
  }, [blockId, blockData.title, status, totalViewers]);

  const summaryStatus = getSummaryStatus();

  return (
    <div className={`block ${theme} ${isMinimized ? 'minimized' : 'expanded'} ${isRecentlyEdited ? 'recently-edited' : ''}`}>
      <div className="block-header">
        <h2 className="block-title">{blockData.title}</h2>
        <div className="auth-status-container">
          <span className={`auth-indicator ${session?.user?.id ? 'authenticated' : 'not-authenticated'}`}>
            {session?.user?.id ? '🟢 BD Conectada' : '🔴 Solo localStorage'}
          </span>
        </div>
        <div className="block-header-buttons">
          {(state === 'paused' || state === 'completed') && !isMinimized && (
            <button onClick={generateExcel} className="download-icon">
              📊 Excel
            </button>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)} 
            className="minimize-toggle"
            title={isMinimized ? "Expandir" : "Minimizar"}
          >
            {isMinimized ? '📈 Expandir' : '📉 Minimizar'}
          </button>
        </div>
      </div>

      {isMinimized ? (
        // Vista ultra minimizada - Layout en columnas
        <div className="block-ultra-minimized">
          <div className="ultra-compact-header">
            <div className="progress-micro">
              <div 
                className="progress-fill-micro" 
                style={{ width: `${summaryStatus.progress}%` }}
              ></div>
            </div>
            <span className="progress-label">{currentOperation}/{blockData.totalOperations}</span>
            {getFormattedStartTime() && (
              <span className="start-time-label" title="Hora de inicio del bloque">
                🕒 {getFormattedStartTime()}
              </span>
            )}
          </div>

          <div className="ultra-compact-body">
            <div className="ultra-stats-column">
              <div className="stat-group">
                <label className="stat-label">Viewers:</label>
                <span className="stat-value viewers-highlight">👥 {totalViewers}</span>
              </div>
              <div className="stat-group">
                <label className="stat-label">Éxito:</label>
                <span className="stat-value success">✅ {summaryStatus.success}</span>
              </div>
              {summaryStatus.errors > 0 && (
                <div className="stat-group">
                  <label className="stat-label">Errores:</label>
                  <span className="stat-value error">❌ {summaryStatus.errors}</span>
                </div>
              )}
              <div className="stat-group">
                <label className="stat-label">Costo:</label>
                <span className="stat-value">💰 ${summaryStatus.totalCost}</span>
              </div>
            </div>

            <div className="ultra-duration-column">
              <div className="duration-group">
                <label className="duration-label">Intervalo:</label>
                <span className="duration-value">🔄 {blockData.intervalMinutes || 2}m</span>
              </div>
              <div className="duration-group">
                <label className="duration-label">Duración Op:</label>
                <span className="duration-value">⏱️ {getOperationDuration()}</span>
              </div>
              <div className="duration-group">
                <label className="duration-label">Tiempo Restante:</label>
                <span className="duration-value" title="Tiempo estimado restante para completar el bloque">
                  📅 {getRemainingTime()}
                </span>
              </div>
            </div>
          </div>

          <div className="ultra-compact-controls">
            {state === 'idle' && (
              <>
                <button onClick={startBlock} className="micro-btn start" title="Iniciar">
                  ▶️ Iniciar
                </button>
                <button onClick={handleEditModal} className="micro-btn edit" title="Editar">
                  ✏️ Editar
                </button>
              </>
            )}
            
            {state === 'running' && (
              <>
                <button onClick={pauseBlock} className="micro-btn pause" title="Pausar">
                  ⏸️ Pausar
                </button>
                <button onClick={handleEditModal} className="micro-btn edit" title="Editar">
                  ✏️ Editar
                </button>
              </>
            )}
            
            {state === 'paused' && (
              <>
                <button onClick={resumeBlock} className="micro-btn resume" title="Reanudar">
                  ▶️ Reanudar
                </button>
                <button onClick={() => onShowWarning(blockId, 'finalizar')} className="micro-btn finalize" title="Finalizar">
                  🏁 Finalizar
                </button>
                <button onClick={() => onShowWarning(blockId, 'reiniciar')} className="micro-btn reset" title="Reiniciar">
                  🔄 Reiniciar
                </button>
                <button onClick={handleEditModal} className="micro-btn edit" title="Editar">
                  ✏️ Editar
                </button>
                <button onClick={generateExcel} className="micro-btn download" title="Descargar Excel">
                  📊 Excel
                </button>
              </>
            )}
            
            {state === 'completed' && (
              <>
                <span className="micro-completed">✅ Completado</span>
                <button onClick={() => onShowWarning(blockId, 'reiniciar')} className="micro-btn reset" title="Reiniciar">
                  🔄 Reiniciar
                </button>
                <button onClick={handleEditModal} className="micro-btn edit" title="Editar">
                  ✏️ Editar
                </button>
                <button onClick={generateExcel} className="micro-btn download" title="Descargar Excel">
                  📊 Excel
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        // Vista expandida (original pero más compacta)
        <>
          <div className="block-info">
            <div className="info-row">
              <span className="duration-info" title="Tiempo entre cada operación">
                🔄 Intervalo: {blockData.intervalMinutes || 2} min{(blockData.intervalMinutes || 2) > 1 ? 'utos' : 'uto'}
              </span>
              <span className="operation-duration-info" title="Duración estimada por operación">
                ⏱️ Duración Op: {getOperationDuration()}
              </span>
              <span className="total-duration-info" title="Tiempo estimado restante para completar el bloque">
                📅 {getRemainingTime()}
              </span>
              {getFormattedStartTime() && (
                <span className="start-time-info" title="Hora de inicio del bloque">
                  🕒 Iniciado: {getFormattedStartTime()}
                </span>
              )}
            </div>
            
            {blockData.autoStart && blockData.startTime && (
              <div className="auto-start-info">
                ⏰ Inicio automático: {blockData.startTime}
              </div>
            )}
            
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${summaryStatus.progress}%` }}
                ></div>
                <span className="progress-text">
                  {currentOperation}/{blockData.totalOperations} operaciones ({summaryStatus.progress.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="status-compact">
            <div className="status-summary">
              <span className="summary-item success" title="Operaciones completadas exitosamente">✅ Éxito: {summaryStatus.success}</span>
              <span className="summary-item error" title="Operaciones con errores">❌ Errores: {summaryStatus.errors}</span>
              <span className="summary-item cost" title="Costo total acumulado">💰 Costo: ${summaryStatus.totalCost}</span>
            </div>
            
            <details className="status-details">
              <summary>Ver detalles de operaciones</summary>
              <div className="status-list">
                {Array.from({ length: blockData.totalOperations }).map((_, statusIndex) => (
                  <div key={statusIndex} className="status-item">
                    {`Op ${statusIndex + 1}: `}
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
            </details>
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

          <div className="total-viewers">👥 {totalViewers} viewers totales</div>
        </>
      )}
    </div>
  );
};

export default Block;
