import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Plugin } from 'chart.js';
import SkeletonGraph from './SkeletonGraph'; // Importar el componente SkeletonGraph

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UploadedDataProgram {
  programa: string;
  hora: string;
  real: number;
  chimi: number;
  total: number;
  fecha: string;
}

interface AdminGraphQueryProps {
  data: UploadedDataProgram[];
  theme: string; // Recibir el tema como prop
  startDate: string; // Recibir la fecha de inicio como prop
  endDate: string; // Recibir la fecha de fin como prop
  fromProgramCards?: boolean; // Prop opcional para detectar si la consulta viene desde ProgramCards
}

// Plugin personalizado para ajustar el valor máximo en el eje Y
const maxDataValuePlugin: Plugin<'bar'> = {
  id: 'maxDataValuePlugin',
  afterDatasetsUpdate(chart) {
    const datasets = chart.data.datasets as any[];
    const maxValue = calculateMaxValue(datasets);
    if (!chart.options.scales) {
      chart.options.scales = {};
    }
    if (!chart.options.scales.y) {
      chart.options.scales.y = {};
    }
    chart.options.scales.y.max = maxValue;
  }
};

const calculateMaxValue = (datasets: any[]) => {
  let maxValue = 0;
  datasets.forEach(dataset => {
    if (dataset.hidden) return;
    dataset.data.forEach((value: number) => {
      if (value > maxValue) maxValue = value;
    });
  });
  return maxValue + 5000; // Añadir un margen
};

const AdminGraphQuery: React.FC<AdminGraphQueryProps> = ({ data, theme, startDate, endDate, fromProgramCards }) => {
  const [filteredData, setFilteredData] = useState<UploadedDataProgram[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la carga de datos
  const [start, setStart] = useState<string>(startDate); // Estado para la fecha de inicio
  const [end, setEnd] = useState<string>(endDate); // Estado para la fecha de fin

  const handleQuery = async () => {
    if (start && end) {
      setIsLoading(true); // Mostrar el esqueleto mientras se cargan los datos
      const response = await fetch(`/api/query?start=${start}&end=${end}`);
      if (response.ok) {
        const result = await response.json();
        setFilteredData(result);
      } else {
        console.error('Error al consultar los datos');
      }
      setIsLoading(false); // Ocultar el esqueleto después de cargar los datos
    }
  };

  useEffect(() => {
    if (fromProgramCards) {
      handleQuery();
    }
  }, [fromProgramCards]);

  const handleDateChange = () => {
    setFilteredData([]); // Limpiar los datos filtrados
    handleQuery(); // Realizar la consulta
  };

  const handleReset = () => {
    setFilteredData([]); // Limpiar los datos filtrados
    setStart(''); // Limpiar la fecha de inicio
    setEnd(''); // Limpiar la fecha de fin
  };

  // Agrupar los datos por programa
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.programa]) {
      acc[item.programa] = [];
    }
    acc[item.programa].push(item);
    return acc;
  }, {} as Record<string, UploadedDataProgram[]>);

  // Función para ajustar la fecha manualmente
  const adjustDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col items-center mb-4">
        <label className="mb-2 text-sm font-bold">Seleccionar rango de fechas:</label>
        <div className="flex gap-2">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={`border rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          />
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className={`border rounded-lg p-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          />
          <button onClick={handleDateChange} className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
            Consultar
          </button>
        </div>
      </div>
      <div className="mt-8 w-full flex flex-col gap-4 animate-fade-in">
        {isLoading ? (
          <SkeletonGraph /> // Mostrar el esqueleto mientras se cargan los datos
        ) : (
          Object.keys(groupedData).map(programa => {
            const programaData = groupedData[programa];
            const totalReal = programaData.reduce((sum, item) => sum + item.real, 0);
            const totalChimi = programaData.reduce((sum, item) => sum + item.chimi, 0);
            const totalViewers = totalReal + totalChimi;
            const mediaReal = Math.round(totalReal / programaData.length);
            const mediaTotal = Math.round(totalViewers / programaData.length);
            const picoReal = Math.max(...programaData.map(item => item.real));
            const picoTotal = Math.max(...programaData.map(item => item.total));

            return (
              <div key={programa} className={`shadow-md rounded-lg p-4 w-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{programa}</h2>
                  <p className="text-lg">{start} - {end}</p>
                </div>
                <div className="flex justify-center gap-2 mb-4"> {/* Reducir el espacio entre las tarjetas y centrarlas */}
                  <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} flex flex-col items-center justify-center`}>
                    <p className="font-bold">Media Real</p>
                    <p className="text-xl">{mediaReal}</p> {/* Centrar el número */}
                  </div>
                  <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} flex flex-col items-center justify-center`}>
                    <p className="font-bold">Media Total</p>
                    <p className="text-xl">{mediaTotal}</p> {/* Centrar el número */}
                  </div>
                  <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} flex flex-col items-center justify-center`}>
                    <p className="font-bold">Pico Más Alto Real</p>
                    <p className="text-xl">{picoReal}</p> {/* Centrar el número */}
                  </div>
                  <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'} flex flex-col items-center justify-center`}>
                    <p className="font-bold">Pico Más Alto Total</p>
                    <p className="text-xl">{picoTotal}</p> {/* Centrar el número */}
                  </div>
                </div>
                <div className="relative h-96 w-full">
                  <Bar 
                    data={{
                      labels: programaData.map(item => item.hora),
                      datasets: [
                        {
                          label: 'Real',
                          data: programaData.map(item => item.real),
                          backgroundColor: 'rgba(75, 192, 192, 0.2)',
                          borderColor: 'rgba(75, 192, 192, 1)',
                          borderWidth: 1,
                        },
                        {
                          label: 'Chimi',
                          data: programaData.map(item => item.chimi),
                          backgroundColor: 'rgba(255, 159, 64, 0.2)',
                          borderColor: 'rgba(255, 159, 64, 1)',
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          callbacks: {
                            title: function(context: any) {
                              return `Hora: ${context[0].label}`;
                            },
                            label: function(context: any) {
                              const item = programaData[context.dataIndex];
                              const realValue = item.real;
                              const chimiValue = item.chimi;
                              const totalViewers = item.total;
                              const realPercentage = ((realValue / totalViewers) * 100).toFixed(2) + '%';
                              const chimiPercentage = ((chimiValue / totalViewers) * 100).toFixed(2) + '%';
                              const formattedDate = adjustDate(item.fecha);
                              if (context.dataset.label === 'Real') {
                                return [
                                  `Fecha: ${formattedDate}`,
                                  `Total Viewers: ${totalViewers}`,
                                  `Real: ${realValue} (${realPercentage})`
                                ];
                              } else {
                                return [
                                  `Fecha: ${formattedDate}`,
                                  `Total Viewers: ${totalViewers}`,
                                  `Chimi: ${chimiValue} (${chimiPercentage})`
                                ];
                              }
                            },
                            labelColor: function(context: any) {
                              if (context.dataset.label === 'Real') {
                                return {
                                  borderColor: 'rgba(75, 192, 192, 1)',
                                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                };
                              } else if (context.dataset.label === 'Chimi') {
                                return {
                                  borderColor: 'rgba(255, 159, 64, 1)',
                                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                };
                              } else {
                                return {
                                  borderColor: 'rgba(255, 159, 64, 1)',
                                  backgroundColor: 'rgba(255, 159, 64, 0.2)',
                                };
                              }
                            }
                          }
                        },
                      },
                      scales: {
                        x: {
                          stacked: true,
                          ticks: {
                            font: {
                              size: 14,
                            },
                          },
                        },
                        y: {
                          stacked: true,
                          ticks: {
                            font: {
                              size: 14,
                            },
                          },
                          grid: {
                            color: 'rgba(0, 0, 0, 0.2)', // Color de las líneas de la cuadrícula
                            lineWidth: 2, // Grosor de las líneas de la cuadrícula
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      <button onClick={handleReset} className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300 mt-4">
        Consultar otra fecha
      </button>
    </div>
  );
};

export default AdminGraphQuery;