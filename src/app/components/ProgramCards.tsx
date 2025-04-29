import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, eachDayOfInterval, getDay } from 'date-fns';
import { es } from 'date-fns/locale'; // Importar el locale español
import AdminGraphQuery from './AdminGraphQuery'; // Importar el componente AdminGraphQuery

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface ProgramData {
  fecha: string;
  avg_total: number;
  dayData: { hora: string; total: number }[];
}

interface ProgramCardsProps {
  theme: string;
  onDateSelect: (date: string | null) => void; // Prop para manejar la selección de fecha desde AdminDashboard
  selectedDate: string | null; // Prop para recibir la fecha seleccionada desde AdminDashboard
}

const ProgramCards: React.FC<ProgramCardsProps> = ({ theme, onDateSelect, selectedDate }) => {
  const [data, setData] = useState<ProgramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  interface UploadedDataProgram {
    hora: string;
    total: number;
    programa: string;
    real: number;
    chimi: number;
    fecha: string;
  }

  const [graphData, setGraphData] = useState<UploadedDataProgram[]>([]); // Estado para los datos del gráfico

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

  const handleCardClick = async (date: string) => {
    onDateSelect(date); // Notificar a AdminDashboard sobre la selección de fecha
    setIsLoading(true);
    const response = await fetch(`/api/query?start=${date}&end=${date}`);
    if (response.ok) {
      const result = await response.json();
      setGraphData(result);
    } else {
      console.error('Error al consultar los datos');
    }
    setIsLoading(false);
  };

  // Función para obtener los días de lunes a viernes del mes actual
  const getWeekdaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    return eachDayOfInterval({ start, end }).filter(date => {
      const day = getDay(date);
      return day >= 1 && day <= 5; // Lunes a viernes
    });
  };

  // Función para capitalizar la primera letra de una cadena
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const renderCards = () => {
    // Obtener los días de lunes a viernes
    const weekdays = getWeekdaysInMonth(currentMonth);

    // Agrupar los datos por fecha
    const groupedData = weekdays.map(date => {
      const dateString = date.toISOString().split('T')[0];
      const dayData = data.find(item => item.fecha.split('T')[0] === dateString) || { avg_total: 0, dayData: [] };
      
      return {
        fecha: date,
        avg_total: dayData.avg_total,
        dayData: dayData.dayData || [],
      };
    });

    // Agrupar las tarjetas en filas de 5 columnas
    const rows = [];
    for (let i = 0; i < groupedData.length; i += 5) {
      rows.push(groupedData.slice(i, i + 5));
    }

    return rows.map((row, rowIndex) => (
      <div key={rowIndex} className="flex justify-center w-full mb-4">
        {row.map(item => {
          const date = new Date(item.fecha);
          const formattedDate = format(date, 'dd/MM/yyyy');
          const dayOfWeek = capitalizeFirstLetter(format(date, 'EEEE', { locale: es })); // Obtener el día de la semana en español y capitalizar la primera letra
          const sortedDayData = item.dayData.sort((a, b) => a.hora.localeCompare(b.hora)); // Ordenar los datos por hora
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
            plugins: { legend: { display: false } },
            layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
          };

          const dateString = date.toISOString().split('T')[0];
          return (
            <div
              key={formattedDate}
              className={`shadow-md rounded-lg p-2 w-1/5 ${theme === 'dark' ? 'bg-black text-white border border-[#444]' : 'bg-white text-black border border-[#444]'} m-2 cursor-pointer`}
              style={{ minWidth: '200px', maxWidth: '200px', height: '300px', position: 'relative' }}
              onClick={() => handleCardClick(dateString)} // Establecer la fecha seleccionada al hacer clic
            >
              <div className="flex flex-col justify-between items-center mb-2">
                <h2 className="text-sm font-bold">LaCasa</h2>
                <p className="text-xs mt-1">{`${dayOfWeek} - ${formattedDate}`}</p>
              </div>
              <div className="flex justify-center gap-1 mb-2">
                <div className={`p-2 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} flex flex-col items-center justify-center`}>
                  <p className="font-bold text-xs">Media Total del Día</p>
                  <p className="text-xs">{item.avg_total > 0 ? item.avg_total.toFixed(2) : "Sin datos"}</p> {/* Centrar el número */}
                </div>
              </div>
              <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', top: 'auto', height: '150px' }}>
                {sortedDayData.length > 0 ? (
                  <Line data={chartData} options={chartOptions} />
                ) : (
                  <p className="text-xs text-center">Sin gráfico</p> // Mensaje si no hay datos para graficar
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {selectedDate ? (
        <AdminGraphQuery data={graphData} theme={theme} startDate={selectedDate} endDate={selectedDate} fromProgramCards={true} /> // Mostrar AdminGraphQuery con la fecha seleccionada
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePreviousMonth} className={`py-1 px-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${theme === 'dark' ? 'bg-black text-white border border-[#444]' : 'bg-white text-black border border-[#444]'}`}>
              Mes Anterior
            </button>
            <h2 className="text-xl font-bold mx-4">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
            <button onClick={handleNextMonth} className={`py-1 px-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ${theme === 'dark' ? 'bg-black text-white border border-[#444]' : 'bg-white text-black border border-[#444]'}`}>
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
        </>
      )}
    </div>
  );
};

export default ProgramCards;