import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { useGlobal } from './GlobalContext';
import { NotificationService, showToast } from './NotificationService';
import './MetricsDashboard.css';

interface OperationMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalCost: number;
  totalViewers: number;
  averageOperationTime: number;
  operationsPerBlock: { [blockId: string]: number };
  viewersPerHour: { [hour: string]: number };
  lastUpdated: string;
}

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  blockId?: string;
}

const MetricsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { totalViewers } = useGlobal();
  
  const [metrics, setMetrics] = useState<OperationMetrics>({
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalCost: 0,
    totalViewers: 0,
    averageOperationTime: 0,
    operationsPerBlock: {},
    viewersPerHour: {},
    lastUpdated: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Función para obtener todos los datos de operaciones
  const getAllOperationsData = useCallback(() => {
    const allOperations: any[] = [];
    
    for (let i = 0; i < 10; i++) {
      const blockId = `block-${i}`;
      const blockState = localStorage.getItem(`blockState_${blockId}`);
      
      if (blockState) {
        try {
          const parsed = JSON.parse(blockState);
          const status = parsed.status || [];
          
          status.forEach((operation: any) => {
            allOperations.push({
              blockId,
              timestamp: operation.timestamp,
              status: operation.status,
              message: operation.message,
              duration: operation.duration,
              count: operation.count,
              serviceId: operation.serviceId,
              cost: operation.details?.res?.sum || 0,
              orderId: operation.orderId,
              orderStatus: operation.orderStatus,
              details: operation.details
            });
          });
        } catch (error) {
          console.error('Error parsing block state:', error);
        }
      }
    }
    
    return allOperations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const getSuccessRate = () => {
    if (metrics.totalOperations === 0) return 0;
    return ((metrics.successfulOperations / metrics.totalOperations) * 100);
  };

  // Función para exportar datos como JSON
  const exportToJSON = useCallback(() => {
    const exportData = {
      reportInfo: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Dashboard La Casa',
        reportType: 'Complete Operations Report'
      },
      summary: {
        totalOperations: metrics.totalOperations,
        successfulOperations: metrics.successfulOperations,
        failedOperations: metrics.failedOperations,
        successRate: getSuccessRate(),
        totalCost: metrics.totalCost,
        totalViewers: metrics.totalViewers,
        averageOperationTime: metrics.averageOperationTime,
        costPerViewer: metrics.totalViewers > 0 ? metrics.totalCost / metrics.totalViewers : 0
      },
      operationsPerBlock: metrics.operationsPerBlock,
      viewersPerHour: metrics.viewersPerHour,
      detailedOperations: getAllOperationsData(),
      alerts: alerts
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📄 Reporte JSON descargado exitosamente', 'success');
  }, [metrics, alerts, getAllOperationsData]);

  // Función para exportar como CSV
  const exportToCSV = useCallback(() => {
    const operations = getAllOperationsData();
    
    const csvHeaders = [
      'Fecha y Hora',
      'Bloque',
      'Estado',
      'Mensaje',
      'Duración (min)',
      'Viewers',
      'Service ID',
      'Costo',
      'Order ID',
      'Order Status'
    ];

    const csvRows = operations.map(op => [
      op.timestamp,
      `Bloque ${parseInt(op.blockId.replace('block-', '')) + 1}`,
      op.status,
      op.message.replace(/,/g, ';'), // Escapar comas
      op.duration || 0,
      op.count || 0,
      op.serviceId || '',
      op.cost || 0,
      op.orderId || '',
      op.orderStatus || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operaciones-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📊 Reporte CSV descargado exitosamente', 'success');
  }, [getAllOperationsData]);

  // Función para exportar reporte ejecutivo en HTML
  const exportExecutiveReport = useCallback(() => {
    const operations = getAllOperationsData();
    const successRate = getSuccessRate();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Ejecutivo - Dashboard La Casa</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #4CAF50; font-size: 24px; font-weight: bold; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric-card { background: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-label { color: #666; font-size: 14px; }
        .operations-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .operations-table th, .operations-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .operations-table th { background-color: #4CAF50; color: white; }
        .operations-table tr:nth-child(even) { background-color: #f2f2f2; }
        .status-success { color: #4CAF50; font-weight: bold; }
        .status-error { color: #f44336; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">📊 REPORTE EJECUTIVO - DASHBOARD LA CASA</div>
        <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
    </div>

    <div class="summary-grid">
        <div class="metric-card">
            <div class="metric-value">${metrics.totalOperations}</div>
            <div class="metric-label">Total Operaciones</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${successRate.toFixed(1)}%</div>
            <div class="metric-label">Tasa de Éxito</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.totalViewers.toLocaleString()}</div>
            <div class="metric-label">Total Viewers</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${metrics.totalCost.toFixed(2)}</div>
            <div class="metric-label">Costo Total</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.averageOperationTime.toFixed(0)} min</div>
            <div class="metric-label">Tiempo Promedio</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${metrics.totalViewers > 0 ? (metrics.totalCost / metrics.totalViewers).toFixed(4) : '0.0000'}</div>
            <div class="metric-label">Costo por Viewer</div>
        </div>
    </div>

    <h2>📈 Operaciones por Bloque</h2>
    <table class="operations-table">
        <thead>
            <tr>
                <th>Bloque</th>
                <th>Operaciones</th>
                <th>Porcentaje</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(metrics.operationsPerBlock).map(([blockId, count]) => `
                <tr>
                    <td>Bloque ${parseInt(blockId.replace('block-', '')) + 1}</td>
                    <td>${count}</td>
                    <td>${metrics.totalOperations > 0 ? ((count / metrics.totalOperations) * 100).toFixed(1) : 0}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>📋 Detalle de Operaciones Recientes</h2>
    <table class="operations-table">
        <thead>
            <tr>
                <th>Fecha y Hora</th>
                <th>Bloque</th>
                <th>Estado</th>
                <th>Viewers</th>
                <th>Duración</th>
                <th>Costo</th>
            </tr>
        </thead>
        <tbody>
            ${operations.slice(-20).reverse().map(op => `
                <tr>
                    <td>${op.timestamp}</td>
                    <td>Bloque ${parseInt(op.blockId.replace('block-', '')) + 1}</td>
                    <td class="status-${op.status}">${op.status === 'success' ? '✅ Exitosa' : '❌ Fallida'}</td>
                    <td>${op.count || 0}</td>
                    <td>${op.duration || 0} min</td>
                    <td>$${op.cost || 0}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado automáticamente por Dashboard La Casa</p>
        <p>© ${new Date().getFullYear()} - Todos los derechos reservados</p>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ejecutivo-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📋 Reporte ejecutivo descargado exitosamente', 'success');
  }, [metrics, getAllOperationsData]);

  // Función para calcular métricas desde localStorage
  const calculateMetrics = useCallback(() => {
    const newMetrics: OperationMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalCost: 0,
      totalViewers: totalViewers,
      averageOperationTime: 0,
      operationsPerBlock: {},
      viewersPerHour: {},
      lastUpdated: new Date().toISOString()
    };

    let totalDuration = 0;
    let operationCount = 0;

    // Recorrer todos los bloques guardados en localStorage
    for (let i = 0; i < 10; i++) {
      const blockId = `block-${i}`;
      const blockState = localStorage.getItem(`blockState_${blockId}`);
      
      if (blockState) {
        try {
          const parsed = JSON.parse(blockState);
          const status = parsed.status || [];
          
          newMetrics.operationsPerBlock[blockId] = status.length;
          
          status.forEach((operation: any) => {
            newMetrics.totalOperations++;
            
            if (operation.status === 'success') {
              newMetrics.successfulOperations++;
              newMetrics.totalCost += operation.details?.res?.sum || 0;
              
              if (operation.duration) {
                totalDuration += operation.duration;
                operationCount++;
              }

              // Agrupar viewers por hora
              if (operation.timestamp && operation.count) {
                const hour = operation.timestamp.split(':')[0] + ':00';
                newMetrics.viewersPerHour[hour] = (newMetrics.viewersPerHour[hour] || 0) + operation.count;
              }
            } else {
              newMetrics.failedOperations++;
            }
          });
        } catch (error) {
          console.error('Error parsing block state:', error);
        }
      }
    }

    if (operationCount > 0) {
      newMetrics.averageOperationTime = totalDuration / operationCount;
    }

    setMetrics(newMetrics);
  }, [totalViewers]);

  // Función para generar alertas
  const generateAlerts = useCallback(() => {
    const newAlerts: Alert[] = [];

    // Alerta de tasa de fallo alta
    const failureRate = metrics.totalOperations > 0 ? (metrics.failedOperations / metrics.totalOperations) * 100 : 0;
    if (failureRate > 20 && metrics.totalOperations > 5) {
      const alert = {
        id: 'high-failure-rate',
        type: 'error' as const,
        title: '⚠️ Alta Tasa de Fallo',
        message: `${failureRate.toFixed(1)}% de operaciones están fallando`,
        timestamp: new Date().toLocaleTimeString()
      };
      newAlerts.push(alert);
    }

    // Alerta de objetivo alcanzado
    if (metrics.totalViewers >= 1000 && metrics.totalViewers % 1000 < 100) {
      const alert = {
        id: 'milestone-reached',
        type: 'success' as const,
        title: '🎯 Objetivo Alcanzado',
        message: `¡Has alcanzado ${metrics.totalViewers.toLocaleString()} viewers!`,
        timestamp: new Date().toLocaleTimeString()
      };
      newAlerts.push(alert);
    }

    // Alerta de costo alto
    if (metrics.totalCost > 500) {
      const alert = {
        id: 'high-cost',
        type: 'warning' as const,
        title: '💰 Costo Elevado',
        message: `Costo total: $${metrics.totalCost.toFixed(2)}`,
        timestamp: new Date().toLocaleTimeString()
      };
      newAlerts.push(alert);
    }

    // Alerta de operaciones completadas recientemente
    const recentOperations = metrics.totalOperations - (localStorage.getItem('lastKnownOperations') ? parseInt(localStorage.getItem('lastKnownOperations')!) : 0);
    if (recentOperations > 0) {
      localStorage.setItem('lastKnownOperations', metrics.totalOperations.toString());
      
      if (recentOperations >= 5) {
        const alert = {
          id: `batch-completed-${Date.now()}`,
          type: 'info' as const,
          title: '📊 Lote Completado',
          message: `Se completaron ${recentOperations} operaciones`,
          timestamp: new Date().toLocaleTimeString()
        };
        newAlerts.push(alert);
      }
    }

    setAlerts(prev => {
      // Solo agregar alertas nuevas y mostrar notificaciones
      const existingIds = prev.map(alert => alert.id);
      const uniqueNewAlerts = newAlerts.filter(alert => !existingIds.includes(alert.id));
      
      // Mostrar notificaciones para alertas nuevas
      uniqueNewAlerts.forEach(alert => {
        NotificationService.showNotification(alert.title, {
          body: alert.message,
          tag: alert.id,
          silent: alert.type === 'info'
        });
        
        NotificationService.playSound(alert.type);
        showToast(alert.message, alert.type);
      });
      
      return [...prev, ...uniqueNewAlerts].slice(-10); // Mantener solo las últimas 10
    });
  }, [metrics]);

  // Actualizar métricas cada 5 segundos
  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 5000);
    return () => clearInterval(interval);
  }, [calculateMetrics]);

  // Generar alertas cuando cambien las métricas
  useEffect(() => {
    generateAlerts();
  }, [generateAlerts]);

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  return (
    <div className={`metrics-dashboard ${theme}`}>
      {/* Header */}
      <div className="metrics-header">
        <h2>📊 Dashboard de Métricas</h2>
        <div className="metrics-actions">
          <button 
            onClick={() => setShowAlerts(!showAlerts)}
            className={`alerts-button ${alerts.length > 0 ? 'has-alerts' : ''}`}
          >
            🔔 Alertas ({alerts.length})
          </button>
          
          {/* Botones de exportación */}
          <div className="export-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={exportToJSON} className="export-button" title="Descargar datos completos en JSON">
              📄 JSON
            </button>
            <button onClick={exportToCSV} className="export-button" title="Descargar operaciones en CSV">
              📊 CSV
            </button>
            <button onClick={exportExecutiveReport} className="export-button" title="Descargar reporte ejecutivo">
              📋 Reporte
            </button>
          </div>
          
          <span className="last-updated">
            Actualizado: {new Date(metrics.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Alertas desplegables */}
      {showAlerts && (
        <div className="alerts-panel">
          <h3>🔔 Alertas Recientes</h3>
          {alerts.length === 0 ? (
            <p className="no-alerts">No hay alertas pendientes</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className={`alert alert-${alert.type}`}>
                <div className="alert-content">
                  <strong>{alert.title}</strong>
                  <p>{alert.message}</p>
                  <small>{alert.timestamp}</small>
                </div>
                <button onClick={() => removeAlert(alert.id)} className="alert-close">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Grid de métricas principales */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h3>Total Operaciones</h3>
            <div className="metric-value">{metrics.totalOperations}</div>
            <div className="metric-subtitle">
              ✅ {metrics.successfulOperations} | ❌ {metrics.failedOperations}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <div className="metric-content">
            <h3>Tasa de Éxito</h3>
            <div className="metric-value">{getSuccessRate().toFixed(1)}%</div>
            <div className={`metric-subtitle ${getSuccessRate() >= 80 ? 'success' : getSuccessRate() >= 60 ? 'warning' : 'error'}`}>
              {getSuccessRate() >= 80 ? 'Excelente' : getSuccessRate() >= 60 ? 'Buena' : 'Mejorar'}
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Viewers</h3>
            <div className="metric-value">{metrics.totalViewers.toLocaleString()}</div>
            <div className="metric-subtitle">Acumulados</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Costo Total</h3>
            <div className="metric-value">${metrics.totalCost.toFixed(2)}</div>
            <div className="metric-subtitle">Operaciones exitosas</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⏱️</div>
          <div className="metric-content">
            <h3>Tiempo Promedio</h3>
            <div className="metric-value">{metrics.averageOperationTime.toFixed(0)}min</div>
            <div className="metric-subtitle">Por operación</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💵</div>
          <div className="metric-content">
            <h3>Costo por Viewer</h3>
            <div className="metric-value">
              ${metrics.totalViewers > 0 ? (metrics.totalCost / metrics.totalViewers).toFixed(4) : '0.0000'}
            </div>
            <div className="metric-subtitle">Eficiencia</div>
          </div>
        </div>
      </div>

      {/* Gráficos simples */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>📊 Operaciones por Bloque</h3>
          <div className="simple-chart">
            {Object.entries(metrics.operationsPerBlock).map(([blockId, count]) => (
              <div key={blockId} className="chart-bar">
                <div className="bar-label">B{parseInt(blockId.replace('block-', '')) + 1}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill" 
                    style={{ 
                      width: `${Math.max(10, (count / Math.max(...Object.values(metrics.operationsPerBlock), 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>⏰ Viewers por Hora</h3>
          <div className="simple-chart">
            {Object.entries(metrics.viewersPerHour)
              .sort(([a], [b]) => a.localeCompare(b))
              .slice(-8) // Mostrar últimas 8 horas
              .map(([hour, viewers]) => (
              <div key={hour} className="chart-bar">
                <div className="bar-label">{hour}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill viewers-bar" 
                    style={{ 
                      width: `${Math.max(10, (viewers / Math.max(...Object.values(metrics.viewersPerHour), 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{viewers}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
