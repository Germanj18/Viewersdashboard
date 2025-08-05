import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '../ThemeContext';
import * as XLSX from 'xlsx';

interface OperationHistoryItem {
  id: string;
  blockTitle: string;
  operationType: string;
  viewers: number;
  orderId?: string;
  orderStatus?: string;
  duration?: number;
  cost?: number;
  serviceId?: number;
  message?: string;
  timestamp: string;
}

interface OperationHistoryProps {
  onClose: () => void;
}

const OperationHistory: React.FC<OperationHistoryProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  
  const [operations, setOperations] = useState<OperationHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const [totalViewers, setTotalViewers] = useState(0);

  // Establecer fechas por defecto (hoy)
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    setEndDate(todayStr);
    setStartDate(todayStr);
  }, []);

  // Cargar operaciones cuando cambien las fechas
  useEffect(() => {
    if (startDate && endDate && session?.user?.id) {
      loadOperations();
    }
  }, [startDate, endDate, session?.user?.id]);

  const loadOperations = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        userId: session.user.id,
        startDate,
        endDate
      });

      const response = await fetch(`/api/operations-history?${params}`);
      const data = await response.json();

      if (response.ok) {
        setOperations(data.operations);
        
        // Calcular totales
        const cost = data.operations.reduce((sum: number, op: OperationHistoryItem) => sum + (op.cost || 0), 0);
        const viewers = data.operations.reduce((sum: number, op: OperationHistoryItem) => sum + op.viewers, 0);
        
        setTotalCost(cost);
        setTotalViewers(viewers);
      } else {
        console.error('Error loading operations:', data.error);
      }
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Fecha/Hora',
      'Bloque',
      'Tipo',
      'Viewers',
      'Order ID',
      'Estado',
      'Duración (min)',
      'Costo',
      'Service ID',
      'Mensaje'
    ];

    const csvData = operations.map(op => [
      formatDate(op.timestamp),
      op.blockTitle,
      op.operationType,
      op.viewers,
      op.orderId || '',
      op.orderStatus || '',
      op.duration || '',
      op.cost || '',
      op.serviceId || '',
      op.message || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-operaciones-${startDate}-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // Crear los datos para el Excel
    const excelData = operations.map(op => ({
      'Fecha/Hora': formatDate(op.timestamp),
      'Bloque': op.blockTitle,
      'Tipo': op.operationType === 'add' ? 'Agregar' : 'Restar',
      'Viewers': op.viewers,
      'Order ID': op.orderId || '',
      'Estado': op.orderStatus || '',
      'Duración (min)': op.duration || '',
      'Costo': op.cost || '',
      'Service ID': op.serviceId || '',
      'Mensaje': op.message || ''
    }));

    // Agregar una fila de resumen al final
    const summaryRow = {
      'Fecha/Hora': 'RESUMEN',
      'Bloque': '',
      'Tipo': '',
      'Viewers': totalViewers,
      'Order ID': '',
      'Estado': '',
      'Duración (min)': '',
      'Costo': totalCost,
      'Service ID': '',
      'Mensaje': `Total: ${operations.length} operaciones`
    };

    const dataWithSummary = [...excelData, {}, summaryRow]; // {} crea una fila vacía antes del resumen

    // Crear el libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(dataWithSummary);
    const workbook = XLSX.utils.book_new();
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial Operaciones');

    // Establecer el ancho de las columnas
    const columnWidths = [
      { wch: 20 }, // Fecha/Hora
      { wch: 15 }, // Bloque
      { wch: 10 }, // Tipo
      { wch: 10 }, // Viewers
      { wch: 15 }, // Order ID
      { wch: 12 }, // Estado
      { wch: 15 }, // Duración
      { wch: 10 }, // Costo
      { wch: 12 }, // Service ID
      { wch: 30 }  // Mensaje
    ];
    worksheet['!cols'] = columnWidths;

    // Generar y descargar el archivo
    const fileName = `historial-operaciones-${startDate}-${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content operation-history-modal ${theme}`} style={{ maxWidth: 900, width: '98%' }}>
        <div className="modal-header">
          <h2>📊 Historial de Operaciones</h2>
          <button onClick={onClose} className="close-button">❌</button>
        </div>

        <div className="filters-section">
          <div className="date-filters">
            <div className="filter-group">
              <label>Fecha inicio:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`date-input ${theme}`}
              />
            </div>
            <div className="filter-group">
              <label>Fecha fin:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`date-input ${theme}`}
              />
            </div>
            <button onClick={loadOperations} className="search-button" disabled={loading}>
              {loading ? '🔄 Cargando...' : '🔍 Buscar'}
            </button>
            {operations.length > 0 && (
              <>
                <button onClick={exportToCSV} className="export-button">
                  � Exportar CSV
                </button>
                <button onClick={exportToExcel} className="export-button excel">
                  📊 Exportar Excel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="summary-section">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Total Operaciones:</span>
              <span className="stat-value">{operations.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Viewers:</span>
              <span className="stat-value">{totalViewers.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Costo Total:</span>
              <span className="stat-value">${totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="operations-table-container" style={{ paddingTop: 0, marginTop: 0 }}>
          {loading ? (
            <div className="loading-state">🔄 Cargando operaciones...</div>
          ) : operations.length === 0 ? (
            <div className="empty-state">
              📭 No se encontraron operaciones en el período seleccionado
            </div>
          ) : (
            <table className={`operations-table ${theme}`} style={{ marginTop: 0, paddingTop: 0, borderSpacing: 0 }}>
              <thead style={{ marginTop: 0, paddingTop: 0, backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>
                <tr style={{ marginTop: 0, paddingTop: 0 }}>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Fecha/Hora</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Bloque</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Tipo</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Viewers</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Order ID</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Estado</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Duración</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Costo</th>
                  <th style={{ marginTop: 0, paddingTop: '2px', paddingBottom: '2px', backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc' }}>Service ID</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => (
                  <tr key={operation.id}>
                    <td>{formatDate(operation.timestamp)}</td>
                    <td>{operation.blockTitle}</td>
                    <td>
                      <span className={`operation-type ${operation.operationType}`}>
                        {operation.operationType === 'add' ? '➕ Agregar' : '➖ Restar'}
                      </span>
                    </td>
                    <td>{operation.viewers.toLocaleString()}</td>
                    <td>{operation.orderId || '-'}</td>
                    <td>
                      {operation.orderStatus ? (
                        <span className={`order-status ${operation.orderStatus}`}>
                          {operation.orderStatus}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{operation.duration ? `${operation.duration} min` : '-'}</td>
                    <td>{operation.cost ? `$${operation.cost.toFixed(2)}` : '-'}</td>
                    <td>{operation.serviceId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default OperationHistory;