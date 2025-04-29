import React, { createContext, useState, useEffect, useContext } from 'react';
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

export interface Block {
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
  autoStart?: boolean; // Nueva propiedad
  startTime?: string; // Nueva propiedad
  decrement?: number;
  operationType?: 'add' | 'subtract'; // Nuevo campo para definir si se suma o resta
  
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
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 1', totalViewers: 0, serviceId: 335, count: 100,decrement: 50,operationType: 'subtract',  autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 2', totalViewers: 0, serviceId: 335, count: 100, decrement: 50,operationType: 'subtract', autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 3', totalViewers: 0, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract',autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 4', totalViewers: 0, serviceId: 335, count: 100,decrement: 50, operationType: 'subtract', autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 5', totalViewers: 0, serviceId: 335, count: 100, decrement: 50,operationType: 'subtract', autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 6', totalViewers: 0, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract',autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 7', totalViewers: 0, serviceId: 335, count: 100, decrement: 50, operationType: 'subtract',autoStart: false, startTime: '' },
      { status: [], intervalId: null, isPaused: false, currentOperation: 0, state: 'idle', totalOperations: 35, title: 'Block 8', totalViewers: 0, serviceId: 335, count: 100, decrement: 50,operationType: 'subtract', autoStart: false, startTime: '' },
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

  useEffect(() => {
    blocks.forEach((block, index) => {
      if (block.autoStart && block.startTime) {
        const [hours, minutes] = block.startTime.split(':').map(Number);
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        const delay = start.getTime() - now.getTime();
  
        if (delay > 0) {
          setTimeout(() => startBlock(index, true), delay);
        }
      }
    });
  }, [blocks]);

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
      const { count, decrement, serviceId, operationType } = blocks[index];
      const currentOperation = blocks[index].currentOperation;
  
      // Calcula la cantidad para la operación actual
      const operationCount =
        operationType === 'add'
          ? count + (decrement || 0) * currentOperation
          : count - (decrement || 0) * currentOperation;
  
      const response = await fetch(`/api/proxy?service_id=${serviceId}&count=${operationCount}&link=${link}`);
      const data = await response.json();
      const timestamp = new Date().toLocaleTimeString();
      const duration = getServiceDuration(serviceId);
  
      console.log(`Block ${index + 1}, Operation ${currentOperation + 1}:`, data);
  
      const newStatus: BlockStatus = {
        status: data.error ? 'error' : 'success',
        message: data.error ? 'Error en la operación' : 'Operación exitosa',
        details: data,
        timestamp,
        orderId: data.res.order_id,
        duration,
        count: operationCount, // Cantidad calculada
        serviceId,
      };
  
      const newBlocks = [...blocks];
      newBlocks[index].status.push(newStatus);
  
      // Actualizar el total de espectadores
      if (newStatus.status === 'success') {
        newBlocks[index].totalViewers += operationCount;
      }
  
      newBlocks[index].currentOperation += 1;
  
      if (newBlocks[index].currentOperation >= newBlocks[index].totalOperations) {
        clearInterval(newBlocks[index].intervalId!);
        newBlocks[index].intervalId = null;
        newBlocks[index].state = 'completed' as 'completed';
        generateExcel(newBlocks[index]);
      }
  
      setBlocks(newBlocks);
    } catch (error) {
      console.error(`Block ${index + 1}, Operation ${blocks[index].currentOperation + 1}:`, error);
  
      const newStatus: BlockStatus = {
        status: 'error',
        message: 'Error en la operación',
        details: error,
        timestamp: new Date().toLocaleTimeString(),
        duration: 0,
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
  const startBlock = (index: number, isAutoStart: boolean = false) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
  
      // Si ya está en ejecución, no hacer nada
      if (newBlocks[index].state === 'running') return prevBlocks;
  
      // Cambiar el estado a 'running'
      newBlocks[index].isPaused = false;
      newBlocks[index].state = 'running';
  
      // Enviar la primera operación inmediatamente
      handleApiCall(index);
  
      // Configurar el intervalo para las siguientes operaciones
      const intervalId = setInterval(() => handleApiCall(index), 120000);
      newBlocks[index].intervalId = intervalId;
  
      return newBlocks;
    });
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
    const newBlocks = [...blocks];
    newBlocks[index].isPaused = false;
    newBlocks[index].state = 'running' as 'running';
    setBlocks(newBlocks);

    const intervalId = setInterval(() => handleApiCall(index), 120000); // Reiniciar el intervalo a 2 minutos
    newBlocks[index].intervalId = intervalId;
    setBlocks(newBlocks);

    handleApiCall(index); // Llamar a la API inmediatamente después de reanudar
  };

  const finalizeBlock = (index: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      if (newBlocks[index].intervalId) {
        clearInterval(newBlocks[index].intervalId);
        newBlocks[index].intervalId = null;
      }
      if (newBlocks[index].state !== 'completed') { 
        newBlocks[index].state = 'completed';
        generateExcel(newBlocks[index]); // Asegurar que solo se llama una vez
      }
      
     
      newBlocks[index].autoStart = false;
      return newBlocks;
    });
  };

  const resetBlock = (index: number) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      if (newBlocks[index].intervalId) {
        clearInterval(newBlocks[index].intervalId);
        newBlocks[index].intervalId = null;
      }
      newBlocks[index] = {
        ...newBlocks[index],
        status: [],
        intervalId: null,
        isPaused: false,
        currentOperation: 0,
        state: 'idle',
        totalViewers: 0,
        autoStart: false, // Desmarcar el inicio automático
        startTime: '', // Restablecer el tiempo de inicio
      };
      return newBlocks;
    });
  };

  const editBlock = (index: number, updates: Partial<Block>) => {
    setBlocks(prevBlocks => {
      const newBlocks = [...prevBlocks];
      if (updates.autoStart === false) {
        updates.startTime = ''; // Borrar la hora de inicio si se desmarca el inicio automático
      }
      newBlocks[index] = { ...newBlocks[index], ...updates };
      return newBlocks;
    });
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