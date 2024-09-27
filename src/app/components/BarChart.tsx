import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import './BarChart.css'; // Importar estilos específicos para el gráfico de barras
import { useTheme } from '../ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UploadedDataChannel {
  channel_name: string;
  fecha: string;
  hora: string;
  youtube: number;
  likes: number;
  title: string; 
}

interface BarChartProps {
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

export default function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme();
  console.log('Datos en BarChart:', data); // Verificar los datos en BarChart

  // Agrupar los datos por canal y encontrar el pico más alto de likes para cada canal
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.channel_name] || acc[item.channel_name].likes < item.likes) {
      acc[item.channel_name] = item;
    }
    return acc;
  }, {} as { [key: string]: UploadedDataChannel });

  // Preparar los datos para el gráfico
  const chartData = {
    labels: Object.keys(groupedData),
    datasets: [{
      label: 'Likes',
      data: Object.values(groupedData).map(item => item.likes),
      backgroundColor: Object.keys(groupedData).map(() => getRandomColor()), // Color sólido
      borderWidth: 0, // Sin bordes
      borderRadius: 10, // Esquinas redondeadas
    }],
  };

  const options: any = {
    interaction: {
      mode: 'index', // Interactuar con todas las barras en el índice
      intersect: false, // No requerir intersección exacta
    },
    plugins: {
      title: {
        display: true,
        font: {
          size: 18,
        },
        color: '#ffffff', // Color del texto del título
      },
      legend: {
        display: false, // Ocultar la leyenda
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems: any) => {
            const index = tooltipItems[0].dataIndex;
            const item = Object.values(groupedData)[index];
            return `Canal: ${item.channel_name}`;
          },
          label: (tooltipItem: any) => {
            const index = tooltipItem.dataIndex;
            const item = Object.values(groupedData)[index];
            return `Likes: ${item.likes}, Programa: ${item.title}`;
          },
        },
      },
    },
    maintainAspectRatio: false, // Permitir que el gráfico ocupe más espacio
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
    <div className={`card-small ${theme}`}>
      <h2 style={{ color: theme === 'dark' ? '#ffffff' : '#000000', textAlign: 'center' }}>
        Pico de Likes por Canal
      </h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}
