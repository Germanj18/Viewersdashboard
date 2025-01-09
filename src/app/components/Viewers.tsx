import React, { useState, useEffect } from 'react';
import { useBlocks } from '../admin/BlocksContext';
import { useTheme } from '../ThemeContext';
import * as XLSX from 'xlsx';
import './Viewers.css';

const Viewers = () => {
  const { blocks, link, setLink, startBlock, pauseBlock, resumeBlock, finalizeBlock, resetBlock, generateExcel, updateBlockConfig, updateOperationConfig, fetchBalance } = useBlocks();
  const { theme } = useTheme();
  const [showWarning, setShowWarning] = useState<{ type: string, index: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [editBlockIndex, setEditBlockIndex] = useState<number | null>(null);
  const [totalOperations, setTotalOperations] = useState<number>(0);
  const [operations, setOperations] = useState<{ serviceId: number; quantity: number }[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [bulkServiceId, setBulkServiceId] = useState<number>(0);
  const [bulkQuantity, setBulkQuantity] = useState<number>(0);

  useEffect(() => {
    const getBalance = async () => {
      const balanceData = await fetchBalance();
      setBalance(balanceData);
    };

    getBalance();
  }, [fetchBalance]);

  const handleLinkChange = (link: string) => {
    setLink(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const rows = jsonData.slice(1); // Omitir la primera fila de encabezados

      const operations = rows.map((row: any) => ({
        Inicio: row[1], // Columna B
        Views: row[2], // Columna C
        Duracion: row[3], // Columna D
        Fin: row[4], // Columna E
        Gasto: row[5], // Columna F
      }));

      const startTime = new Date('1970-01-01T10:25:00Z');
      const endTime = new Date('1970-01-01T23:00:00Z');
      const timeIntervals: { Hora: string; [key: string]: number | string }[] = [];

      let currentTime = new Date(startTime);
      while (currentTime <= endTime) {
        timeIntervals.push({ Hora: currentTime.toISOString().substr(11, 5) });
        currentTime = new Date(currentTime.getTime() + 60000); // Incremento de 1 minuto
      }

      operations.forEach((operation, index) => {
        if (operation.Inicio && typeof operation.Inicio === 'string') {
          const [hours, minutes] = operation.Inicio.split(':').map(Number);
          const operationStartTime = new Date(startTime);
          operationStartTime.setHours(hours, minutes, 0, 0);
          const startTimeString = operationStartTime.toTimeString().substr(0, 5);
          const duration = parseInt(operation.Duracion.split(':')[0]) * 60 + parseInt(operation.Duracion.split(':')[1]);
          const orderIdColumn = `Operación ${index + 1}`;

          timeIntervals.forEach((interval) => {
            if (!(orderIdColumn in interval)) {
              interval[orderIdColumn] = '';
            }
          });

          const startIndex = timeIntervals.findIndex((entry) => entry.Hora === startTimeString);

          if (startIndex !== -1) {
            timeIntervals[startIndex][orderIdColumn] = operation.Views; // Registrar la hora de inicio
            for (let i = 0; i < duration && startIndex + i < timeIntervals.length; i++) {
              timeIntervals[startIndex + i][orderIdColumn] = operation.Views;
            }
          }
        }
      });

      const wsViewers = XLSX.utils.json_to_sheet(timeIntervals);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsViewers, 'Viewers por Minuto');
      XLSX.writeFile(wb, 'ViewersPorMinuto.xlsx');
    };

    reader.readAsArrayBuffer(file);
    setShowModal(false);
  };

  const handleEditBlock = (index: number) => {
    const block = blocks[index];
    setEditBlockIndex(index);
    setTotalOperations(block.totalOperations);
    setOperations(
      Array.from({ length: block.totalOperations }).map((_, i) => ({
        serviceId: block.status[i]?.details.service_id || 0,
        quantity: block.status[i]?.count || 0,
      }))
    );
    setShowModal(true);
  };

  const handleSaveBlockConfig = () => {
    if (editBlockIndex !== null) {
      updateBlockConfig(editBlockIndex, totalOperations);
      const updatedOperations = Array.from({ length: totalOperations }).map((_, i) => ({
        serviceId: operations[i]?.serviceId || 0,
        quantity: operations[i]?.quantity || 0,
      }));
      updatedOperations.forEach((operation, index) => {
        updateOperationConfig(editBlockIndex, index, operation.serviceId, operation.quantity);
      });
      setOperations(updatedOperations);
      setShowModal(false);
    }
  };

  const handleOperationChange = (index: number, field: 'serviceId' | 'quantity', value: number) => {
    const updatedOperations = [...operations];
    if (!updatedOperations[index]) {
      updatedOperations[index] = { serviceId: 0, quantity: 0 };
    }
    updatedOperations[index][field] = value;
    setOperations(updatedOperations);
  };

  const handleBulkUpdate = () => {
    const updatedOperations = Array.from({ length: totalOperations }).map((_, i) => ({
      serviceId: bulkServiceId,
      quantity: bulkQuantity,
    }));
    setOperations(updatedOperations);
  };

  const totalViewers = blocks.reduce((acc, block) => acc + block.totalViewers, 0);

  return (
    <div className="viewers-container">
      <input
        type="text"
        value={link}
        onChange={(e) => handleLinkChange(e.target.value)}
        placeholder="Ingrese el enlace de YouTube"
        className={`input-link ${theme}`}
      />
      <div className="total-viewers-header">
        Total de espectadores cargado: {totalViewers}
      </div>
      {balance !== null && (
        <div className="balance">
          Saldo: {balance}
        </div>
      )}
      <button onClick={() => setShowModal(true)} className="upload-button">
        Subir Excel
      </button>
      <div className="blocks-container">
        {blocks.map((block, index) => (
          <div key={index} className={`block ${theme}`}>
            <h2 className="block-title">{block.title}</h2>
            {(block.state === 'paused' || block.state === 'completed') && (
              <button onClick={() => generateExcel(block)} className="download-icon">
                <span className="icon-download"></span>
              </button>
            )}
            <button onClick={() => handleEditBlock(index)} className="edit-button">
              Editar
            </button>
            <div className="status" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
              {Array.from({ length: block.totalOperations }).map((_, statusIndex) => (
                <div key={statusIndex} className="status-item">
                  {`Operación ${statusIndex + 1}: `}
                  {block.status[statusIndex] ? (
                    <>
                      {block.status[statusIndex].status === 'success' ? (
                        <span className="status-success">✔️</span>
                      ) : (
                        <span className="status-error">❌</span>
                      )}
                      <span className="timestamp">{block.status[statusIndex].timestamp}</span>
                      {block.status[statusIndex].orderStatus && (
                        <span className="order-status"> - {block.status[statusIndex].orderStatus}</span>
                      )}
                    </>
                  ) : (
                    <span className="status-pending">⏳</span>
                  )}
                </div>
              ))}
            </div>
            <div className="block-controls">
              {block.state === 'idle' && (
                <button onClick={() => startBlock(index)} className="start-button">
                  Iniciar
                </button>
              )}
              {block.state === 'running' && (
                <button onClick={() => pauseBlock(index)} className="pause-button">
                  Pausar
                </button>
              )}
              {block.state === 'paused' && (
                <>
                  <button onClick={() => resumeBlock(index)} className="resume-button">
                    Reanudar
                  </button>
                  <button onClick={() => setShowWarning({ type: 'finalizar', index })} className="finalize-button">
                    Finalizar
                  </button>
                  <button onClick={() => setShowWarning({ type: 'reiniciar', index })} className="reset-button">
                    Reiniciar
                  </button>
                </>
              )}
              {block.state === 'completed' && (
                <>
                  <div className="completed-message">Bloque finalizado</div>
                  <button onClick={() => setShowWarning({ type: 'reiniciar', index })} className="reset-button">
                    Reiniciar
                  </button>
                </>
              )}
            </div>
            <div className="total-viewers">Total de espectadores: {block.totalViewers}</div>
          </div>
        ))}
      </div>
      {showWarning && (
        <div className="warning-modal">
          <div className={`warning-content ${theme}`}>
            <p>Estas por {showWarning.type === 'finalizar' ? 'finalizar' : 'reiniciar'} este bloque de operaciones, si estas seguro presiona continuar</p>
            <button onClick={() => {
              if (showWarning.type === 'finalizar') {
                finalizeBlock(showWarning.index);
              } else {
                resetBlock(showWarning.index);
              }
              setShowWarning(null);
            }} className="continue-button">
              Continuar
            </button>
            <button onClick={() => setShowWarning(null)} className="cancel-button">
              Cancelar
            </button>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal">
          <div className={`modal-content ${theme}`}>
            <h2>Editar Configuración del Bloque</h2>
            <label>
              Total Operations:
              <input
                type="number"
                value={totalOperations}
                onChange={(e) => setTotalOperations(Number(e.target.value))}
                className={theme === 'dark' ? 'input-dark' : ''}
              />
            </label>
            <div className="bulk-edit-container">
              <label>
                Servicio ID:
                <input
                  type="number"
                  value={bulkServiceId}
                  onChange={(e) => setBulkServiceId(Number(e.target.value))}
                  className={theme === 'dark' ? 'input-dark' : ''}
                />
              </label>
              <label>
                Cantidad:
                <input
                  type="number"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(Number(e.target.value))}
                  className={theme === 'dark' ? 'input-dark' : ''}
                />
              </label>
              <button onClick={handleBulkUpdate} className="bulk-update-button">
                Aplicar a todas las operaciones
              </button>
            </div>
            <div className="operations-container">
              {Array.from({ length: totalOperations }).map((_, index) => (
                <div key={index} className="operation-config">
                  <label>
                    Servicio ID:
                    <input
                      type="number"
                      value={operations[index]?.serviceId || 0}
                      onChange={(e) => handleOperationChange(index, 'serviceId', Number(e.target.value))}
                      className={theme === 'dark' ? 'input-dark' : ''}
                    />
                  </label>
                  <label>
                    Cantidad:
                    <input
                      type="number"
                      value={operations[index]?.quantity || 0}
                      onChange={(e) => handleOperationChange(index, 'quantity', Number(e.target.value))}
                      className={theme === 'dark' ? 'input-dark' : ''}
                    />
                  </label>
                </div>
              ))}
            </div>
            <button onClick={handleSaveBlockConfig} className="save-button">
              Guardar
            </button>
            <button onClick={() => setShowModal(false)} className="close-button">
              Cerrar
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Viewers;