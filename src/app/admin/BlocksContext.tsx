import React, { createContext, useState, useEffect, useContext } from 'react';
import * as XLSX from 'xlsx';

interface BlockStatus {
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

interface Block {
  status: BlockStatus[];
  intervalId: NodeJS.Timeout | null;
  isPaused: boolean;
  currentOperation: number;
  state: 'idle' | 'running' | 'paused' | 'completed';
  totalOperations: number;
  title: string;
  totalViewers: number;
  serviceId: number;
  count: number;
}

interface BlocksContextProps {
  blocks: Block[];
  link: string;
  setLink: (link: string) => void;
  startBlock: (index: number) => void;
  pauseBlock: (index: number) => void;
  resumeBlock: (index: number) => void;
  finalizeBlock: (index: number) => void;
  resetBlock: (index: number) => void;
  generateExcel: (block: Block) => void;
  editBlock: (index: number, updates: Partial<Block>) => void;
  editOperation: (blockIndex: number, statusIndex: number, updates: Partial<BlockStatus>) => void;
}

const BlocksContext = createContext<BlocksContextProps | undefined>(undefined);

export const BlocksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [link, setLink] = useState<string>(() => localStorage.getItem('link') || '');
  const [blocks, setBlocks] = useState<Block[]>(() => {
    const savedBlocks = localStorage.getItem('blocks');
    return savedBlocks ? JSON.parse(savedBlocks) : [
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Programa: Tengo capturas', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 10, title: 'Programa: Rumis', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 15, title: 'Programa: Circuito cerrado', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 20, title: 'Programa: Madres 5G', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 25, title: 'Jugate', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 30, title: 'Corte y queda', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 20, title: 'Adicionales 1', totalViewers: 0, serviceId: 335, count: 100 },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 20, title: 'Adicionales 2', totalViewers: 0, serviceId: 335, count: 100 },
    ];
  });

  useEffect(() => {
    localStorage.setItem('blocks', JSON.stringify(blocks));
  }, [blocks]);

  useEffect(() => {
    localStorage.setItem('link', link);
  }, [link]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const newBlocks = blocks.map(block => {
        if (block.state === 'running') {
          clearInterval(block.intervalId!);
          return { ...block, intervalId: null, isPaused: true, state: 'paused' as 'paused' };
        }
        return block;
      });
      localStorage.setItem('blocks', JSON.stringify(newBlocks));
      localStorage.setItem('link', link);
      setBlocks(newBlocks);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [blocks, link]);

  const checkOrderStatus = async (orderId: number) => {
    try {
      const response = await fetch(`/api/proxystatus?id=${orderId}`);
      const data = await response.json();
      return data.status;
    } catch (error) {
      console.error('Error fetching order status:', error);
      return 'Error';
    }
  };

  const getServiceDuration = (serviceId: number) => {
    switch (serviceId) {
      case 336:
        return 120;
      case 337:
        return 150;
      case 334:
        return 60;
      case 335:
        return 90;
      case 338:
        return 180;
      case 459:
        return 240;
      case 460:
        return 360;
      case 657:
        return 480;  
      default:
        return 0;
    }
  };

  const generateExcel = (block: Block) => {
    // Crear el resumen para el Excel
    const summary = block.status.map((status) => ({
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
    const startTime = new Date("1970-01-01T10:25:00Z");
    const endTime = new Date("1970-01-01T23:00:00Z");
    const timeIntervals: { Hora: string; [key: string]: number | string }[] = [];

    let currentTime = new Date(startTime);

    // Inicializar el arreglo de intervalos de tiempo
    while (currentTime <= endTime) {
      timeIntervals.push({ Hora: currentTime.toISOString().substr(11, 5) });
      currentTime = new Date(currentTime.getTime() + 60000); // Incremento de 1 minuto
    }

    // Crear una fila para los costos de cada operación (primera fila del Excel)
    const costRow: { Hora: string; [key: string]: number | string } = { Hora: 'Costo' };

    // Rellenar las columnas de cada operación
    block.status.forEach((status) => {
      if (status.status === 'success' && status.count && status.timestamp) {
        const operationStartTime = new Date(`1970-01-01T${status.timestamp}Z`);
        const startTimeString = operationStartTime.toISOString().substr(11, 5);
        const duration = status.duration || 0;
        const orderIdColumn = `Operación ${status.orderId}`;

        // Añadir el costo de la operación en la fila de costos
        if (!(orderIdColumn in costRow)) {
          costRow[orderIdColumn] = status.details?.res?.sum || 0;
        }

        // Crear una columna para esta operación en los intervalos de tiempo si no existe
        timeIntervals.forEach((interval) => {
          if (!(orderIdColumn in interval)) {
            interval[orderIdColumn] = '';
          }
        });

        // Encontrar el índice de la hora de inicio de la operación en los intervalos de tiempo
        const startIndex = timeIntervals.findIndex((entry) => entry.Hora === startTimeString);

        // Rellenar los datos en los intervalos correspondientes
        if (startIndex !== -1) {
          for (let i = 0; i < duration && startIndex + i < timeIntervals.length; i++) {
            timeIntervals[startIndex + i][orderIdColumn] = status.count;
          }
        }
      }
    });

    // Añadir la fila de costos al inicio del arreglo de intervalos
    const allRows = [costRow, ...timeIntervals];

    // Crear hojas en el libro de Excel
    const wsSummary = XLSX.utils.json_to_sheet(summary);
    const wsViewers = XLSX.utils.json_to_sheet(allRows);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen de Operaciones');
    XLSX.utils.book_append_sheet(wb, wsViewers, 'Viewers por Minuto');

    XLSX.writeFile(wb, `${block.title}.xlsx`);
  };

  const handleApiCall = async (index: number) => {
    if (!link || blocks[index].state !== 'running') return;
  
    try {
      const { count, serviceId } = blocks[index]; // Usar los parámetros count y serviceId del bloque
      const response = await fetch(`/api/proxy?service_id=${serviceId}&count=${count}&link=${link}`);
      const data = await response.json();
      const timestamp = new Date().toLocaleTimeString();
      const duration = getServiceDuration(serviceId); // Obtener la duración en función del serviceId o usar una duración de prueba
  
      console.log(`Block ${index + 1}, Operation ${blocks[index].currentOperation + 1}:`, data);
  
      const newStatus: BlockStatus = {
        status: data.error ? 'error' : 'success', // Verificar si hay un error en la respuesta
        message: data.error ? 'Error en la operación' : 'Operación exitosa',
        details: data,
        timestamp,
        orderId: data.res.order_id,
        duration,
        count: count, // Generar viewers de prueba si no hay count
        serviceId: serviceId, // Generar serviceId de prueba si no hay serviceId
      };
  
      const newBlocks = [...blocks];
      newBlocks[index].status.push(newStatus);
      newBlocks[index].currentOperation += 1;
  
      if (newStatus.status === 'success') {
        const newTotalViewers = newBlocks[index].totalViewers + (newStatus.count || 0); // Usar el campo count
        newBlocks[index].totalViewers = newTotalViewers;
  
        const intervalId = setInterval(async () => {
          if (newBlocks[index].state !== 'running') return; // Verificar si el bloque sigue en estado 'running'
          const orderStatus = await checkOrderStatus(newStatus.orderId!);
          const updatedBlocks = [...newBlocks];
          const operationIndex = updatedBlocks[index].status.findIndex((op) => op.orderId === newStatus.orderId);
          if (operationIndex !== -1) {
            updatedBlocks[index].status[operationIndex].orderStatus = orderStatus;
            setBlocks(updatedBlocks);
          }
        }, 120000); // Cambiar a 2 minutos
        newBlocks[index].intervalId = intervalId;
      }
  
      if (newBlocks[index].currentOperation >= newBlocks[index].totalOperations) {
        clearInterval(newBlocks[index].intervalId!);
        newBlocks[index].intervalId = null;
        newBlocks[index].state = 'completed' as 'completed';
        generateExcel(newBlocks[index]);
      }
  
      setBlocks(newBlocks);
    } catch (error) {
      console.log(`Block ${index + 1}, Operation ${blocks[index].currentOperation + 1}:`, error);
  
      const newStatus: BlockStatus = {
        status: 'error',
        message: 'Error en la operación',
        details: error,
        timestamp: new Date().toLocaleTimeString(),
        duration: 0, // Duración de prueba en caso de error
      };
  
      const newBlocks = [...blocks];
      newBlocks[index].status.push(newStatus);
      newBlocks[index].currentOperation += 1;
  
      if (newBlocks[index].currentOperation >= newBlocks[index].totalOperations) {
        clearInterval(newBlocks[index].intervalId!);
        newBlocks[index].intervalId = null;
        newBlocks[index].state = 'completed';
        generateExcel(newBlocks[index]);
      }
  
      setBlocks(newBlocks);
    }
  };

  const startBlock = (index: number) => {
    const intervalId = setInterval(() => handleApiCall(index), 120000); // Cambiar a 2 minutos
    const newBlocks = [...blocks];
    newBlocks[index].intervalId = intervalId;
    newBlocks[index].isPaused = false;
    newBlocks[index].state = 'running' as 'running';
    setBlocks(newBlocks);
    handleApiCall(index);
  };

  const pauseBlock = (index: number) => {
    const newBlocks = [...blocks];
    if (newBlocks[index].intervalId) {
      clearInterval(newBlocks[index].intervalId);
      newBlocks[index].intervalId = null;
      newBlocks[index].isPaused = true;
      newBlocks[index].state = 'paused' as 'paused';
    }
    setBlocks(newBlocks);
  };

  const resumeBlock = (index: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      newBlocks[index].isPaused = false;
      newBlocks[index].state = 'running' as 'running';
  
      // Enviar la siguiente operación inmediatamente después de reanudar
      handleApiCall(index);
  
      // Configurar el intervalo para las siguientes operaciones
      const intervalId = setInterval(() => handleApiCall(index), 120000); // Reiniciar el intervalo a 2 minutos
      newBlocks[index].intervalId = intervalId;
  
      return newBlocks;
    });
  };

  const finalizeBlock = (index: number) => {
    const newBlocks = [...blocks];
    if (newBlocks[index].intervalId) {
      clearInterval(newBlocks[index].intervalId);
      newBlocks[index].intervalId = null;
    }
    newBlocks[index].state = 'completed';
    setBlocks(newBlocks);
    generateExcel(newBlocks[index]);
  };

  const resetBlock = (index: number) => {
    const newBlocks = [...blocks];
    if (newBlocks[index].intervalId) {
      clearInterval(newBlocks[index].intervalId);
      newBlocks[index].intervalId = null;
    }
    newBlocks[index] = {
      status: [],
      intervalId: null,
      isPaused: false,
      currentOperation: 0,
      state: 'idle' as 'idle',
      totalOperations: newBlocks[index].totalOperations,
      title: newBlocks[index].title,
      totalViewers: 0,
      serviceId: newBlocks[index].serviceId,
      count: newBlocks[index].count,
    };
    setBlocks(newBlocks);
  };

  const editBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], ...updates };
    setBlocks(newBlocks);
  };

  const editOperation = (blockIndex: number, statusIndex: number, updates: Partial<BlockStatus>) => {
    const newBlocks = [...blocks];
    newBlocks[blockIndex].status[statusIndex] = { ...newBlocks[blockIndex].status[statusIndex], ...updates };
    setBlocks(newBlocks);
  };

  return (
    <BlocksContext.Provider value={{ blocks, link, setLink, startBlock, pauseBlock, resumeBlock, finalizeBlock, resetBlock, generateExcel, editBlock, editOperation }}>
      {children}
    </BlocksContext.Provider>
  );
};

export const useBlocks = () => {
  const context = useContext(BlocksContext);
  if (!context) {
    throw new Error('useBlocks must be used within a BlocksProvider');
  }
  return context;
};