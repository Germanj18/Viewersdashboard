import React, { useState } from 'react';
import { useBlocks } from '../admin/BlocksContext';
import { useTheme } from '../ThemeContext';
import './Viewers.css';
import { Block } from '../admin/BlocksContext';

const Viewers = () => {
  const { blocks, link, setLink, startBlock, pauseBlock, resumeBlock, finalizeBlock, resetBlock, generateExcel, editBlock } = useBlocks();
  const { theme } = useTheme();
  const [showWarning, setShowWarning] = useState<{ type: string, index: number } | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editOperations, setEditOperations] = useState<number>(0);
  const [editServiceId, setEditServiceId] = useState<number>(0);
  const [editCount, setEditCount] = useState<number>(0);
  const [editAutoStart, setEditAutoStart] = useState<boolean>(false);
  const [editStartTime, setEditStartTime] = useState<string>('');
  const [editDecrement, setEditDecrement] = useState<number>(0); // Nuevo estado para el decremento
  const [editOperationType, setEditOperationType] = useState<'add' | 'subtract'>('subtract'); // Por defecto, resta
  const handleLinkChange = (link: string) => {
    setLink(link);
  };

  const handleEditBlock = (index: number) => {
    const block = blocks[index];
    setEditIndex(index);
    setEditOperations(block.totalOperations || 0);
    setEditServiceId(block.serviceId || 0);
    setEditCount(block.count || 0);
    setEditDecrement(block.decrement || 0);
    setEditOperationType(block.operationType || 'subtract'); // Cargar el tipo de operación
    setEditAutoStart(block.autoStart || false);
    setEditStartTime(block.startTime || '');
  };
  
  const handleSaveEdit = () => {
    if (editIndex !== null) {
      const updates: Partial<Block> = {
        totalOperations: editOperations,
        serviceId: editServiceId,
        count: editCount,
        decrement: editDecrement,
        operationType: editOperationType, // Guardar el tipo de operación
        autoStart: editAutoStart,
        startTime: editAutoStart ? editStartTime : '',
      };
      editBlock(editIndex, updates);
      setEditIndex(null);
    }
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
        💫 Total cargado: {totalViewers}
      </div>
      <div className="blocks-container">
        {blocks.map((block, index) => (
          <div key={index} className={`block ${theme}`}>
            <h2 className="block-title">{block.title}</h2>
            {block.autoStart && block.startTime && (
              <div className="auto-start-info">
                ⏰ Inicio automático: {block.startTime}
              </div>
            )}
            {(block.state === 'paused' || block.state === 'completed') && (
              <button onClick={() => generateExcel(block)} className="download-icon">
                <span className="icon-download"></span>
              </button>
            )}
            <div className="status">
              {Array.from({ length: block.totalOperations }).map((_, statusIndex) => (
                <div key={statusIndex} className="status-item">
                  {`Operación ${statusIndex + 1}: `}
                  {block.status[statusIndex] ? (
                    <>
                      {block.status[statusIndex].status === 'success' ? (
                        <span className="status-success">✅</span>
                      ) : (
                        <span className="status-error">❌</span>
                      )}
                      <span className="timestamp">{block.status[statusIndex].timestamp}</span>
                      {block.status[statusIndex].orderStatus && (
                        <span className="order-status">{block.status[statusIndex].orderStatus}</span>
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
                  ▶️ Iniciar
                </button>
              )}
              {block.state === 'running' && (
                <button onClick={() => pauseBlock(index)} className="pause-button">
                  ⏸️ Pausar
                </button>
              )}
              {block.state === 'paused' && (
                <>
                  <button onClick={() => resumeBlock(index)} className="resume-button">
                    ▶️ Reanudar
                  </button>
                  <button onClick={() => setShowWarning({ type: 'finalizar', index })} className="finalize-button">
                    🏁 Finalizar
                  </button>
                  <button onClick={() => setShowWarning({ type: 'reiniciar', index })} className="reset-button">
                    🔄 Reiniciar
                  </button>
                </>
              )}
              {block.state === 'completed' && (
                <>
                  <div className="completed-message">✅ Bloque finalizado</div>
                  <button onClick={() => setShowWarning({ type: 'reiniciar', index })} className="reset-button">
                    🔄 Reiniciar
                  </button>
                </>
              )}
              <button onClick={() => handleEditBlock(index)} className="edit-button">
                ✏️ Editar
              </button>
            </div>
            <div className="total-viewers">👥 {block.totalViewers}</div>
          </div>
        ))}
      </div>
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
                    finalizeBlock(showWarning.index);
                  } else {
                    resetBlock(showWarning.index);
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
      {editIndex !== null && (
        <div className="modal">
          <div className={`modal-content ${theme}`}>
            <h2>✏️ Editar Bloque</h2>
            <div className="grid grid-cols-1 gap-4">
              <label>
                🔢 Cantidad de Operaciones:
                <input
                  type="number"
                  value={editOperations}
                  onChange={(e) => setEditOperations(Number(e.target.value))}
                  className={`input-${theme}`}
                />
              </label>
              <label>
                ⏱️ Duración:
                <select
                  value={editServiceId}
                  onChange={(e) => setEditServiceId(Number(e.target.value))}
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
                  value={editCount}
                  onChange={(e) => setEditCount(Number(e.target.value))}
                  className={`input-${theme} ${editCount % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>
              <label>
                ➕➖ Cantidad a Modificar:
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={editDecrement}
                  onChange={(e) => setEditDecrement(Number(e.target.value))}
                  className={`input-${theme} ${editDecrement % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>
              <label>
                🔄 Operación:
                <select
                  value={editOperationType}
                  onChange={(e) => setEditOperationType(e.target.value as 'add' | 'subtract')}
                  className={`input-${theme}`}
                >
                  <option value="add">➕ Sumar</option>
                  <option value="subtract">➖ Restar</option>
                </select>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={editAutoStart}
                  onChange={(e) => setEditAutoStart(e.target.checked)}
                  className="w-5 h-5"
                />
                <span>🕐 Inicio Automático</span>
              </label>
              {editAutoStart && (
                <label>
                  ⏰ Hora de Inicio:
                  <input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                    className={`input-${theme}`}
                  />
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSaveEdit} className="save-button">
                💾 Guardar
              </button>
              <button onClick={() => setEditIndex(null)} className="cancel-button">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Viewers;