import React, { useState } from 'react';
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

const AdminGraphQuery: React.FC<AdminGraphQueryProps> = ({ data, theme }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredData, setFilteredData] = useState<UploadedDataProgram[]>([]);
  const [step, setStep] = useState<number>(0); // Controlar el paso actual del proceso
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la carga de datos

  const handleQuery = async () => {
    setIsLoading(true); // Mostrar el esqueleto mientras se cargan los datos
    const response = await fetch(`/api/query?start=${startDate}&end=${endDate}`);
    if (response.ok) {
      const result = await response.json();
      setFilteredData(result);
      setStep(3); // Mostrar los datos después de la consulta
    } else {
      console.error('Error al consultar los datos');
    }
    setIsLoading(false); // Ocultar el esqueleto después de cargar los datos
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilteredData([]);
    setStep(0);
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
      {step === 0 && (
        <button
          onClick={() => setStep(1)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-4"
        >
          Consultar Datos
        </button>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center animate-fade-in">
          <label className="mb-2 text-lg font-semibold">Selecciona el rango de fechas:</label>
          <div className="flex space-x-4"> {/* Añadir un contenedor flex para los inputs de fecha */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`p-2 border ${theme === 'dark' ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-black bg-gray-100'} rounded-lg`}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`p-2 border ${theme === 'dark' ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-black bg-gray-100'} rounded-lg`}
            />
          </div>
          <button
            onClick={handleQuery}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-4"
          >
            Consultar
          </button>
        </div>
      )}

      {step === 3 && (
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
                    <p className="text-lg">{startDate} - {endDate}</p>
                  </div>
                  <div className="flex justify-center gap-2 mb-4"> {/* Reducir el espacio entre las tarjetas y centrarlas */}
                    <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                      <p className="font-bold">Media Real</p>
                      <p>{mediaReal}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                      <p className="font-bold">Media Total</p>
                      <p>{mediaTotal}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                      <p className="font-bold">Pico Más Alto Real</p>
                      <p>{picoReal}</p>
                    </div>
                    <div className={`p-4 rounded-lg shadow-md ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-100 text-black'}`}>
                      <p className="font-bold">Pico Más Alto Total</p>
                      <p>{picoTotal}</p>
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
          <button
            onClick={handleReset}
            className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300 mt-4"
          >
            Consultar otra fecha
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminGraphQuery;