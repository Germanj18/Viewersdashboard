import React, { useState } from 'react';
import { useBlocks } from '../admin/BlocksContext';
import { useTheme } from '../ThemeContext';
import * as XLSX from 'xlsx';
import './Viewers.css';

const Viewers = () => {
  const { blocks, link, setLink, startBlock, pauseBlock, resumeBlock, finalizeBlock, resetBlock, generateExcel } = useBlocks();
  const { theme } = useTheme();
  const [showWarning, setShowWarning] = useState<{ type: string, index: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

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
        Inicio: row[0], // Columna Inicio (A)
        Views: row[1], // Columna Views (B)
        Duracion: row[2], // Columna Duracion (C)
        Fin: row[3], // Columna Fin (D)
        Gasto: row[4], // Columna Gasto (E)
      }));
  
      const startTime = new Date('1970-01-01T10:25:00Z');
      const endTime = new Date('1970-01-01T23:00:00Z');
      const timeIntervals: { Hora: string, [key: string]: any }[] = [];
      
      let currentTime = new Date(startTime);
      while (currentTime <= endTime) {
        timeIntervals.push({ Hora: currentTime.toISOString().substr(11, 5) });
        currentTime = new Date(currentTime.getTime() + 60000); // Incremento de 1 minuto
      }
  
      // Fila para los costos de cada operación
      const costRow: { Hora: string, [key: string]: any } = { Hora: 'Costo' };
  
      operations.forEach((operation, index) => {
        if (operation.Inicio && typeof operation.Inicio === 'string' && operation.Views) {
          const [startHours, startMinutes] = operation.Inicio.split(':').map(Number);
          const operationStartTime = new Date(startTime);
          operationStartTime.setHours(startHours, startMinutes, 0, 0);
          const startTimeString = operationStartTime.toTimeString().substr(0, 5);
  
          const [durationHours, durationMinutes] = operation.Duracion.split(':').map(Number);
          const durationInMinutes = (durationHours * 60) + durationMinutes + 1;
          const orderIdColumn = `Operación ${index + 1}`;
  
          costRow[orderIdColumn] = operation.Gasto || 0;
  
          timeIntervals.forEach((interval) => {
            if (!(orderIdColumn in interval)) {
              interval[orderIdColumn] = '';
            }
          });
  
          const startIndex = timeIntervals.findIndex((entry) => entry.Hora === startTimeString);
  
          if (startIndex !== -1) {
            for (let i = 0; i < durationInMinutes && startIndex + i < timeIntervals.length; i++) {
              timeIntervals[startIndex + i][orderIdColumn] = operation.Views;
            }
          }
        }
      });
  
      const allRows = [costRow, ...timeIntervals];
  
      const wsViewers = XLSX.utils.json_to_sheet(allRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsViewers, 'Viewers por Minuto');
      XLSX.writeFile(wb, 'ViewersPorMinuto.xlsx');
    };
  
    reader.readAsArrayBuffer(file);
    setShowModal(false);
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
          <div className="modal-content">
            <h2>Subir Excel</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleConvert} className="convert-button">
              Convertir
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