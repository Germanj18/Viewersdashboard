import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import './SummaryTable.css'; // Importar el archivo CSS
import { useTheme } from '../ThemeContext';

interface UploadedData {
  channel_name: string;
  fecha: string;
  hora: string;
  youtube: number;
  likes: number;
  title: string; 
}

interface SummaryTableProps {

  data: UploadedData[];

  onRendered: () => void;

}


interface PeakData {
  channel_name: string;
  fecha: string;
  hora: string;
  youtube: number;
  title: string;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  const [selectedPeak, setSelectedPeak] = useState<PeakData | null>(null);
  const { theme } = useTheme();

  // Calcular el pico más alto de espectadores por canal
  const channelPeaks = data.reduce((acc, item) => {
    if (!acc[item.channel_name] || acc[item.channel_name].youtube < item.youtube) {
      acc[item.channel_name] = item;
    }
    return acc;
  }, {} as Record<string, UploadedData>);

  // Convertir el objeto en una matriz y ordenar por el pico más alto de espectadores
  const sortedChannels = Object.values(channelPeaks)
    .sort((a, b) => b.youtube - a.youtube);

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
        data: sortedChannels.map(peak => peak.youtube),
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
      <div className={`chart-container-sumary ${theme}`}style={{ marginTop: '20px' }}>
        <Bar data={dataForChart} options={options} />
      </div>

      {selectedPeak && (
        <div className="modal-summary">
          <div className="modal-content-summary">
            <span className="close" onClick={handleCloseModal}>&times;</span>
            <h2>Detalles del Pico</h2>
            <p><strong>Canal:</strong> {selectedPeak.channel_name}</p>
            <p><strong>Título:</strong> {selectedPeak.title}</p>
            <p><strong>Fecha:</strong> {formatDate(selectedPeak.fecha)}</p>
            <p><strong>Hora:</strong> {selectedPeak.hora}</p>
            <p><strong>Pico mas alto:</strong> {selectedPeak.youtube}</p>
          </div>
        </div>
      )}
    </div>
  );
}
