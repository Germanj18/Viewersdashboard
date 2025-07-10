import React from 'react';
import { useTheme } from '../ThemeContext';
import './ResetWarningModal.css';

interface ResetWarningModalProps {
  isOpen: boolean;
  onDownloadFirst: () => void;
  onProceedAnyway: () => void;
  onCancel: () => void;
  hasData: boolean;
}

const ResetWarningModal: React.FC<ResetWarningModalProps> = ({
  isOpen,
  onDownloadFirst,
  onProceedAnyway,
  onCancel,
  hasData
}) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="reset-warning-overlay">
      <div className={`reset-warning-modal ${theme}`}>
        {/* Header */}
        <div className="reset-warning-header">
          <h2>🚨 Reset Completo de Dashboard</h2>
          <button 
            className="close-button"
            onClick={onCancel}
            title="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="reset-warning-content">
          <div className="warning-section">
            <div className="warning-icon">⚠️</div>
            <div className="warning-text">
              <h3>Esta acción eliminará TODOS los datos permanentemente</h3>
              <p>Se perderán todos los estados de bloques, historiales de operaciones, métricas y reportes.</p>
            </div>
          </div>

          {hasData && (
            <div className="recommendation-section">
              <h4>📋 Se recomienda descargar los reportes primero:</h4>
              <ul>
                <li><strong>JSON:</strong> Datos completos para respaldo y restauración</li>
                <li><strong>CSV:</strong> Operaciones para análisis en Excel</li>
                <li><strong>HTML:</strong> Reporte ejecutivo visual</li>
              </ul>
            </div>
          )}

          <div className="action-section">
            <h4>¿Qué deseas hacer?</h4>
            <div className="action-buttons">
              <button 
                className="download-button"
                onClick={onDownloadFirst}
                title="Ir al dashboard para descargar reportes"
              >
                📊 Descargar Reportes Primero
              </button>
              
              <button 
                className="proceed-button warning"
                onClick={onProceedAnyway}
                title="Proceder sin descargar (se perderán los datos)"
              >
                🗑️ Proceder Sin Descargar
              </button>
              
              <button 
                className="cancel-button"
                onClick={onCancel}
                title="Cancelar operación"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>

          <div className="final-warning">
            <small>⚠️ Esta acción NO se puede deshacer</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetWarningModal;
