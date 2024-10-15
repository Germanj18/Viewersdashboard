import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, getDay } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ProgramData {
  fecha: string;
  avg_total: number;
  dayData: { hora: string; total: number }[];
}

const ProgramCards: React.FC<{ theme: string }> = ({ theme }) => {
  const [data, setData] = useState<ProgramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchData = async (start: Date, end: Date) => {
    setIsLoading(true);
    const response = await fetch(`/api/queryMaxViewers?start=${format(start, 'yyyy-MM-dd')}&end=${format(end, 'yyyy-MM-dd')}`);
    if (response.ok) {
      const result = await response.json();
      console.log('Datos recibidos:', result);
      setData(result);
    } else {
      console.error('Error al consultar los datos');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    fetchData(start, end);
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderCards = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const weekdays = [];
    let currentDate = start;

    // Generar un array de fechas de lunes a viernes
    while (currentDate <= end) {
      const day = getDay(currentDate);
      if (day >= 1 && day <= 5) { // Lunes (1) a Viernes (5)
        weekdays.push(currentDate.toISOString().split('T')[0]); // Agregar la fecha en formato 'YYYY-MM-DD'
      }
      currentDate.setDate(currentDate.getDate() + 1); // Avanzar un día
    }

    // Agrupar las tarjetas en filas de 4 columnas
    const rows = [];
    for (let i = 0; i < weekdays.length; i += 4) {
      rows.push(weekdays.slice(i, i + 4));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center w-full mb-4">
        {row.map((date) => {
          const item = data.find(d => d.fecha === date) || { avg_total: 0, dayData: [] };

          const sortedDayData = item.dayData.sort((a, b) => a.hora.localeCompare(b.hora));
          const chartData = {
            labels: sortedDayData.map(d => d.hora),
            datasets: [
              {
                label: 'Total',
                data: sortedDayData.map(d => d.total),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
              },
            ],
          };

          const chartOptions = {
            maintainAspectRatio: false,
            scales: {
              x: { display: false },
              y: { display: false },
            },
            plugins: {
              legend: { display: false },
            },
            layout: {
              padding: { left: 0, right: 0, top: 0, bottom: 0 },
            },
          };

          const formattedDate = new Date(date).toLocaleDateString();

          return (
            <div key={formattedDate} className={`shadow-md rounded-lg p-2 w-1/4 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} m-2`} style={{ minWidth: '200px', maxWidth: '200px', height: '300px', position: 'relative' }}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-bold">LaCasa</h2>
                <p className="text-xs">{formattedDate}</p>
              </div>
              <div className="flex justify-center gap-1 mb-2">
                <div className={`p-2 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                  <p className="font-bold text-xs">Media Total del Día</p>
                  <p className="text-xs">{item.avg_total.toFixed(2)}</p>
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', top: 'auto', height: '150px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePreviousMonth} className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
          Mes Anterior
        </button>
        <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={handleNextMonth} className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
          Mes Siguiente
        </button>
      </div>
      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="flex flex-col items-center w-full">
          {renderCards()}
        </div>
      )}
    </div>
  );
};

export default ProgramCards;
