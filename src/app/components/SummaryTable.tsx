import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './SummaryTable.css'; // Importar el archivo CSS
import { useTheme } from '../ThemeContext';

interface UploadedDataChannel {
  date: string;
  hour: string;
  luzu: number;
  olga: number;
  gelatina: number;
  blender: number;
  lacasa: number;
  vorterix: number;
  bondi: number;
  carajo: number;
  azz: number;
}

interface SummaryTableProps {
  data: UploadedDataChannel[];
  onRendered: () => void;
}

interface PeakData {
  channel_name: string;
  date: string;
  hour: string;
  viewers: number;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  const [selectedPeak, setSelectedPeak] = useState<PeakData | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['luzu', 'olga', 'gelatina', 'blender', 'lacasa', 'vorterix', 'bondi', 'carajo', 'azz']);
  const { theme } = useTheme();

  const handleChannelSelection = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  // Calcular el pico más alto de espectadores por canal
  const channelPeaks = data.reduce((acc, item) => {
    const channels = ['luzu', 'olga', 'gelatina', 'blender', 'lacasa', 'vorterix', 'bondi', 'carajo', 'azz'];
    channels.forEach(channel => {
      if (!acc[channel] || acc[channel].viewers < Number(item[channel as keyof UploadedDataChannel])) {
        acc[channel] = {
          channel_name: channel,
          date: item.date,
          hour: item.hour,
          viewers: Number(item[channel as keyof UploadedDataChannel]),
        };
      }
    });
    return acc;
  }, {} as Record<string, PeakData>);

  // Filtrar los canales seleccionados
  const filteredChannels = Object.values(channelPeaks).filter(peak => selectedChannels.includes(peak.channel_name));

  // Convertir el objeto en una matriz y ordenar por el pico más alto de espectadores
  const sortedChannels = filteredChannels.sort((a, b) => b.viewers - a.viewers);

  const handleBarClick = (elements: any) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      setSelectedPeak(sortedChannels[index]);
    }
  };

  const handleCloseModal = () => {
    setSelectedPeak(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const colors = [
    'rgba(75, 192, 192, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
  ];

  const dataForChart = {
    labels: sortedChannels.map(peak => peak.channel_name),
    datasets: [
      {
        label: 'Pico de Viewers',
        data: sortedChannels.map(peak => peak.viewers),
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 0,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (event: any, elements: any) => handleBarClick(elements),
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000', // Color de los ticks
        },
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: theme === 'dark' ? '#ffffff' : '#000000', // Color de los ticks
        },
      },
    },
  };

  return (
    <div className={`card-summary ${theme}`}>
      <h3>Pico de Viewers</h3>
      <div className="channel-filters">
        {['luzu', 'olga', 'gelatina', 'blender', 'lacasa', 'vorterix', 'bondi', 'carajo', 'azz'].map(channel => (
          <div key={channel} className={`channel-filter ${theme}`}>
            <input
              type="checkbox"
              id={channel}
              checked={selectedChannels.includes(channel)}
              onChange={() => handleChannelSelection(channel)}
            />
            <label htmlFor={channel}>{channel}</label>
          </div>
        ))}
      </div>
      <div className={`chart-container-sumary ${theme}`} style={{ marginTop: '20px' }}>
        <Bar data={dataForChart} options={options} />
      </div>

      {selectedPeak && (
        <div className="modal-summary">
          <div className="modal-content-summary">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Detalles del Pico</h2>
            <p><strong>Canal:</strong> {selectedPeak.channel_name}</p>
            <p><strong>Fecha:</strong> {formatDate(selectedPeak.date)}</p>
            <p><strong>Hora:</strong> {selectedPeak.hour}</p>
            <p><strong>Pico más alto:</strong> {selectedPeak.viewers}</p>
          </div>
        </div>
      )}
    </div>
  );
}