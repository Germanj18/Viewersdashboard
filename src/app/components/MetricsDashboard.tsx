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
  totalResetOperations: number;
  totalResetViewers: number;
  operationsPerBlock: { [blockId: string]: number };
  viewersPerHour: { [hour: string]: number };
  viewersByServiceDuration: { [duration: string]: number };
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
    totalResetOperations: 0,
    totalResetViewers: 0,
    operationsPerBlock: {},
    viewersPerHour: {},
    viewersByServiceDuration: {},
    lastUpdated: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);

  // Función para obtener todos los datos de operaciones (actuales + historial)
  const getAllOperationsData = useCallback(() => {
    const allOperations: any[] = [];
    
    // Obtener historial global primero
    const globalHistoryKey = 'globalOperationsHistory';
    const globalHistory = localStorage.getItem(globalHistoryKey);
    if (globalHistory) {
      try {
        const parsedHistory = JSON.parse(globalHistory);
        parsedHistory.forEach((operation: any) => {
          allOperations.push({
            ...operation,
            isHistorical: true
          });
        });
      } catch (error) {
        console.error('Error parsing global history:', error);
      }
    }
    
    // CORRIGIDO: No agregar operaciones actuales porque ya están en el historial global
    // Cada operación se guarda inmediatamente al historial global cuando se ejecuta
    // Solo agregar operaciones actuales que NO estén ya en el historial sería complejo
    // y podría causar inconsistencias. El historial global es la fuente única de verdad.
    
    return allOperations.sort((a, b) => {
      const dateA = new Date(a.savedAt || a.timestamp);
      const dateB = new Date(b.savedAt || b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });
  }, []);

  // Función para obtener historial de resets
  const getResetHistory = useCallback(() => {
    const resetHistoryKey = 'blockResetHistory';
    const resetHistory = localStorage.getItem(resetHistoryKey);
    if (resetHistory) {
      try {
        return JSON.parse(resetHistory);
      } catch (error) {
        console.error('Error parsing reset history:', error);
        return [];
      }
    }
    return [];
  }, []);

  // Función para obtener duración de servicio en horas
  const getServiceDurationHours = (serviceId: number) => {
    switch (serviceId) {
      case 334: return 1;    // 1h
      case 335: return 1.5;  // 1.5h
      case 336: return 2;    // 2h
      case 337: return 2.5;  // 2.5h
      case 338: return 3;    // 3h
      case 459: return 4;    // 4h
      case 460: return 6;    // 6h
      case 657: return 8;    // 8h
      default: return 0;
    }
  };

  const getSuccessRate = () => {
    if (metrics.totalOperations === 0) return 0;
    return ((metrics.successfulOperations / metrics.totalOperations) * 100);
  };

  // Función para exportar datos como JSON
  const exportToJSON = useCallback(() => {
    const allOperations = getAllOperationsData();
    const resetHistory = getResetHistory();
    
    const exportData = {
      reportInfo: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Dashboard La Casa',
        reportType: 'Complete Operations Report',
        totalOperationsIncludingHistory: allOperations.length,
        blocksResetCount: resetHistory.length
      },
      summary: {
        totalOperations: metrics.totalOperations,
        successfulOperations: metrics.successfulOperations,
        failedOperations: metrics.failedOperations,
        successRate: getSuccessRate(),
        totalCost: metrics.totalCost,
        totalViewers: metrics.totalViewers,
        totalResetOperations: metrics.totalResetOperations,
        totalResetViewers: metrics.totalResetViewers,
        costPerViewer: metrics.totalViewers > 0 ? metrics.totalCost / metrics.totalViewers : 0
      },
      operationsPerBlock: metrics.operationsPerBlock,
      viewersPerHour: metrics.viewersPerHour,
      viewersByServiceDuration: metrics.viewersByServiceDuration,
      allOperations: allOperations, // Todas las operaciones, no solo recientes
      blockResetHistory: resetHistory,
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
  }, [metrics, alerts, getAllOperationsData, getResetHistory]);

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
      'Order Status',
      'Es Histórico'
    ];

    const csvRows = operations.map(op => [
      op.timestamp,
      `Bloque ${parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}`,
      op.status,
      op.message.replace(/,/g, ';'), // Escapar comas
      op.duration || 0,
      op.count || 0,
      op.serviceId || '',
      op.cost || 0,
      op.orderId || '',
      op.orderStatus || '',
      op.isHistorical ? 'Sí' : 'No'
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
    const resetHistory = getResetHistory();
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
        .historical { background-color: #fff3cd; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        .reset-section { margin: 30px 0; padding: 20px; background: #fff3cd; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">📊 REPORTE EJECUTIVO - DASHBOARD LA CASA</div>
        <p>Generado el: ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Total de operaciones (incluyendo historial): ${operations.length}</strong></p>
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
            <div class="metric-value">${metrics.totalResetOperations}</div>
            <div class="metric-label">Operaciones Reseteadas</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">$${metrics.totalViewers > 0 ? (metrics.totalCost / metrics.totalViewers).toFixed(4) : '0.0000'}</div>
            <div class="metric-label">Costo por Viewer</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.totalResetViewers.toLocaleString()}</div>
            <div class="metric-label">Viewers Reseteados</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${resetHistory.length}</div>
            <div class="metric-label">Bloques Reiniciados</div>
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

    <h2>⏱️ Viewers por Duración de Servicio</h2>
    <table class="operations-table">
        <thead>
            <tr>
                <th>Duración</th>
                <th>Viewers</th>
                <th>Porcentaje del Total</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(metrics.viewersByServiceDuration)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([duration, viewers]) => `
                <tr>
                    <td>${duration}</td>
                    <td>${viewers.toLocaleString()}</td>
                    <td>${metrics.totalViewers > 0 ? ((viewers / metrics.totalViewers) * 100).toFixed(1) : 0}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    ${resetHistory.length > 0 ? `
    <div class="reset-section">
        <h2>� Historial de Reinicializaciones</h2>
        <table class="operations-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Bloque</th>
                    <th>Operaciones Perdidas</th>
                    <th>Viewers Perdidos</th>
                </tr>
            </thead>
            <tbody>
                ${resetHistory.slice(-10).map((reset: any) => `
                    <tr>
                        <td>${new Date(reset.resetAt).toLocaleString('es-ES')}</td>
                        <td>${reset.blockTitle}</td>
                        <td>${reset.operationsLost}</td>
                        <td>${reset.viewersLost.toLocaleString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <h2>📋 Todas las Operaciones</h2>
    <p><em>Nota: Las operaciones con fondo amarillo son del historial (de bloques reiniciados)</em></p>
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
            ${operations.map(op => `
                <tr ${op.isHistorical ? 'class="historical"' : ''}>
                    <td>${op.timestamp}</td>
                    <td>Bloque ${parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}</td>
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
        <p><strong>Total de operaciones procesadas: ${operations.length}</strong></p>
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
  }, [metrics, getAllOperationsData, getResetHistory]);

  // Función para calcular métricas desde localStorage (incluyendo historial)
  const calculateMetrics = useCallback(() => {
    const newMetrics: OperationMetrics = {
      totalOperations: 0,
      successfulOperations: 0,
      failedOperations: 0,
      totalCost: 0,
      totalViewers: totalViewers,
      totalResetOperations: 0,
      totalResetViewers: 0,
      operationsPerBlock: {},
      viewersPerHour: {},
      viewersByServiceDuration: {},
      lastUpdated: new Date().toISOString()
    };

    let totalDuration = 0;
    let operationCount = 0;

    // Obtener todas las operaciones (históricas + actuales)
    const allOperations = getAllOperationsData();
    
    // Procesar todas las operaciones
    allOperations.forEach((operation: any) => {
      const blockId = operation.blockId || `block-${operation.blockId}`;
      
      // Contar operaciones por bloque
      newMetrics.operationsPerBlock[blockId] = (newMetrics.operationsPerBlock[blockId] || 0) + 1;
      
      newMetrics.totalOperations++;
      
      if (operation.status === 'success') {
        newMetrics.successfulOperations++;
        newMetrics.totalCost += operation.cost || 0;
        
        if (operation.duration) {
          totalDuration += operation.duration;
          operationCount++;
        }

        // Agrupar viewers por hora
        if (operation.timestamp && operation.count) {
          const hour = operation.timestamp.split(':')[0] + ':00';
          newMetrics.viewersPerHour[hour] = (newMetrics.viewersPerHour[hour] || 0) + operation.count;
        }

        // Agrupar viewers por duración de servicio
        if (operation.serviceId && operation.count) {
          const durationHours = getServiceDurationHours(operation.serviceId);
          const durationKey = `${durationHours}h`;
          newMetrics.viewersByServiceDuration[durationKey] = (newMetrics.viewersByServiceDuration[durationKey] || 0) + operation.count;
        }
      } else {
        newMetrics.failedOperations++;
      }
    });

    // Calcular métricas de resets
    const resetHistory = getResetHistory();
    resetHistory.forEach((reset: any) => {
      newMetrics.totalResetOperations += reset.operationsLost || 0;
      newMetrics.totalResetViewers += reset.viewersLost || 0;
    });

    setMetrics(newMetrics);
  }, [totalViewers, getAllOperationsData]);

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
          <div className="metric-icon">🔄</div>
          <div className="metric-content">
            <h3>Operaciones Reseteadas</h3>
            <div className="metric-value">{metrics.totalResetOperations}</div>
            <div className="metric-subtitle">Total acumulado</div>
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

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Viewers Reseteados</h3>
            <div className="metric-value">{metrics.totalResetViewers.toLocaleString()}</div>
            <div className="metric-subtitle">Total acumulado</div>
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

        <div className="chart-card">
          <h3>⏱️ Viewers por Duración de Servicio</h3>
          <div className="simple-chart">
            {Object.entries(metrics.viewersByServiceDuration)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b)) // Ordenar por duración
              .map(([duration, viewers]) => (
              <div key={duration} className="chart-bar">
                <div className="bar-label">{duration}</div>
                <div className="bar-container">
                  <div 
                    className="bar-fill duration-bar" 
                    style={{ 
                      width: `${Math.max(10, (viewers / Math.max(...Object.values(metrics.viewersByServiceDuration), 1)) * 100)}%` 
                    }}
                  ></div>
                </div>
                <div className="bar-value">{viewers.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
