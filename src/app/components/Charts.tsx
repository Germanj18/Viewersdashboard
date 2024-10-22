import { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, TooltipItem, LegendElement } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './LineChart.css'; // Importar estilos específicos para el gráfico de líneas
import { useTheme } from '../ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

interface UploadedDataChannel {
  channel_name: string;
  fecha: string;
  hora: string;
  youtube: number;
  likes: number;
  title: string; 
}

interface ChartsProps {
  data: UploadedDataChannel[];
  onRendered: () => void;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function Charts({ data }: ChartsProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [combinedData, setCombinedData] = useState<UploadedDataChannel[]>([]);
  const [showCombineOptions, setShowCombineOptions] = useState<boolean>(false);
  const [isCombined, setIsCombined] = useState<boolean>(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'channel'>('all');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelColors, setChannelColors] = useState<{ [key: string]: string }>({});
  const { theme } = useTheme(); // Obtener el tema del contexto

  useEffect(() => {
    // Generar colores para cada canal y almacenarlos en el estado
    const colors: { [key: string]: string } = {};
    data.forEach(item => {
      if (!colors[item.channel_name]) {
        colors[item.channel_name] = getRandomColor();
      }
    });
    setChannelColors(colors);
  }, [data]);

  console.log('Datos en Charts:', data); // Verificar los datos en Charts

  // Agrupar los datos por fecha
  const groupedData: { [key: string]: UploadedDataChannel[] } = data.reduce((acc, item) => {
    const date = item.fecha.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {} as { [key: string]: UploadedDataChannel[] });

  const handleDateSelection = (date: string) => {
    setSelectedDates(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  };

  const handleCombine = useCallback(() => {
    const combined = selectedDates.flatMap(date => groupedData[date]);
    setCombinedData(combined);
    setIsCombined(true);
    setShowCombineOptions(false);
  }, [selectedDates, groupedData]);

  const handleRevert = () => {
    setCombinedData([]);
    setSelectedDates([]);
    setIsCombined(false);
  };

  const handleChartClick = (date: string) => {
    setSelectedChart(date);
  };

  const handleCloseModal = () => {
    setSelectedChart(null);
  };

  const handleViewModeChange = () => {
    setViewMode(prevMode => (prevMode === 'all' ? 'channel' : 'all'));
    if (viewMode === 'all') {
      const firstChannel = data[0]?.channel_name || null;
      setSelectedChannel(firstChannel);
    } else {
      setSelectedChannel(null);
    }
  };

  const handleChannelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChannel(event.target.value);
  };

  const renderChart = (date: string, dateData: UploadedDataChannel[], isModal: boolean = false) => {
    const channels = Array.from(new Set(dateData.map(item => item.channel_name)));
    const filteredData = viewMode === 'channel' && selectedChannel
      ? dateData.filter(item => item.channel_name === selectedChannel)
      : dateData;

    const datasets = channels.map(channel => {
      const channelData = filteredData
        .filter(item => item.channel_name === channel)
        .sort((a, b) => new Date(`${a.fecha.split('T')[0]}T${a.hora}`).getTime() - new Date(`${b.fecha.split('T')[0]}T${b.hora}`).getTime()); // Ordenar los datos cronológicamente

      const viewers = channelData.map(item => ({ x: new Date(`${item.fecha.split('T')[0]}T${item.hora}`), y: item.youtube }));
      const color = channelColors[channel] || getRandomColor();

      return {
        label: channel,
        data: viewers,
        borderColor: theme === 'dark' ? color : color, // Usar color definido
        backgroundColor: 'rgba(0, 0, 0, 0)', // No usar fondo para las líneas
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.1,
      };
    });

    const chartData = {
      datasets,
    };

    // Calcular el rango inicial del eje X basado en los datos de la columna youtube
    const youtubeDates = dateData
      .filter(item => item.youtube > 0)
      .map(item => new Date(`${item.fecha.split('T')[0]}T${item.hora}`).getTime());
    const initialMinDate = Math.min(...youtubeDates);
    const initialMaxDate = Math.max(...youtubeDates);

    const options: any = {
      interaction: {
        mode: 'nearest', // Mostrar la leyenda en el punto más cercano
        axis: 'x', // Interactuar solo en el eje x
        intersect: false, // No requerir intersección exacta
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'minute',
            stepSize: 1, // Ajustamos el stepSize a 1 minuto
            displayFormats: {
              minute: 'HH:mm',
            },
            min: initialMinDate,
            max: initialMaxDate,
          },
          ticks: {
            source: 'auto',
            autoSkip: false,
            callback: function(value: number) {
              const date = new Date(value);
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            },
            color: theme === 'dark' ? '#ffffff' : '#000000', // Color de las etiquetas del eje x
            font: {
              family: 'Arial, sans-serif',
              size: 12,
            },
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? '#ffffff' : '#000000', // Color de las etiquetas del eje y
            font: {
              family: 'Arial, sans-serif',
              size: 12,
            },
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: `${capitalizeFirstLetter(new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' }))} - ${date}`, // Título del gráfico con el día de la semana y la fecha
          font: {
            size: 18,
            family: 'Arial, sans-serif',
          },
          color: theme === 'dark' ? '#ffffff' : '#000000', // Color del texto del título
        },
        legend: {
          display: viewMode !== 'channel', // Ocultar leyenda si está en modo 'channel'
          labels: {
            color: theme === 'dark' ? '#ffffff' : '#000000', // Color de las etiquetas de la leyenda
            font: {
              family: 'Arial, sans-serif',
              size: 12,
            },
          },
          onClick: (e: MouseEvent, legendItem: LegendElement<'line'> & { datasetIndex: number }, legend: any) => {
            const index = legendItem.datasetIndex;
            const ci = legend.chart;
            const meta = ci.getDatasetMeta(index);

            // Toggle the visibility
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

            // Recalculate the max viewers and the min/max dates
            const visibleData = ci.data.datasets
              .filter((dataset: any, i: number) => !ci.getDatasetMeta(i).hidden)
              .flatMap((dataset: any) => dataset.data)
              .filter((point: any) => point.y > 0); // Filtrar solo los puntos con viewers > 0
            const maxViewers = Math.max(...visibleData.map((point: any) => point.y)) + 10;
            const minDate = Math.min(...visibleData.map((point: any) => point.x));
            const maxDate = Math.max(...visibleData.map((point: any) => point.x));

            // Update the y-axis max value and x-axis min/max values
            ci.options.scales.y.suggestedMax = maxViewers;
            ci.options.scales.x.min = minDate;
            ci.options.scales.x.max = maxDate;
            ci.update();
          },
        },
        tooltip: {
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.8)', // Fondo oscuro en modo claro
          titleFont: {
            family: 'Arial, sans-serif',
            size: 14,
            color: theme === 'dark' ? '#ffffff' : '#ffffff', // Color del texto en modo claro
            borderWidth: 1,
            boxPadding: 4,
          },
          bodyFont: {
            family: 'Arial, sans-serif',
            size: 12,
            color: theme === 'dark' ? '#ffffff' : '#ffffff', // Color del texto en modo claro
          },
          callbacks: {
            title: (tooltipItems: TooltipItem<'line'>[]) => {
              const item = dateData.find(d => new Date(`${d.fecha.split('T')[0]}T${d.hora}`).getTime() === new Date(tooltipItems[0].parsed.x).getTime());
              const date = new Date(item ? `${item.fecha.split('T')[0]}T${item.hora}` : '');
              return `${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
            },
            label: (tooltipItem: TooltipItem<'line'>) => {
              const dataset = datasets[tooltipItem.datasetIndex];
              const item = dateData.find(d => d.channel_name === dataset.label && new Date(`${d.fecha.split('T')[0]}T${d.hora}`).getTime() === new Date(tooltipItem.parsed.x).getTime());
              return item ? `${dataset.label}: ${item.youtube} Viewers` : '';
            },
            labelColor: (tooltipItem: TooltipItem<'line'>) => {
              const dataset = datasets[tooltipItem.datasetIndex];
              return {
                borderColor: dataset.borderColor,
                backgroundColor: dataset.borderColor,
              };
            },
          },
        },
      },
      maintainAspectRatio: false, // Cambiado a true
    };

    return (
      <div key={date} className={`chart-container ${isModal ? 'modal-chart' : 'card-chart'} ${theme}`}>
        <Line data={chartData} options={options} />
        {!isModal && !isCombined && (
          <span onClick={() => handleChartClick(date)} className={`expand-text ${theme}`}>
            Ampliar Gráfico
          </span>
        )}
      </div>
    );
  };

  const combinedChart = combinedData.length > 0 && renderChart('Combined', combinedData);

  // Ordenar las fechas de forma ascendente
  const sortedDates = Object.keys(groupedData).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return (
    <div className={`charts-container ${theme}`}>
      <div className="view-mode-toggle">
        <button onClick={handleViewModeChange} className={`button-toggle ${theme}`}>
          {viewMode === 'all' ? 'Ver por canal' : 'Ver todos los canales'}
        </button>
        {viewMode === 'channel' && (
          <select value={selectedChannel || ''} onChange={handleChannelChange} className={`channel-select ${theme}`}>
            {Array.from(new Set(data.map(item => item.channel_name))).map(channel => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        )}
      </div>
      {!isCombined && (
        <button onClick={() => setShowCombineOptions(!showCombineOptions)} className={`button-combine-toggle ${theme}`}>
          {showCombineOptions ? 'Cancelar' : 'Combinar Gráficos'}
        </button>
      )}
      {showCombineOptions && (
        <div className={`selection-list ${showCombineOptions ? 'show' : ''} ${theme}`}>
          {sortedDates.map(date => (
            <div key={date} className="selection-list-item">
              <input
                type="checkbox"
                checked={selectedDates.includes(date)}
                onChange={() => handleDateSelection(date)}
                className="selection-list-checkbox"
              />
              <label className={`selection-list-label ${theme}`}>{date}</label>
            </div>
          ))}
          <button onClick={handleCombine} disabled={selectedDates.length < 2} className={`button-combine ${theme}`}>
            Combinar Seleccionados
          </button>
        </div>
      )}
      {isCombined && (
        <div>
          <button onClick={handleRevert} className={`button-revert ${theme}`}>Revertir Combinación</button>
          {combinedChart}
        </div>
      )}
      {!isCombined && (
        <div className="charts-grid-container">
          <div className="charts-grid">
            {sortedDates.map(date => renderChart(date, groupedData[date]))}
          </div>
        </div>
      )}
      {selectedChart && (
        <div className="modal-overlay">
          <div className={`modal-content-chart ${theme}`}>
            <button className={`close-button ${theme}`} onClick={handleCloseModal}>×</button>
            {renderChart(selectedChart, groupedData[selectedChart], true)}
          </div>
        </div>
      )}
    </div>
  );
}