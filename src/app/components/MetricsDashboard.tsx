import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { useGlobal } from './GlobalContext';
import { NotificationService, showToast } from './NotificationService';
import * as XLSX from 'xlsx';
import './MetricsDashboard.css';

interface YouTubeStreamData {
  videoId: string;
  url: string;
  title: string;
  currentViewers: number;
  isLive: boolean;
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
  growthPercent: number;
  predictedFinal: number;
}

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
  costByServiceDuration: { [duration: string]: number };
  youtubeStreams: { [url: string]: YouTubeStreamData };
  lastUpdated: string;
}

interface Alert {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  blockId?: string;
  youtubeUrl?: string;
}

const MetricsDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { totalViewers, getExpiredViewersCount } = useGlobal();
  
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
    costByServiceDuration: {},
    youtubeStreams: {},
    lastUpdated: new Date().toISOString()
  });

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);

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
    
    console.log('🔍 Debug Reset History:', {
      key: resetHistoryKey,
      exists: !!resetHistory,
      rawData: resetHistory,
      length: resetHistory?.length || 0
    });
    
    if (resetHistory) {
      try {
        const parsed = JSON.parse(resetHistory);
        console.log('📊 Parsed Reset History:', {
          totalResets: parsed.length,
          sampleData: parsed.slice(0, 3),
          totalOperationsLost: parsed.reduce((sum: number, reset: any) => sum + (reset.operationsLost || 0), 0),
          totalViewersLost: parsed.reduce((sum: number, reset: any) => sum + (reset.viewersLost || 0), 0)
        });
        return parsed;
      } catch (error) {
        console.error('Error parsing reset history:', error);
        return [];
      }
    }
    
    // Si no hay historial, crear uno vacío y buscar posibles datos en otras claves
    console.log('⚠️ No se encontró historial de resets, buscando en otras claves...');
    
    // Buscar datos de resets en claves alternativas
    const allKeys = Object.keys(localStorage);
    const possibleResetKeys = allKeys.filter(key => 
      key.toLowerCase().includes('reset') || 
      key.toLowerCase().includes('history') ||
      key.includes('block') && key.includes('reset')
    );
    
    console.log('🔍 Claves posibles para resets:', possibleResetKeys);
    
    // Intentar reconstruir historial desde datos de bloques
    const reconstructedHistory = [];
    for (let i = 0; i < 10; i++) {
      const blockStateKey = `blockState_block-${i}`;
      const blockState = localStorage.getItem(blockStateKey);
      if (blockState) {
        try {
          const parsed = JSON.parse(blockState);
          // Si el bloque fue reseteado, podemos inferir datos
          if (parsed.status && parsed.status.length > 0 && parsed.totalViewers > 0) {
            console.log(`📋 Bloque ${i} tiene datos:`, {
              operations: parsed.status.length,
              viewers: parsed.totalViewers,
              lastSaved: parsed.lastSaved
            });
          }
        } catch (error) {
          console.error(`Error parsing block ${i}:`, error);
        }
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

  // Función para crear datos de prueba de resets si no existen
  const createSampleResetData = useCallback(() => {
    const resetHistoryKey = 'blockResetHistory';
    const existing = localStorage.getItem(resetHistoryKey);
    
    // Siempre crear datos de prueba frescos durante desarrollo
    if (!existing || existing === '[]') {
      const sampleResets = [
        {
          blockId: 'block-9',
          blockTitle: 'Bloque 10',
          resetAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Hace 1 día
          operationsLost: 15,      // 15 operaciones exitosas enviadas
          viewersLost: 3500,       // 3500 viewers enviados
          totalOperations: 18,     // 18 operaciones totales (15 exitosas + 3 fallidas)
          totalViewers: 3500       // Total de viewers acumulados
        },
        {
          blockId: 'block-8',
          blockTitle: 'Bloque 9',
          resetAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
          operationsLost: 8,       // 8 operaciones exitosas enviadas
          viewersLost: 1800,       // 1800 viewers enviados
          totalOperations: 10,     // 10 operaciones totales (8 exitosas + 2 fallidas)
          totalViewers: 1800       // Total de viewers acumulados
        },
        {
          blockId: 'block-7',
          blockTitle: 'Bloque 8',
          resetAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Hace 3 días
          operationsLost: 12,      // 12 operaciones exitosas enviadas
          viewersLost: 2400,       // 2400 viewers enviados
          totalOperations: 15,     // 15 operaciones totales (12 exitosas + 3 fallidas)
          totalViewers: 2400       // Total de viewers acumulados
        }
      ];
      
      localStorage.setItem(resetHistoryKey, JSON.stringify(sampleResets));
      console.log('✅ Datos de prueba de resets creados:', sampleResets);
      return sampleResets;
    }
    
    return null;
  }, []);

  const getSuccessRate = useCallback(() => {
    if (metrics.totalOperations === 0) return 0;
    return ((metrics.successfulOperations / metrics.totalOperations) * 100);
  }, [metrics.totalOperations, metrics.successfulOperations]);

  // Función para obtener operaciones expiradas con detalles
  const getExpiredOperationsDetails = useCallback(() => {
    const allOperations = getAllOperationsData();
    const expiredOperations: any[] = [];
    const currentTime = new Date();

    allOperations.forEach((operation: any) => {
      if (operation.status === 'success' && operation.savedAt && operation.duration) {
        try {
          const startTime = new Date(operation.savedAt);
          const endTime = new Date(startTime.getTime() + (operation.duration * 60 * 1000));
          
          if (currentTime >= endTime) {
            // Esta operación ha expirado
            const startTimeFormatted = startTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            
            const endTimeFormatted = endTime.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });

            const dateFormatted = startTime.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            expiredOperations.push({
              ...operation,
              startTimeFormatted,
              endTimeFormatted,
              dateFormatted,
              startTime: startTime,
              endTime: endTime,
              minutesExpired: Math.floor((currentTime.getTime() - endTime.getTime()) / (1000 * 60))
            });
          }
        } catch (error) {
          console.warn('Error processing operation for expiration:', error);
        }
      }
    });

    // Ordenar por hora de finalización (más recientes primero)
    return expiredOperations.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
  }, [getAllOperationsData]);

  // Función para obtener datos de YouTube del localStorage
  const getYouTubeStreamsData = useCallback(() => {
    const streamsData: { [url: string]: YouTubeStreamData } = {};
    
    try {
      // Buscar datos de YouTube en localStorage
      const youtubeDataKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('youtubeMonitor_') || key.includes('youtube')
      );
      
      youtubeDataKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.url && data.viewers !== undefined) {
            const videoId = extractVideoId(data.url);
            if (videoId) {
              streamsData[data.url] = {
                videoId,
                url: data.url,
                title: data.title || 'Stream de YouTube',
                currentViewers: data.viewers || 0,
                isLive: data.isLive || false,
                lastUpdated: data.timestamp || new Date().toISOString(),
                trend: data.trend || 'stable',
                growthPercent: data.growthPercent || 0,
                predictedFinal: data.predictedFinal || 0
              };
            }
          }
        } catch (error) {
          console.warn('Error parsing YouTube data:', error);
        }
      });
      
      // También buscar en sessionStorage si no hay datos en localStorage
      if (Object.keys(streamsData).length === 0) {
        const sessionKeys = Object.keys(sessionStorage).filter(key => 
          key.includes('youtube') || key.includes('monitor')
        );
        
        sessionKeys.forEach(key => {
          try {
            const data = JSON.parse(sessionStorage.getItem(key) || '{}');
            if (data.url && data.viewers !== undefined) {
              const videoId = extractVideoId(data.url);
              if (videoId) {
                streamsData[data.url] = {
                  videoId,
                  url: data.url,
                  title: data.title || 'Stream de YouTube',
                  currentViewers: data.viewers || 0,
                  isLive: data.isLive || false,
                  lastUpdated: data.timestamp || new Date().toISOString(),
                  trend: data.trend || 'stable',
                  growthPercent: data.growthPercent || 0,
                  predictedFinal: data.predictedFinal || 0
                };
              }
            }
          } catch (error) {
            console.warn('Error parsing YouTube session data:', error);
          }
        });
      }
      
    } catch (error) {
      console.error('Error getting YouTube streams data:', error);
    }
    
    return streamsData;
  }, []);

  // Función para extraer video ID de URL de YouTube
  const extractVideoId = (url: string): string | null => {
    try {
      const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  // Función para exportar datos como JSON
  const exportToJSON = useCallback(() => {
    const allOperations = getAllOperationsData();
    const resetHistory = getResetHistory();
    const youtubeHistory = getYouTubeMonitoringHistory();
    
    const exportData = {
      reportInfo: {
        generatedAt: new Date().toISOString(),
        generatedBy: 'Dashboard de Métricas',
        reportType: 'Complete Operations Report',
        totalOperationsIncludingHistory: allOperations.length,
        blocksResetCount: resetHistory.length,
        youtubeStreamsMonitored: Object.keys(metrics.youtubeStreams).length,
        youtubeHistoryEntries: youtubeHistory.length
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
      youtubeStreams: {
        currentStreams: metrics.youtubeStreams,
        monitoringHistory: youtubeHistory.sort((a, b) => 
          new Date(b.timestamp || b.lastUpdate || 0).getTime() - 
          new Date(a.timestamp || a.lastUpdate || 0).getTime()
        )
      },
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
  }, [metrics, alerts, getAllOperationsData, getResetHistory, getSuccessRate]);

  // Función para exportar como CSV
  const exportToCSV = useCallback(() => {
    const operations = getAllOperationsData();
    const youtubeHistory = getYouTubeMonitoringHistory();
    
    // Headers para operaciones
    const operationsHeaders = [
      'Fecha y Hora',
      'Hora Inicio',
      'Hora Finalización',
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

    // Headers para YouTube
    const youtubeHeaders = [
      'Fecha y Hora',
      'URL',
      'Título',
      'Viewers',
      'Estado (Live/Offline)',
      'Tendencia',
      'Cambio',
      'Fuente'
    ];

    const csvRows = operations.map(op => {
      // Calcular hora de finalización usando savedAt o startTime como base
      let estimatedEndTime = 'N/A';
      // El timestamp ya es la hora de inicio en formato HH:MM:SS
      const startTimeDisplay = op.timestamp;
      
      if (op.duration && (op.savedAt || op.startTime)) {
        try {
          // Usar savedAt o startTime como base (tienen fecha completa)
          const baseTime = op.savedAt || op.startTime;
          const startDate = new Date(baseTime);
          
          // Verificar que la fecha es válida y calcular finalización
          if (!isNaN(startDate.getTime())) {
            const endTime = new Date(startDate.getTime() + (op.duration * 60 * 1000));
            if (!isNaN(endTime.getTime())) {
              // Formatear solo la hora para coincidir con el formato del timestamp
              const hours = endTime.getHours().toString().padStart(2, '0');
              const minutes = endTime.getMinutes().toString().padStart(2, '0');
              const seconds = endTime.getSeconds().toString().padStart(2, '0');
              estimatedEndTime = `${hours}:${minutes}:${seconds}`;
            }
          }
        } catch (error) {
          console.warn('Error calculando tiempo de finalización en CSV:', error);
          estimatedEndTime = 'N/A';
        }
      }

      return [
        op.timestamp,
        startTimeDisplay || 'N/A',
        estimatedEndTime || 'N/A',
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
      ];
    });

    // Crear filas para el historial de YouTube
    const youtubeRows = youtubeHistory.map(entry => {
      const changeValue = entry.change || 0;
      const changeDisplay = changeValue === 0 ? '0' : 
                           changeValue > 0 ? `+${changeValue.toLocaleString()}` : 
                           changeValue.toLocaleString();
      
      return [
        new Date(entry.timestamp || entry.lastUpdate || 0).toLocaleString('es-ES'),
        entry.url || '',
        (entry.title || '').replace(/,/g, ';'), // Escapar comas
        entry.currentViewers || 0,
        entry.isLive ? 'En Vivo' : 'Offline',
        entry.trend || 'N/A',
        changeDisplay,
        entry.source || 'YouTube Monitor'
      ];
    });

    // Crear contenido CSV para operaciones
    const operationsContent = [operationsHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
      
    // Crear contenido CSV para YouTube
    const youtubeContent = youtubeRows.length > 0 ? 
      ['\n\n=== HISTORIAL DE YOUTUBE ===', youtubeHeaders, ...youtubeRows]
        .map(row => Array.isArray(row) ? row.map(field => `"${field}"`).join(',') : row)
        .join('\n') : 
      '\n\n=== HISTORIAL DE YOUTUBE ===\nNo hay datos de YouTube disponibles';
    
    // Agregar sección resumen de costo por duración de servicio
    const summarySection = [
      '\n\n=== RESUMEN POR DURACIÓN DE SERVICIO ===',
      'Duración,Viewers,Costo Total',
      ...Object.entries(metrics.viewersByServiceDuration)
        .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
        .map(([duration, viewers]) => {
          const cost = metrics.costByServiceDuration[duration] || 0;
          return `"${duration}","${viewers}","$${cost.toFixed(2)}"`;
        })
    ].join('\n');

    const fullCsvContent = operationsContent + youtubeContent + summarySection;

    const blob = new Blob([fullCsvContent], { type: 'text/csv;charset=utf-8;' });
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
    const youtubeHistory = getYouTubeMonitoringHistory();
    
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte Ejecutivo - Dashboard de Métricas</title>
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
        <div class="logo">📊 REPORTE EJECUTIVO - DASHBOARD DE MÉTRICAS</div>
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
            <div class="metric-value">\$${metrics.totalCost.toFixed(2)}</div>
            <div class="metric-label">Costo Total</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.totalResetOperations}</div>
            <div class="metric-label">Operaciones de Bloques Reiniciados</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">\$${metrics.totalViewers > 0 ? (metrics.totalCost / metrics.totalViewers).toFixed(4) : '0.0000'}</div>
            <div class="metric-label">Costo por Viewer</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${metrics.totalResetViewers.toLocaleString()}</div>
            <div class="metric-label">Viewers de Bloques Reiniciados</div>
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
                <th>Costo Total</th>
                <th>Porcentaje del Total</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(metrics.viewersByServiceDuration)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([duration, viewers]) => {
                const cost = metrics.costByServiceDuration[duration] || 0;
                return `
                <tr>
                    <td>${duration}</td>
                    <td>${viewers.toLocaleString()}</td>
                    <td>\$${cost.toFixed(2)}</td>
                    <td>${metrics.totalViewers > 0 ? ((viewers / metrics.totalViewers) * 100).toFixed(1) : 0}%</td>
                </tr>
                `;
              }).join('')}
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
                    <th>Operaciones Enviadas</th>
                    <th>Viewers Enviados</th>
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

    ${youtubeHistory.length > 0 ? `
    <h2>📺 Historial de Monitoreo de YouTube</h2>
    <table class="operations-table">
        <thead>
            <tr>
                <th>Fecha y Hora</th>
                <th>Título</th>
                <th>Viewers</th>
                <th>Estado</th>
                <th>Tendencia</th>
                <th>Cambio</th>
            </tr>
        </thead>
        <tbody>
            ${youtubeHistory.slice(0, 50).map(entry => `
                <tr>
                    <td>${new Date(entry.timestamp || entry.lastUpdate || 0).toLocaleString('es-ES')}</td>
                    <td>${(entry.title || 'Stream de YouTube').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
                    <td>${(entry.viewers || entry.currentViewers || 0).toLocaleString()}</td>
                    <td>${entry.isLive ? '🔴 En Vivo' : '⏹️ Offline'}</td>
                    <td>${entry.trend === 'up' ? '📈 Subiendo' : entry.trend === 'down' ? '📉 Bajando' : '➡️ Estable'}</td>
                    <td>${(() => {
                      const changeValue = entry.change || 0;
                      if (changeValue === 0) return '0';
                      return changeValue > 0 ? `+${changeValue.toLocaleString()}` : changeValue.toLocaleString();
                    })()}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <p><em>Mostrando las últimas 50 mediciones de YouTube</em></p>
    ` : ''}

    <h2>📋 Todas las Operaciones</h2>
    <p><em>Nota: Las operaciones con fondo amarillo son del historial (de bloques reiniciados)</em></p>
    <table class="operations-table">
        <thead>
            <tr>
                <th>Fecha y Hora</th>
                <th>Hora Inicio</th>
                <th>Finalización</th>
                <th>Bloque</th>
                <th>Estado</th>
                <th>Viewers</th>
                <th>Duración</th>
                <th>Costo</th>
            </tr>
        </thead>
        <tbody>
            ${operations.map(op => {
              // Calcular hora de finalización usando savedAt o startTime como base
              let estimatedEndTime = 'N/A';
              // El timestamp ya es la hora de inicio en formato HH:MM:SS
              const startTimeDisplay = op.timestamp;
              
              if (op.duration && (op.savedAt || op.startTime)) {
                try {
                  // Usar savedAt o startTime como base (tienen fecha completa)
                  const baseTime = op.savedAt || op.startTime;
                  const startDate = new Date(baseTime);
                  
                  // Verificar que la fecha es válida y calcular finalización
                  if (!isNaN(startDate.getTime())) {
                    const endTime = new Date(startDate.getTime() + (op.duration * 60 * 1000));
                    if (!isNaN(endTime.getTime())) {
                      // Formatear solo la hora para coincidir con el formato del timestamp
                      const hours = endTime.getHours().toString().padStart(2, '0');
                      const minutes = endTime.getMinutes().toString().padStart(2, '0');
                      const seconds = endTime.getSeconds().toString().padStart(2, '0');
                      estimatedEndTime = `${hours}:${minutes}:${seconds}`;
                    }
                  }
                } catch (error) {
                  console.warn('Error calculando tiempo de finalización en HTML:', error);
                  estimatedEndTime = 'N/A';
                }
              }

              return `
                <tr ${op.isHistorical ? 'class="historical"' : ''}>
                    <td>${op.timestamp}</td>
                    <td>${startTimeDisplay || 'N/A'}</td>
                    <td>${estimatedEndTime || 'N/A'}</td>
                    <td>Bloque ${parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}</td>
                    <td class="status-${op.status}">${op.status === 'success' ? '✅ Exitosa' : '❌ Fallida'}</td>
                    <td>${op.count || 0}</td>
                    <td>${op.duration || 0} min</td>
                    <td>$${op.cost || 0}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Reporte generado automáticamente por Dashboard de Métricas</p>
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
      costByServiceDuration: {},
      youtubeStreams: {},
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
        const operationCost = operation.cost || 0;
        newMetrics.totalCost += operationCost;
        
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
          
          // Agrupar costo por duración de servicio
          if (operation.cost !== undefined) {
            newMetrics.costByServiceDuration[durationKey] = (newMetrics.costByServiceDuration[durationKey] || 0) + operation.cost;
          }
        }
      } else {
        newMetrics.failedOperations++;
      }
    });

    // Calcular métricas de resets
    // Primero intentar crear datos de prueba si no existen
    createSampleResetData();
    
    const resetHistory = getResetHistory();
    console.log('📊 Calculando métricas de resets:', {
      resetHistoryLength: resetHistory.length,
      resetHistory: resetHistory.slice(0, 5) // Mostrar primeros 5 para debug
    });
    
    resetHistory.forEach((reset: any) => {
      const operationsLost = reset.operationsLost || 0;
      const viewersLost = reset.viewersLost || 0;
      
      console.log(`🔄 Procesando reset:`, {
        blockId: reset.blockId,
        blockTitle: reset.blockTitle,
        operationsLost: operationsLost,
        viewersLost: viewersLost,
        resetAt: reset.resetAt,
        note: 'operationsLost = operaciones exitosas enviadas, viewersLost = viewers enviados'
      });
      
      newMetrics.totalResetOperations += operationsLost;
      newMetrics.totalResetViewers += viewersLost;
    });
    
    console.log('✅ Métricas finales de resets:', {
      totalResetOperations: newMetrics.totalResetOperations,
      totalResetViewers: newMetrics.totalResetViewers
    });

    // Obtener datos de YouTube
    newMetrics.youtubeStreams = getYouTubeStreamsData();

    setMetrics(newMetrics);
  }, [totalViewers, getAllOperationsData, getYouTubeStreamsData, getResetHistory, createSampleResetData]);

  // Función para generar alertas con mejor detección de cambios
  const generateAlerts = useCallback(() => {
    const newAlerts: Alert[] = [];
    const currentTime = new Date().toLocaleTimeString();

    // Alerta de tasa de fallo alta
    const failureRate = metrics.totalOperations > 0 ? (metrics.failedOperations / metrics.totalOperations) * 100 : 0;
    if (failureRate > 20 && metrics.totalOperations > 5) {
      const alertId = `high-failure-rate-${Math.floor(failureRate)}`;
      const alert = {
        id: alertId,
        type: 'error' as const,
        title: '⚠️ Alta Tasa de Fallo',
        message: `${failureRate.toFixed(1)}% de operaciones están fallando`,
        timestamp: currentTime
      };
      newAlerts.push(alert);
    }

    // Alerta de objetivo alcanzado - Mejorar detección
    const lastKnownViewers = parseInt(localStorage.getItem('lastKnownViewers') || '0');
    if (metrics.totalViewers > lastKnownViewers) {
      // Detectar múltiplos de 1000
      const newThousands = Math.floor(metrics.totalViewers / 1000);
      const oldThousands = Math.floor(lastKnownViewers / 1000);
      
      if (newThousands > oldThousands && metrics.totalViewers >= 1000) {
        const alert = {
          id: `milestone-${newThousands}k-${Date.now()}`,
          type: 'success' as const,
          title: '🎯 Objetivo Alcanzado',
          message: `¡Has alcanzado ${metrics.totalViewers.toLocaleString()} viewers! (+${metrics.totalViewers - lastKnownViewers} nuevos)`,
          timestamp: currentTime
        };
        newAlerts.push(alert);
      }
      
      // Actualizar el último valor conocido
      localStorage.setItem('lastKnownViewers', metrics.totalViewers.toString());
    }

    // Alerta de costo alto - Mejorar detección
    const lastKnownCost = parseFloat(localStorage.getItem('lastKnownCost') || '0');
    if (metrics.totalCost > lastKnownCost && metrics.totalCost > 500) {
      const alert = {
        id: `high-cost-${Math.floor(metrics.totalCost)}-${Date.now()}`,
        type: 'warning' as const,
        title: '💰 Costo Elevado',
        message: `Costo total: \$${metrics.totalCost.toFixed(2)} (+\$${(metrics.totalCost - lastKnownCost).toFixed(2)})`,
        timestamp: currentTime
      };
      newAlerts.push(alert);
      localStorage.setItem('lastKnownCost', metrics.totalCost.toString());
    } else if (metrics.totalCost > lastKnownCost) {
      localStorage.setItem('lastKnownCost', metrics.totalCost.toString());
    }

    // Alerta de operaciones completadas recientemente - Mejorar detección
    const lastKnownOperations = parseInt(localStorage.getItem('lastKnownOperations') || '0');
    const recentOperations = metrics.totalOperations - lastKnownOperations;
    if (recentOperations > 0) {
      if (recentOperations >= 5) {
        const alert = {
          id: `batch-completed-${Date.now()}`,
          type: 'info' as const,
          title: '📊 Lote Completado',
          message: `Se completaron ${recentOperations} operaciones nuevas`,
          timestamp: currentTime
        };
        newAlerts.push(alert);
      }
      localStorage.setItem('lastKnownOperations', metrics.totalOperations.toString());
    }

    // Alerta de operaciones exitosas recientes
    const lastKnownSuccessful = parseInt(localStorage.getItem('lastKnownSuccessful') || '0');
    const recentSuccessful = metrics.successfulOperations - lastKnownSuccessful;
    if (recentSuccessful > 0) {
      if (recentSuccessful >= 3) {
        const alert = {
          id: `success-streak-${Date.now()}`,
          type: 'success' as const,
          title: '✅ Racha de Éxito',
          message: `${recentSuccessful} operaciones exitosas completadas`,
          timestamp: currentTime
        };
        newAlerts.push(alert);
      }
      localStorage.setItem('lastKnownSuccessful', metrics.successfulOperations.toString());
    }

    return newAlerts;
  }, [metrics]);

  // Actualizar métricas cada 2 segundos para mejor detección de cambios
  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 2000);
    return () => clearInterval(interval);
  }, [calculateMetrics]);

  // Generar alertas cuando cambien las métricas
  useEffect(() => {
    const newAlerts = generateAlerts();
    
    if (newAlerts.length > 0) {
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
    }
  }, [generateAlerts]);

  const removeAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Función para eliminar un stream de YouTube del monitoreo
  const removeYouTubeStream = (url: string) => {
    try {
      // Buscar y eliminar de localStorage
      const youtubeDataKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('youtubeMonitor_') || key.includes('youtube')
      );
      
      youtubeDataKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.url === url) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          console.warn('Error checking localStorage key:', key, error);
        }
      });

      // También eliminar de sessionStorage si existe
      const sessionKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('youtube') || key.includes('monitor')
      );
      
      sessionKeys.forEach(key => {
        try {
          const data = JSON.parse(sessionStorage.getItem(key) || '{}');
          if (data.url === url) {
            sessionStorage.removeItem(key);
          }
        } catch (error) {
          console.warn('Error checking sessionStorage key:', key, error);
        }
      });

      // Actualizar métricas inmediatamente
      calculateMetrics();
      
      showToast('Stream eliminado del monitoreo', 'info');
    } catch (error) {
      console.error('Error eliminando stream de YouTube:', error);
      showToast('❌ Error al eliminar stream', 'error');
    }
  };

  // Función para obtener el historial completo de monitoreo de YouTube
  const getYouTubeMonitoringHistory = useCallback(() => {
    const historyData: any[] = [];
    
    try {
      // Buscar específicamente las claves de historial de YouTube
      const allKeys = Object.keys(localStorage);
      
      console.log('🔍 Buscando historial de YouTube en localStorage...');
      console.log('📊 Total de claves en localStorage:', allKeys.length);
      
      // Buscar claves de historial específicas (youtubeHistory_*)
      const historyKeys = allKeys.filter(key => key.startsWith('youtubeHistory_'));
      console.log('📈 Claves de historial encontradas:', historyKeys.length, historyKeys);
      
      historyKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(data)) {
            console.log(`📚 Procesando historial ${key} con ${data.length} entradas`);
            data.forEach(entry => {
              if (entry.url && (entry.viewers !== undefined || entry.currentViewers !== undefined)) {
                historyData.push({
                  url: entry.url,
                  title: entry.title || 'Stream de YouTube',
                  viewers: entry.viewers || entry.currentViewers || 0,
                  currentViewers: entry.viewers || entry.currentViewers || 0,
                  isLive: entry.isLive || false,
                  timestamp: entry.timestamp || entry.lastUpdated || new Date().toISOString(),
                  trend: entry.trend || 'stable',
                  growthPercent: entry.growthPercent || 0,
                  change: entry.change || entry.growthPercent || 0,
                  estado: entry.estado || (entry.isLive ? 'En Vivo' : 'Offline'),
                  source: entry.source || key
                });
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ Error parsing YouTube history from ${key}:`, error);
        }
      });
      
      // Si no hay historial específico, buscar datos individuales como fallback
      if (historyData.length === 0) {
        console.log('🔄 No se encontró historial específico, buscando datos individuales...');
        allKeys.forEach(key => {
          if (key.includes('youtube') || key.includes('YouTube')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '{}');
              
              // Si es un objeto individual con datos válidos
              if (data.url && (data.viewers !== undefined || data.currentViewers !== undefined)) {
                console.log(`� Encontrado objeto individual en ${key}:`, data);
                historyData.push({
                  url: data.url,
                  title: data.title || 'Stream de YouTube',
                  viewers: data.viewers || data.currentViewers || 0,
                  currentViewers: data.viewers || data.currentViewers || 0,
                  isLive: data.isLive || false,
                  timestamp: data.timestamp || data.lastUpdated || new Date().toISOString(),
                  trend: data.trend || 'stable',
                  growthPercent: data.growthPercent || 0,
                  change: data.change || data.growthPercent || 0,
                  estado: data.isLive ? 'En Vivo' : 'Offline',
                  source: key
                });
              }
            } catch (error) {
              console.warn(`⚠️ Error parsing individual YouTube data from ${key}:`, error);
            }
          }
        });
      }
      
      console.log(`📊 Total de entradas de historial encontradas: ${historyData.length}`);
      
      // Remover duplicados basados en URL, timestamp y viewers (para evitar duplicados exactos)
      const uniqueHistory = historyData.filter((item, index, self) => {
        const duplicateIndex = self.findIndex(t => 
          t.url === item.url && 
          t.timestamp === item.timestamp && 
          t.viewers === item.viewers
        );
        return duplicateIndex === index;
      });
      
      console.log(`📈 Entradas únicas después de eliminar duplicados: ${uniqueHistory.length}`);
      
      // Ordenar por timestamp descendente (más reciente primero)
      const sortedHistory = uniqueHistory.sort((a, b) => {
        const dateA = new Date(a.timestamp || 0);
        const dateB = new Date(b.timestamp || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      console.log('📊 Historial de YouTube procesado:', {
        totalEntries: sortedHistory.length,
        uniqueUrls: Array.from(new Set(sortedHistory.map(h => h.url))).length,
        dateRange: sortedHistory.length > 0 ? {
          newest: sortedHistory[0]?.timestamp,
          oldest: sortedHistory[sortedHistory.length - 1]?.timestamp
        } : null
      });
      
      return sortedHistory;
      
    } catch (error) {
      console.error('❌ Error getting YouTube monitoring history:', error);
      return [];
    }
  }, []);

  // Función para descargar operaciones expiradas como CSV
  const downloadExpiredOperationsCSV = useCallback(() => {
    const expiredOps = getExpiredOperationsDetails();
    
    if (expiredOps.length === 0) {
      showToast('⚠️ No hay operaciones expiradas para descargar', 'warning');
      return;
    }

    const headers = [
      'Fecha',
      'Bloque',
      'Hora Inicio',
      'Hora Finalización',
      'Duración (min)',
      'Viewers',
      'Costo ($)',
      'Service ID',
      'Minutos Expirados',
      'Estado'
    ];

    const csvRows = expiredOps.map(op => [
      op.dateFormatted,
      `Bloque ${parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}`,
      op.startTimeFormatted,
      op.endTimeFormatted,
      op.duration || 0,
      (op.count || 0).toLocaleString(),
      (op.cost || 0).toFixed(2),
      op.serviceId || 'N/A',
      op.minutesExpired,
      'Expirada'
    ]);

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `operaciones-expiradas-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📥 Operaciones expiradas descargadas', 'success');
  }, [getExpiredOperationsDetails]);

  // Función para descargar tabla de operaciones como CSV
  const downloadOperationsTableCSV = useCallback(() => {
    const operations = getAllOperationsData();
    
    const headers = [
      'Bloque',
      'Estado',
      'Hora Inicio',
      'Finalización Estimada',
      'Duración (min)',
      'Viewers',
      'Costo ($)',
      'Es Histórico'
    ];

    const csvRows = operations.map(op => {
      // Calcular hora de finalización
      let estimatedEndTime = 'N/A';
      const startTimeDisplay = op.timestamp;
      
      if (op.duration && (op.savedAt || op.startTime)) {
        try {
          const baseTime = op.savedAt || op.startTime;
          const startDate = new Date(baseTime);
          
          if (!isNaN(startDate.getTime())) {
            const endTime = new Date(startDate.getTime() + (op.duration * 60 * 1000));
            if (!isNaN(endTime.getTime())) {
              const hours = endTime.getHours().toString().padStart(2, '0');
              const minutes = endTime.getMinutes().toString().padStart(2, '0');
              const seconds = endTime.getSeconds().toString().padStart(2, '0');
              estimatedEndTime = `${hours}:${minutes}:${seconds}`;
            }
          }
        } catch (error) {
          estimatedEndTime = 'N/A';
        }
      }

      return [
        `Bloque ${parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}`,
        op.status === 'success' ? 'Exitosa' : 'Fallida',
        startTimeDisplay || 'N/A',
        estimatedEndTime,
        op.duration || 0,
        (op.count || 0).toLocaleString(),
        (op.cost || 0).toFixed(2),
        op.isHistorical ? 'Sí' : 'No'
      ];
    });

    const csvContent = [headers, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabla-operaciones-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('📊 Tabla de operaciones descargada', 'success');
  }, [getAllOperationsData]);

  // Función para descargar historial de monitoreo de YouTube como XLSX
  const downloadYouTubeHistoryXLSX = useCallback(() => {
    const youtubeHistory = getYouTubeMonitoringHistory();
    
    if (youtubeHistory.length === 0) {
      showToast('⚠️ No hay historial de YouTube para descargar', 'warning');
      return;
    }

    // Preparar los datos para Excel con cada campo en su propia columna
    const excelData = youtubeHistory.map(entry => {
      const changeValue = entry.change || 0;
      const changeDisplay = changeValue === 0 ? '0' : 
                           changeValue > 0 ? `+${changeValue.toLocaleString()}` : 
                           changeValue.toLocaleString();
      
      return {
        'Fecha y Hora': new Date(entry.timestamp || entry.lastUpdate || 0).toLocaleString('es-ES'),
        'Título': entry.title || 'Stream de YouTube',
        'Viewers': entry.viewers || entry.currentViewers || 0,
        'Estado': entry.isLive ? 'En Vivo' : 'Offline',
        'Tendencia': entry.trend === 'up' ? 'Subiendo' : entry.trend === 'down' ? 'Bajando' : 'Estable',
        'Cambio': changeDisplay,
        'URL': entry.url || '',
        'Fuente': entry.source || 'YouTube Monitor'
      };
    });

    try {
      // Crear workbook y worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Configurar el ancho de las columnas para mejor visualización
      const columnWidths = [
        { wch: 20 }, // Fecha y Hora
        { wch: 40 }, // Título
        { wch: 12 }, // Viewers
        { wch: 12 }, // Estado
        { wch: 12 }, // Tendencia
        { wch: 12 }, // Cambio
        { wch: 50 }, // URL
        { wch: 20 }  // Fuente
      ];
      worksheet['!cols'] = columnWidths;

      // Agregar hoja al workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial YouTube');

      // Generar el archivo y descargarlo
      const fileName = `historial-youtube-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      showToast('📺 Historial de YouTube descargado como Excel', 'success');
    } catch (error) {
      console.error('Error generando archivo Excel:', error);
      showToast('❌ Error al generar archivo Excel', 'error');
    }
  }, [getYouTubeMonitoringHistory]);

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
            <div className="metric-value">{totalViewers.toLocaleString()}</div>
            <div className="metric-subtitle">
              Enviados: {(metrics.totalViewers + getExpiredViewersCount() + metrics.totalResetViewers).toLocaleString()} | 
              Expirados: -{getExpiredViewersCount().toLocaleString()}
            </div>
          </div>
        </div>

        <div className="metric-card clickable-card" onClick={() => setShowExpiredModal(true)} style={{ cursor: 'pointer' }}>
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <h3>Viewers Expirados</h3>
            <div className="metric-value" style={{ color: '#ef4444' }}>
              -{getExpiredViewersCount().toLocaleString()}
            </div>
            <div className="metric-subtitle">Operaciones terminadas</div>
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
            <h3>Operaciones de Bloques Reiniciados</h3>
            <div className="metric-value">{metrics.totalResetOperations}</div>
            <div className="metric-subtitle">Operaciones enviadas</div>
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
            <h3>Viewers de Bloques Reiniciados</h3>
            <div className="metric-value">{metrics.totalResetViewers.toLocaleString()}</div>
            <div className="metric-subtitle">Viewers enviados</div>
          </div>
        </div>
      </div>

      {/* Historial de Resets */}
      {getResetHistory().length > 0 && (
        <div className="reset-history-section">
          <h3>🔄 Historial de Resets Detallado</h3>
          <div className="reset-cards">
            {getResetHistory().slice(-10).reverse().map((reset: any, index: number) => (
              <div key={index} className="reset-card">
                <div className="reset-header">
                  <div className="reset-title">
                    <span className="reset-icon">🔄</span>
                    <strong>{reset.blockTitle || `Bloque ${reset.blockId}`}</strong>
                  </div>
                  <div className="reset-date">
                    {new Date(reset.resetAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
                <div className="reset-details">
                  <div className="reset-stat">
                    <span className="stat-label">📊 Operaciones enviadas:</span>
                    <span className="stat-value">{reset.operationsLost || 0}</span>
                  </div>
                  <div className="reset-stat">
                    <span className="stat-label">👥 Viewers enviados:</span>
                    <span className="stat-value">{(reset.viewersLost || 0).toLocaleString()}</span>
                  </div>
                  {reset.operationsLost > 0 && reset.viewersLost > 0 && (
                    <div className="reset-stat">
                      <span className="stat-label">⚡ Promedio por operación:</span>
                      <span className="stat-value">{Math.round(reset.viewersLost / reset.operationsLost)} viewers</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {getResetHistory().length > 10 && (
            <div className="reset-summary">
              <p>Mostrando los últimos 10 resets. Total de resets: <strong>{getResetHistory().length}</strong></p>
            </div>
          )}
        </div>
      )}

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
          <div className="service-duration-table">
            <div className="service-duration-header">
              <div className="duration-cell">Duración</div>
              <div className="viewers-cell">Viewers</div>
              <div className="cost-cell">Costo Total</div>
              <div className="percentage-cell">Porcentaje</div>
            </div>
            {Object.entries(metrics.viewersByServiceDuration)
              .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
              .map(([duration, viewers]) => {
                const cost = metrics.costByServiceDuration[duration] || 0;
                const percentage = metrics.totalViewers > 0 ? ((viewers / metrics.totalViewers) * 100) : 0;
                return (
                  <div key={duration} className="service-duration-row">
                    <div className="duration-cell">
                      <span className="duration-badge">{duration}</span>
                    </div>
                    <div className="viewers-cell">
                      <span className="viewers-count">{viewers.toLocaleString()}</span>
                    </div>
                    <div className="cost-cell">
                      <span className="cost-amount">${cost.toFixed(2)}</span>
                    </div>
                    <div className="percentage-cell">
                      <span className="percentage-value">{percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Nueva sección: Monitoreo de YouTube */}
      {Object.keys(metrics.youtubeStreams).length > 0 && (
        <div className="youtube-section">
          <h2>📺 Streams de YouTube Monitoreados</h2>
          <div className="youtube-streams-grid">
            {Object.entries(metrics.youtubeStreams).map(([url, streamData]) => (
              <div key={url} className="youtube-stream-card">
                <div className="stream-header">
                  <h4>📝 {streamData.title}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className={`live-indicator ${streamData.isLive ? 'live' : 'offline'}`}>
                      {streamData.isLive ? '🔴 En Vivo' : '⏹️ Offline'}
                    </div>
                    <button 
                      className="remove-stream-button"
                      onClick={() => removeYouTubeStream(url)}
                      title="Eliminar stream del monitoreo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="stream-metrics">
                  <div className="metric">
                    <span className="metric-label">Viewers Actuales:</span>
                    <span className="metric-value">{streamData.currentViewers.toLocaleString()}</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Tendencia:</span>
                    <span className={`metric-value trend-${streamData.trend}`}>
                      {streamData.trend === 'up' ? '📈' : streamData.trend === 'down' ? '📉' : '➡️'}
                      {streamData.growthPercent.toFixed(1)}%
                    </span>
                  </div>
                  
                  {streamData.predictedFinal > 0 && streamData.isLive && (
                    <div className="metric">
                      <span className="metric-label">Predicción Final:</span>
                      <span className="metric-value">{streamData.predictedFinal.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="stream-footer">
                  <small>Última actualización: {new Date(streamData.lastUpdated).toLocaleTimeString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nueva sección: Operaciones Recientes con Horarios */}
      <div className="recent-operations-section">
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>📋 Todas las Operaciones (con Horarios)</h3>
            <button 
              onClick={downloadOperationsTableCSV}
              className="export-button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                background: 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Descargar tabla de operaciones como CSV"
            >
              📥 Descargar CSV
            </button>
          </div>
          <div className="operations-table-container" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
            <table className="operations-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                <tr>
                  <th>Bloque</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Finalización Est.</th>
                  <th>Duración</th>
                  <th>Viewers</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {getAllOperationsData()
                  .map((op, index) => {
                    // Debug: Log para ver qué operaciones tenemos
                    if (index === 0) {
                      console.log('📋 Total operaciones encontradas:', getAllOperationsData().length);
                      console.log('📝 Muestra de operación:', op);
                    }

                    // Calcular hora de finalización basándose en el savedAt/startTime y la duración
                    let estimatedEndTime = 'N/A';
                    // El timestamp ya es la hora de inicio en formato HH:MM:SS
                    const startTimeDisplay = op.timestamp;
                    
                    if (op.duration && (op.savedAt || op.startTime)) {
                      try {
                        // Usar savedAt o startTime como base (tienen fecha completa)
                        const baseTime = op.savedAt || op.startTime;
                        const startDate = new Date(baseTime);
                        
                        // Verificar que la fecha es válida y calcular finalización
                        if (!isNaN(startDate.getTime())) {
                          const endTime = new Date(startDate.getTime() + (op.duration * 60 * 1000));
                          if (!isNaN(endTime.getTime())) {
                            // Formatear solo la hora para coincidir con el formato del timestamp
                            const hours = endTime.getHours().toString().padStart(2, '0');
                            const minutes = endTime.getMinutes().toString().padStart(2, '0');
                            const seconds = endTime.getSeconds().toString().padStart(2, '0');
                            estimatedEndTime = `${hours}:${minutes}:${seconds}`;
                          }
                        }
                      } catch (error) {
                        console.warn('Error calculando tiempo de finalización:', error, 'Operación:', op);
                      }
                    }

                    return (
                  <tr key={`${op.blockId}-${op.timestamp}-${index}`} 
                      style={{ 
                        backgroundColor: op.isHistorical 
                          ? (theme === 'dark' ? '#451a03' : '#fef3c7')
                          : 'transparent'
                      }}>
                    <td>Bloque {parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}</td>
                    <td>
                      <span style={{ 
                        color: op.status === 'success' ? '#10b981' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {op.status === 'success' ? '✅' : '❌'} {op.status}
                      </span>
                    </td>
                    <td>{startTimeDisplay || 'N/A'}</td>
                    <td>{estimatedEndTime}</td>
                    <td>{op.duration || 0} min</td>
                    <td>{(op.count || 0).toLocaleString()}</td>
                    <td>${(op.cost || 0).toFixed(2)}</td>
                  </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Nueva sección: Historial de Monitoreo de YouTube */}
      <div className="recent-operations-section">
        <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>📺 Historial de Monitoreo de YouTube</h3>
            <button 
              onClick={downloadYouTubeHistoryXLSX}
              className="export-button"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                borderRadius: '0.375rem',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              title="Descargar historial de YouTube como Excel"
            >
              � Descargar Excel
            </button>
          </div>
          <div className="operations-table-container" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '400px' }}>
            {(() => {
              const youtubeHistory = getYouTubeMonitoringHistory();
              return youtubeHistory.length > 0 ? (
                <table className="operations-table" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb' }}>
                    <tr>
                      <th>Hora</th>
                      <th>Título</th>
                      <th>Viewers</th>
                      <th>Estado</th>
                      <th>Tendencia</th>
                      <th>Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {youtubeHistory.slice(0, 50).map((entry, index) => (
                      <tr key={`youtube-${index}-${entry.timestamp}`}>
                        <td>{new Date(entry.timestamp || entry.lastUpdate || 0).toLocaleTimeString()}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.title || 'Stream de YouTube'}
                        </td>
                        <td>{(entry.viewers || entry.currentViewers || 0).toLocaleString()}</td>
                        <td>
                          <span style={{ 
                            color: entry.isLive ? '#10b981' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {entry.isLive ? '🔴 En Vivo' : '⏹️ Offline'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            color: entry.trend === 'up' ? '#10b981' : entry.trend === 'down' ? '#ef4444' : '#6b7280'
                          }}>
                            {entry.trend === 'up' ? '📈 Subiendo' : entry.trend === 'down' ? '📉 Bajando' : '➡️ Estable'}
                          </span>
                        </td>
                        <td>
                          <span style={{
                            color: (entry.change || 0) > 0 ? '#10b981' : 
                                  (entry.change || 0) < 0 ? '#ef4444' : '#6b7280'
                          }}>
                            {(() => {
                              const changeValue = entry.change || 0;
                              if (changeValue === 0) return '0';
                              return changeValue > 0 ? `+${changeValue.toLocaleString()}` : changeValue.toLocaleString();
                            })()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
                }}>
                  <p>📺 No hay historial de monitoreo de YouTube disponible</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Los datos aparecerán aquí cuando empieces a monitorear streams de YouTube
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Modal de Operaciones Expiradas */}
      {showExpiredModal && (
        <div className="modal-overlay" onClick={() => setShowExpiredModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⏰ Operaciones Expiradas Detalladas</h3>
              <div className="modal-header-actions">
                <button 
                  onClick={downloadExpiredOperationsCSV}
                  className="export-button"
                  style={{ marginRight: '1rem' }}
                  title="Descargar operaciones expiradas como CSV"
                >
                  📥 Descargar CSV
                </button>
                <button 
                  onClick={() => setShowExpiredModal(false)}
                  className="close-button"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {(() => {
                const expiredOps = getExpiredOperationsDetails();
                return expiredOps.length > 0 ? (
                  <>
                    <div className="expired-summary" style={{ 
                      marginBottom: '1rem', 
                      padding: '1rem', 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#f9fafb',
                      borderRadius: '0.5rem'
                    }}>
                      <h4>📊 Resumen</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                        <div>
                          <strong>Total Operaciones:</strong> {expiredOps.length}
                        </div>
                        <div>
                          <strong>Total Viewers:</strong> {expiredOps.reduce((sum, op) => sum + (op.count || 0), 0).toLocaleString()}
                        </div>
                        <div>
                          <strong>Costo Total:</strong> ${expiredOps.reduce((sum, op) => sum + (op.cost || 0), 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <table className="expired-operations-table" style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '0.875rem'
                    }}>
                      <thead style={{ 
                        position: 'sticky', 
                        top: 0, 
                        backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
                        zIndex: 1
                      }}>
                        <tr>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Fecha</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Bloque</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Inicio</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Finalización</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Duración</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Viewers</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Costo</th>
                          <th style={{ padding: '0.75rem', border: '1px solid #d1d5db', textAlign: 'left' }}>Expiró hace</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiredOps.map((op, index) => (
                          <tr key={`expired-${index}`} style={{
                            backgroundColor: index % 2 === 0 
                              ? (theme === 'dark' ? '#1f2937' : '#ffffff')
                              : (theme === 'dark' ? '#111827' : '#f9fafb')
                          }}>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              {op.dateFormatted}
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              Bloque {parseInt((op.blockId || 'block-0').replace('block-', '')) + 1}
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              {op.startTimeFormatted}
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              {op.endTimeFormatted}
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              {op.duration} min
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db', fontWeight: 'bold' }}>
                              {(op.count || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem', border: '1px solid #d1d5db' }}>
                              ${(op.cost || 0).toFixed(2)}
                            </td>
                            <td style={{ 
                              padding: '0.75rem', 
                              border: '1px solid #d1d5db',
                              color: '#ef4444',
                              fontWeight: 'bold'
                            }}>
                              {op.minutesExpired} min
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '3rem', 
                    color: theme === 'dark' ? '#9ca3af' : '#6b7280' 
                  }}>
                    <h4>🎉 ¡No hay operaciones expiradas!</h4>
                    <p>Todas las operaciones están activas o aún no han completado su duración.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;