import React, { useState, useEffect } from 'react';
import { useGlobal } from './GlobalContext';
import { useTheme } from '../ThemeContext';
import Block, { BlockData } from './Block';
import MetricsDashboard from './MetricsDashboard';
import YouTubeMonitor from './YouTubeMonitor';
import ResetWarningModal from './ResetWarningModal';
import './Viewers.css';

const Viewers = () => {
  const { link, setLink, totalViewers, updateBlockViewers } = useGlobal();
  const { theme } = useTheme();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showYouTubeMonitor, setShowYouTubeMonitor] = useState(false);
  const [showResetWarning, setShowResetWarning] = useState(false);
  
  // Estado para modales globales
  const [showWarning, setShowWarning] = useState<{ blockId: string; type: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState<{ blockId: string; blockData: BlockData } | null>(null);
  const [editData, setEditData] = useState<BlockData | null>(null);

  // Función para limpiar localStorage de bloques antiguos al inicializar
  useEffect(() => {
    const cleanupOldBlockStates = () => {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('blockState_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '');
            if (data.lastSaved) {
              const lastSavedDate = new Date(data.lastSaved);
              const now = new Date();
              const daysDiff = (now.getTime() - lastSavedDate.getTime()) / (1000 * 3600 * 24);
              if (daysDiff > 7) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            keysToRemove.push(key);
          }
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    };

    cleanupOldBlockStates();
  }, []);

  // Callbacks para manejar modales
  const handleShowWarning = (blockId: string, type: string) => {
    setShowWarning({ blockId, type });
  };

  const handleShowEditModal = (blockId: string, blockData: BlockData) => {
    setShowEditModal({ blockId, blockData });
    setEditData({ ...blockData });
  };

  const handleWarningConfirm = () => {
    if (showWarning) {
      const { blockId, type } = showWarning;
      if (type === 'finalizar') {
        (window as any)[`finalizeBlock_${blockId}`]?.();
      } else if (type === 'reiniciar') {
        (window as any)[`resetBlock_${blockId}`]?.();
      }
      setShowWarning(null);
    }
  };

  const handleEditSave = () => {
    if (showEditModal && editData) {
      // Validar múltiplos de 10
      if (editData.count % 10 !== 0 || editData.decrement % 10 !== 0) {
        alert('La cantidad y el decremento deben ser múltiplos de 10');
        return;
      }
      
      const { blockId } = showEditModal;
      (window as any)[`updateBlockData_${blockId}`]?.(editData);
      setShowEditModal(null);
      setEditData(null);
    }
  };

  // Configuración de los 10 bloques con nombres únicos
  const initialBlocksData: BlockData[] = [
    {
      title: 'Bloque 1',
      totalOperations: 5,
      serviceId: 336,
      count: 50,
      decrement: 10,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 2',
      totalOperations: 4,
      serviceId: 337,
      count: 60,
      decrement: 15,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 3',
      totalOperations: 6,
      serviceId: 334,
      count: 40,
      decrement: 5,
      operationType: 'add',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 4',
      totalOperations: 3,
      serviceId: 335,
      count: 70,
      decrement: 20,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 5',
      totalOperations: 4,
      serviceId: 338,
      count: 80,
      decrement: 10,
      operationType: 'add',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 6',
      totalOperations: 5,
      serviceId: 459,
      count: 90,
      decrement: 25,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 7',
      totalOperations: 3,
      serviceId: 460,
      count: 100,
      decrement: 30,
      operationType: 'add',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 8',
      totalOperations: 6,
      serviceId: 657,
      count: 120,
      decrement: 40,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 9',
      totalOperations: 4,
      serviceId: 335,
      count: 110,
      decrement: 20,
      operationType: 'add',
      autoStart: false,
      startTime: ''
    },
    {
      title: 'Bloque 10',
      totalOperations: 5,
      serviceId: 336,
      count: 130,
      decrement: 35,
      operationType: 'subtract',
      autoStart: false,
      startTime: ''
    }
  ];

  const handleLinkChange = (newLink: string) => {
    setLink(newLink);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name);
      // Aquí puedes implementar la lógica de subida de archivo si es necesaria
      setShowUploadModal(false);
    }
  };

  // Función para resetear todos los bloques
  const handleResetAllBlocks = () => {
    // Verificar si hay datos para resetear
    const hasBlockData = initialBlocksData.some((_, index) => {
      const blockState = localStorage.getItem(`blockState_block-${index}`);
      return blockState && JSON.parse(blockState).operations?.length > 0;
    });

    const hasGlobalHistory = localStorage.getItem('globalOperationsHistory') || localStorage.getItem('blockResetHistory');
    const hasAnyData = hasBlockData || hasGlobalHistory;

    if (!hasAnyData) {
      alert('No hay datos para resetear.');
      return;
    }

    // Mostrar modal de advertencia
    setShowResetWarning(true);
  };

  // Manejar la opción de descargar reportes primero
  const handleDownloadFirst = () => {
    setShowResetWarning(false);
    setShowMetrics(true);
    alert('💡 Dashboard de métricas abierto. Descarga los reportes y luego usa "Reset All" nuevamente.');
  };

  // Manejar proceder sin descargar
  const handleProceedWithoutDownload = () => {
    setShowResetWarning(false);
    
    // Confirmación final para el reset completo
    const finalConfirm = confirm(
      '🚨 CONFIRMACIÓN FINAL\n\n' +
      'Esto eliminará PERMANENTEMENTE:\n' +
      '• Todos los estados de bloques actuales\n' +
      '• Todo el historial de operaciones\n' +
      '• Todo el historial de resets\n' +
      '• Todas las métricas acumuladas\n\n' +
      '⚠️ Esta acción NO se puede deshacer.\n\n' +
      '¿Estás absolutamente seguro de continuar?'
    );

    if (finalConfirm) {
      executeCompleteReset();
    }
  };

  // Ejecutar el reset completo
  const executeCompleteReset = () => {
    try {
      // 1. Resetear cada bloque (esto guarda las operaciones actuales al historial)
      for (let i = 0; i < 10; i++) {
        const blockId = `block-${i}`;
        const resetFunction = (window as any)[`resetBlock_${blockId}`];
        if (resetFunction) {
          resetFunction();
        } else {
          // Si no hay función de reset, limpiar manualmente
          localStorage.removeItem(`blockState_${blockId}`);
        }
      }

      // 2. Limpiar completamente el historial global y de resets
      localStorage.removeItem('globalOperationsHistory');
      localStorage.removeItem('blockResetHistory');

      // 3. Limpiar cualquier otro dato relacionado
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('blockState_') || key.includes('metrics') || key.includes('dashboard'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // 4. Ocultar el dashboard de métricas si estaba abierto
      setShowMetrics(false);

      // 5. Mostrar confirmación de éxito
      alert('✅ Reset completo realizado con éxito.\n\nTodos los datos han sido eliminados permanentemente.\nLos bloques están listos para usar desde cero.');

    } catch (error) {
      console.error('Error durante el reset completo:', error);
      alert('❌ Error durante el reset completo. Algunos datos pueden no haberse eliminado correctamente.');
    }
  };

  // Manejar cancelar reset
  const handleCancelReset = () => {
    setShowResetWarning(false);
  };

  return (
    <div className="viewers-container">
      {/* Input para el link de YouTube usando tus estilos originales */}
      <input
        type="text"
        value={link}
        onChange={(e) => handleLinkChange(e.target.value)}
        placeholder="Ingrese el enlace de YouTube"
        className={`input-link ${theme}`}
      />
      
      {/* Header con total de viewers usando tu estilo original */}
      <div className="total-viewers-header">
        💫 Total cargado: {totalViewers.toLocaleString()}
      </div>
      
      {/* Botones de control debajo del total */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowMetrics(!showMetrics)}
          className="edit-button"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            borderRadius: '0.5rem',
            fontWeight: '500'
          }}
          title="Ver dashboard de métricas"
        >
          📊 {showMetrics ? 'Ocultar Métricas' : 'Ver Métricas'}
        </button>
        
        <button
          onClick={() => setShowYouTubeMonitor(!showYouTubeMonitor)}
          className="youtube-monitor-button"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            borderRadius: '0.5rem',
            fontWeight: '500',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          title="Monitor de YouTube en tiempo real"
        >
          📺 {showYouTubeMonitor ? 'Ocultar YouTube' : 'Monitor YouTube'}
        </button>
        
        <button
          onClick={handleResetAllBlocks}
          className="reset-button"
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            borderRadius: '0.5rem',
            fontWeight: '500'
          }}
          title="Resetear todos los bloques"
        >
          🗑️ Reset All
        </button>
      </div>

      {/* Dashboard de Métricas */}
      {showMetrics && <MetricsDashboard />}

      {/* Monitor de YouTube */}
      {showYouTubeMonitor && <YouTubeMonitor />}

      {/* Grid de bloques usando tu estructura CSS original */}
      <div className="blocks-container">
        {initialBlocksData.map((blockData, index) => (
          <Block
            key={`block-${index}`}
            blockId={`block-${index}`}
            initialData={blockData}
            link={link}
            onTotalViewersChange={updateBlockViewers}
            onShowWarning={handleShowWarning}
            onShowEditModal={handleShowEditModal}
          />
        ))}
      </div>

      {/* Modal de upload de Excel manteniendo el estilo que tenías */}
      {showUploadModal && (
        <div className="modal">
          <div className={`modal-content ${theme}`}>
            <h2>📁 Subir Archivo Excel</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ 
                padding: '1rem', 
                borderRadius: '0.5rem', 
                border: '2px dashed rgba(156, 163, 175, 0.5)' 
              }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={() => setShowUploadModal(false)} className="cancel-button">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de advertencia global */}
      {showWarning && (
        <div className="warning-modal">
          <div className={`warning-content ${theme}`}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {showWarning.type === 'finalizar' ? '🏁 Finalizar Bloque' : '🔄 Reiniciar Bloque'}
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Estás por {showWarning.type === 'finalizar' ? 'finalizar' : 'reiniciar'} este bloque de operaciones.
                <br />
                <strong>Esta acción no se puede deshacer.</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button onClick={handleWarningConfirm} className="continue-button">
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

      {/* Modal de edición global */}
      {showEditModal && editData && (
        <div className="modal">
          <div className={`modal-content ${theme}`}>
            <h2>✏️ Editar Bloque</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label>
                🔢 Cantidad de Operaciones:
                <input
                  type="number"
                  min={0}
                  value={editData.totalOperations}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, totalOperations: Number(e.target.value) }) : null)}
                  className={`input-${theme}`}
                />
              </label>

              <label>
                ⏱️ Duración:
                <select
                  value={editData.serviceId}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, serviceId: Number(e.target.value) }) : null)}
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

              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '0.5rem', 
                background: 'rgba(34, 197, 94, 0.1)', 
                border: '1px solid rgba(34, 197, 94, 0.2)',
                color: '#16a34a'
              }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                  💡 Solo múltiplos de 10 (ej: 30, 40, 100, 150...)
                </p>
              </div>

              <label>
                👥 Cantidad:
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={editData.count}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, count: Number(e.target.value) }) : null)}
                  className={`input-${theme} ${editData.count % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>

              <label>
                ➕➖ Cantidad a Restar/Sumar:
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={editData.decrement}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, decrement: Number(e.target.value) }) : null)}
                  className={`input-${theme} ${editData.decrement % 10 !== 0 ? 'input-error' : ''}`}
                />
              </label>

              <label>
                🔄 Operación:
                <select
                  value={editData.operationType}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, operationType: e.target.value as 'add' | 'subtract' }) : null)}
                  className={`input-${theme}`}
                >
                  <option value="add">➕ Sumar</option>
                  <option value="subtract">➖ Restar</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={editData.autoStart}
                  onChange={(e) => setEditData(prev => prev ? ({ ...prev, autoStart: e.target.checked }) : null)}
                  style={{ width: '1.25rem', height: '1.25rem' }}
                />
                <span>🕐 Inicio Automático</span>
              </label>

              {editData.autoStart && (
                <label>
                  ⏰ Hora de Inicio:
                  <input
                    type="time"
                    value={editData.startTime}
                    onChange={(e) => setEditData(prev => prev ? ({ ...prev, startTime: e.target.value }) : null)}
                    className={`input-${theme}`}
                  />
                </label>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={handleEditSave} className="save-button">
                💾 Guardar
              </button>
              <button onClick={() => { setShowEditModal(null); setEditData(null); }} className="cancel-button">
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Advertencia de Reset */}
      <ResetWarningModal
        isOpen={showResetWarning}
        onDownloadFirst={handleDownloadFirst}
        onProceedAnyway={handleProceedWithoutDownload}
        onCancel={handleCancelReset}
        hasData={true} // Ya verificamos que hay datos antes de mostrar el modal
      />
    </div>
  );
};

export default Viewers;