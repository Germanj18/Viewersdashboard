import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../ThemeContext';
import { showToast } from './NotificationService';
import './YouTubeMonitor.css';

interface YouTubeData {
  viewers: number;
  isLive: boolean;
  title: string;
  status: 'success' | 'error';
  message?: string;
  timestamp: string;
  url: string;
  channelId?: string;
  channelName?: string;
  videoId?: string;
  redirectedUrl?: string;
}

interface MonitorHistory {
  timestamp: string;
  viewers: number;
  isLive: boolean;
  title?: string;
  url?: string;
}

const YouTubeMonitor: React.FC = () => {
  const { theme } = useTheme();
  
  const [url, setUrl] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentData, setCurrentData] = useState<YouTubeData | null>(null);
  const [history, setHistory] = useState<MonitorHistory[]>([]);
  const [refreshInterval, setRefreshInterval] = useState(60); // segundos
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitorMode, setMonitorMode] = useState<'video' | 'channel'>('video');

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

  // Función para hacer scraping
  const scrapeYouTube = useCallback(async (targetUrl: string) => {
    if (!targetUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/youtube-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: targetUrl, 
          mode: monitorMode 
        })
      });

      const data: YouTubeData = await response.json();
      
      if (data.status === 'error') {
        setError(data.message || 'Error desconocido');
        showToast(`❌ Error: ${data.message}`, 'error');
      } else {
        setCurrentData(data);
        
        // Agregar al historial
        const newEntry: MonitorHistory = {
          timestamp: data.timestamp,
          viewers: data.viewers,
          isLive: data.isLive,
          title: data.title,
          url: data.redirectedUrl || data.url
        };
        
        setHistory(prev => {
          const updated = [...prev, newEntry].slice(-50); // Mantener últimos 50 registros
          
          // Calcular tendencia y predicción para el dashboard
          let trend: 'up' | 'down' | 'stable' = 'stable';
          let growthPercent = 0;
          let predictedFinal = 0;
          
          if (updated.length >= 2) {
            const recent = updated.slice(-5); // Últimos 5 registros
            const first = recent[0];
            const last = recent[recent.length - 1];
            
            const growth = last.viewers - first.viewers;
            growthPercent = first.viewers > 0 ? (growth / first.viewers) * 100 : 0;
            trend = growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable';
            
            // Calcular predicción
            if (updated.length >= 3 && data.isLive) {
              const recent10 = updated.slice(-10);
              let totalGrowth = 0;
              
              for (let i = 1; i < recent10.length; i++) {
                totalGrowth += recent10[i].viewers - recent10[i-1].viewers;
              }
              
              const avgGrowthPerInterval = totalGrowth / (recent10.length - 1);
              const hoursLeft = 2; // Asumir 2 horas restantes
              const intervalsLeft = (hoursLeft * 3600) / refreshInterval;
              
              predictedFinal = Math.max(0, Math.round(data.viewers + (avgGrowthPerInterval * intervalsLeft)));
            }
          }
          
          // Actualizar datos en localStorage con tendencia y predicción
          try {
            const videoId = extractVideoId(targetUrl);
            if (videoId) {
              const enhancedData = {
                url: targetUrl,
                title: data.title,
                viewers: data.viewers,
                isLive: data.isLive,
                timestamp: data.timestamp,
                lastUpdated: new Date().toISOString(),
                trend,
                growthPercent,
                predictedFinal
              };
              
              // Guardar datos actuales (para el dashboard)
              localStorage.setItem(`youtubeMonitor_${videoId}`, JSON.stringify(enhancedData));
              
              // Guardar en historial acumulativo
              const historyKey = `youtubeHistory_${videoId}`;
              let historyData = [];
              
              try {
                const existingHistory = localStorage.getItem(historyKey);
                if (existingHistory) {
                  historyData = JSON.parse(existingHistory);
                  if (!Array.isArray(historyData)) {
                    historyData = [];
                  }
                }
              } catch (error) {
                console.warn('Error loading YouTube history:', error);
                historyData = [];
              }
              
              // Agregar nueva medición al historial
              const historyEntry = {
                ...enhancedData,
                change: prev.length > 0 ? data.viewers - prev[prev.length - 1].viewers : 0,
                estado: data.isLive ? 'En Vivo' : 'Offline',
                source: `YouTubeMonitor_${videoId}`
              };
              
              historyData.push(historyEntry);
              
              // Mantener solo las últimas 500 mediciones para evitar problemas de storage
              if (historyData.length > 500) {
                historyData = historyData.slice(-500);
              }
              
              localStorage.setItem(historyKey, JSON.stringify(historyData));
              
              console.log(`📊 Guardada medición en historial. Total: ${historyData.length} registros`);
            }
          } catch (error) {
            console.warn('Error updating enhanced YouTube data:', error);
          }
          
          // Detectar cambios significativos
          if (prev.length > 0) {
            const lastEntry = prev[prev.length - 1];
            const change = data.viewers - lastEntry.viewers;
            const changePercent = lastEntry.viewers > 0 ? (change / lastEntry.viewers) * 100 : 0;
            
            if (Math.abs(change) > 100 || Math.abs(changePercent) > 10) {
              const message = change > 0 
                ? `📈 +${change.toLocaleString()} viewers (+${changePercent.toFixed(1)}%)`
                : `📉 ${change.toLocaleString()} viewers (${changePercent.toFixed(1)}%)`;
              showToast(message, change > 0 ? 'success' : 'warning');
            }
          }
          
          return updated;
        });
        
        console.log('📊 YouTube data actualizada:', data);
      }
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      showToast(`❌ Error: ${errorMsg}`, 'error');
      console.error('Error en scraping:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshInterval, monitorMode]);

  // Efecto para monitoreo automático
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isMonitoring && url) {
      // Scraping inicial
      scrapeYouTube(url);
      
      // Configurar intervalo
      intervalId = setInterval(() => {
        scrapeYouTube(url);
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMonitoring, url, refreshInterval, scrapeYouTube]);

  const startMonitoring = () => {
    if (!url.trim()) {
      showToast('❌ Por favor ingresa una URL de YouTube', 'error');
      return;
    }
    
    setIsMonitoring(true);
    setHistory([]);
    setError(null);
    showToast('🔴 Monitoreo iniciado', 'success');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    showToast('⏹️ Monitoreo detenido', 'info');
  };

  const getGrowthTrend = () => {
    if (history.length < 2) return null;
    
    const recent = history.slice(-5); // Últimos 5 registros
    const first = recent[0];
    const last = recent[recent.length - 1];
    
    const growth = last.viewers - first.viewers;
    const growthPercent = first.viewers > 0 ? (growth / first.viewers) * 100 : 0;
    
    return {
      growth,
      growthPercent,
      trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
    };
  };

  const predictFinalViewers = () => {
    if (history.length < 3) return null;
    
    const recent = history.slice(-10); // Últimos 10 registros
    let totalGrowth = 0;
    
    for (let i = 1; i < recent.length; i++) {
      totalGrowth += recent[i].viewers - recent[i-1].viewers;
    }
    
    const avgGrowthPerInterval = totalGrowth / (recent.length - 1);
    const hoursLeft = currentData?.isLive ? 2 : 0; // Asumir 2 horas restantes si está live
    const intervalsLeft = (hoursLeft * 3600) / refreshInterval;
    
    const predicted = currentData ? currentData.viewers + (avgGrowthPerInterval * intervalsLeft) : 0;
    
    return Math.max(0, Math.round(predicted));
  };

  const trend = getGrowthTrend();
  const prediction = predictFinalViewers();

  return (
    <div className={`youtube-monitor ${theme}`}>
      <div className="monitor-header">
        <h3>📺 Monitor de YouTube en Tiempo Real</h3>
      </div>

      {/* Configuración */}
      <div className="monitor-config">
        <div className="url-input">
          <input
            type="url"
            placeholder={monitorMode === 'channel' ? 
              "https://www.youtube.com/@canalname" : 
              "https://www.youtube.com/watch?v=..."
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isMonitoring}
          />
        </div>
        
        <div className="config-controls">
          <div className="mode-selector">
            <label>Modo:</label>
            <select 
              value={monitorMode} 
              onChange={(e) => setMonitorMode(e.target.value as 'video' | 'channel')}
              disabled={isMonitoring}
            >
              <option value="video">Video con Auto-Redirect</option>
              <option value="channel">Canal (Auto-Detección)</option>
            </select>
          </div>
          
          <div className="interval-selector">
            <label>Intervalo:</label>
            <select 
              value={refreshInterval} 
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={isMonitoring}
            >
              <option value={30}>30 segundos</option>
              <option value={60}>1 minuto</option>
              <option value={120}>2 minutos</option>
              <option value={300}>5 minutos</option>
            </select>
          </div>
          
          <div className="monitor-buttons">
            {!isMonitoring ? (
              <button onClick={startMonitoring} className="start-button">
                🔴 Iniciar Monitor
              </button>
            ) : (
              <button onClick={stopMonitoring} className="stop-button">
                ⏹️ Detener Monitor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Información del modo actual */}
      <div className="mode-info">
        {monitorMode === 'video' ? (
          <p>📺 <strong>Modo Video:</strong> Monitorea un video específico. Si termina, busca automáticamente nuevos streams del mismo canal.</p>
        ) : (
          <p>🔍 <strong>Modo Canal:</strong> Busca automáticamente streams en vivo del canal especificado.</p>
        )}
      </div>

      {/* Estado actual */}
      {isMonitoring && (
        <div className="monitor-status">
          <div className="status-indicator">
            <div className={`status-dot ${isLoading ? 'loading' : 'active'}`}></div>
            <span>
              {isLoading ? 'Actualizando...' : `Monitoreando cada ${refreshInterval}s`}
            </span>
          </div>
          
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}
        </div>
      )}

      {/* Datos actuales */}
      {currentData && (
        <div className="current-data">
          <div className="data-grid">
            <div className="data-card viewers">
              <div className="data-icon">👥</div>
              <div className="data-content">
                <h4>Viewers Actuales</h4>
                <div className="data-value">{currentData.viewers.toLocaleString()}</div>
                <div className="data-subtitle">
                  {currentData.isLive ? '🔴 En Vivo' : '⏹️ Grabado'}
                </div>
              </div>
            </div>
            
            {trend && (
              <div className="data-card trend">
                <div className="data-icon">
                  {trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'}
                </div>
                <div className="data-content">
                  <h4>Tendencia (5 min)</h4>
                  <div className="data-value">
                    {trend.growth > 0 ? '+' : ''}{trend.growth.toLocaleString()}
                  </div>
                  <div className="data-subtitle">
                    {trend.growthPercent > 0 ? '+' : ''}{trend.growthPercent.toFixed(1)}%
                  </div>
                </div>
              </div>
            )}
            
            {prediction && currentData.isLive && (
              <div className="data-card prediction">
                <div className="data-icon">🔮</div>
                <div className="data-content">
                  <h4>Predicción Final</h4>
                  <div className="data-value">{prediction.toLocaleString()}</div>
                  <div className="data-subtitle">En 2 horas</div>
                </div>
              </div>
            )}
          </div>
          
          {currentData.title && (
            <div className="video-title">
              <strong>📝 Título:</strong> {currentData.title}
            </div>
          )}
        </div>
      )}

      {/* Historial reciente */}
      {history.length > 0 && (
        <div className="history-section">
          <h4>📊 Historial Reciente</h4>
          <div className="history-content">
            <div className="history-chart-container">
              <svg className="line-chart" viewBox="0 0 800 180" preserveAspectRatio="xMidYMid meet">
                {(() => {
                  const data = history.slice(-20);
                  if (data.length === 0) return null;
                  
                  const maxViewers = Math.max(...data.map(h => h.viewers));
                  const minViewers = Math.min(...data.map(h => h.viewers));
                  const range = maxViewers - minViewers || 1;
                  const padding = 40;
                  const width = 800 - (padding * 2);
                  const height = 180 - (padding * 2);
                  
                  // Calcular puntos de la línea
                  const points = data.map((entry, index) => {
                    const x = padding + (index * width) / Math.max(data.length - 1, 1);
                    const y = padding + height - ((entry.viewers - minViewers) / range) * height;
                    return { x, y, entry, index };
                  });
                  
                  // Crear path de la línea con curvas suaves
                  let pathData = '';
                  if (points.length > 0) {
                    pathData = `M ${points[0].x} ${points[0].y}`;
                    
                    for (let i = 1; i < points.length; i++) {
                      const prevPoint = points[i - 1];
                      const currentPoint = points[i];
                      
                      if (points.length > 2) {
                        // Crear curvas suaves usando puntos de control
                        const controlPointX = (prevPoint.x + currentPoint.x) / 2;
                        pathData += ` Q ${controlPointX} ${prevPoint.y} ${currentPoint.x} ${currentPoint.y}`;
                      } else {
                        pathData += ` L ${currentPoint.x} ${currentPoint.y}`;
                      }
                    }
                  }
                  
                  // Crear área bajo la línea
                  const areaData = points.length > 0 
                    ? `M ${padding} ${padding + height} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${padding + height} Z`
                    : '';
                  
                  return (
                    <>
                      {/* Grid lines */}
                      <defs>
                        <pattern id="grid" width="50" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 50 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1"/>
                        </pattern>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                          <stop offset="50%" stopColor="currentColor" stopOpacity="1"/>
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.8"/>
                        </linearGradient>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05"/>
                        </linearGradient>
                      </defs>
                      
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Líneas de referencia horizontales */}
                      {[0.25, 0.5, 0.75].map((ratio, index) => (
                        <line
                          key={index}
                          x1={padding}
                          y1={padding + height * ratio}
                          x2={padding + width}
                          y2={padding + height * ratio}
                          stroke="currentColor"
                          strokeWidth="1"
                          opacity="0.1"
                          strokeDasharray="5,5"
                        />
                      ))}
                      
                      {/* Área bajo la línea */}
                      {areaData && (
                        <path
                          d={areaData}
                          fill="url(#areaGradient)"
                          className="line-area"
                        />
                      )}
                      
                      {/* Línea principal */}
                      {pathData && (
                        <path
                          d={pathData}
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          className="line-path"
                        />
                      )}
                      
                      {/* Puntos en la línea */}
                      {points.map((point, index) => {
                        const isFirst = index === 0;
                        const isLast = index === points.length - 1;
                        const change = index > 0 ? point.entry.viewers - points[index - 1].entry.viewers : 0;
                        
                        return (
                          <g key={index}>
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r={isFirst || isLast ? "4" : "2.5"}
                              fill="currentColor"
                              stroke={isFirst || isLast ? "rgba(255,255,255,0.8)" : "none"}
                              strokeWidth={isFirst || isLast ? "2" : "0"}
                              className="line-point"
                              opacity={isFirst || isLast ? "1" : "0.8"}
                            />
                            <title>
                              {new Date(point.entry.timestamp).toLocaleTimeString()}: {point.entry.viewers.toLocaleString()} viewers
                              {change !== 0 && ` (${change > 0 ? '+' : ''}${change.toLocaleString()})`}
                              {point.entry.isLive ? ' • 🔴 En Vivo' : ' • ⏹️ Grabado'}
                            </title>
                          </g>
                        );
                      })}
                      
                      {/* Etiquetas del eje Y */}
                      <text x="10" y={padding - 5} fontSize="10" fill="currentColor" opacity="0.7" textAnchor="start">
                        {maxViewers.toLocaleString()}
                      </text>
                      <text x="10" y={padding + height + 12} fontSize="10" fill="currentColor" opacity="0.7" textAnchor="start">
                        {minViewers.toLocaleString()}
                      </text>
                      
                      {/* Etiquetas del eje X */}
                      {data.length > 0 && (
                        <>
                          <text x={padding} y={padding + height + 25} fontSize="9" fill="currentColor" opacity="0.7" textAnchor="start">
                            {new Date(data[0].timestamp).toLocaleTimeString()}
                          </text>
                          <text x={padding + width} y={padding + height + 25} fontSize="9" fill="currentColor" opacity="0.7" textAnchor="end">
                            {new Date(data[data.length - 1].timestamp).toLocaleTimeString()}
                          </text>
                        </>
                      )}
                      
                      {/* Indicador de tendencia */}
                      {trend && (
                        <text x={padding + width - 10} y={padding + 15} fontSize="11" fill="currentColor" opacity="0.8" textAnchor="end">
                          {trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '➡️'} {trend.growthPercent.toFixed(1)}%
                        </text>
                      )}
                    </>
                  );
                })()}
              </svg>
            </div>
            
            <div className="history-table-container">
              <div className="history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Viewers</th>
                      <th>Estado</th>
                      <th>Cambio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.slice(-8).reverse().map((entry, index) => {
                      const prevEntry = history[history.length - 2 - index];
                      const change = prevEntry ? entry.viewers - prevEntry.viewers : 0;
                      
                      return (
                        <tr key={entry.timestamp}>
                          <td>{new Date(entry.timestamp).toLocaleTimeString().slice(0,5)}</td>
                          <td>{entry.viewers.toLocaleString()}</td>
                          <td>
                            <span className={`status ${entry.isLive ? 'live' : 'offline'}`}>
                              {entry.isLive ? '🔴' : '⏹️'}
                            </span>
                          </td>
                          <td className={`change ${change > 0 ? 'positive' : change < 0 ? 'negative' : ''}`}>
                            {change !== 0 && (change > 0 ? '+' : '')}{change.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeMonitor;
