import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';


interface AuthenticatedFileUploadProps {
  onFileUpload: (data: UploadedDataProgram[]) => void;
}

interface UploadedDataProgram {
  programa: string;
  hora: string;
  real: number;
  chimi: number;
  total: number;
  fecha: string;
}

// Removed duplicate UploadedDataProgram interface
interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  rol?: string | null | undefined;
}


export default function AuthenticatedFileUpload({ onFileUpload }: AuthenticatedFileUploadProps) {
  const { data: session } = useSession();
  const [fileData, setFileData] = useState<UploadedDataProgram[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [step, setStep] = useState<number>(0); // Controlar el paso actual del proceso

  if (!session) {
    return <p>Por favor, inicia sesión para subir archivos.</p>;
  }

  if ((session.user as User)?.rol !== 'admin') {
    return <p>No tienes permisos para subir archivos.</p>;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = "02"; // Selecciona la hoja con el nombre "02"
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        alert(`La hoja con el nombre "${sheetName}" no existe.`);
        return;
      }

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      const jsonData: UploadedDataProgram[] = [];
      let currentProgram = '';
      let programData: UploadedDataProgram[] = [];

      rows.forEach((row, rowIndex) => {
        if (row.length === 1 && row[0]) {
          // Encontramos el nombre de un nuevo programa
          if (currentProgram && programData.length > 0) {
            // Filtrar programas que tienen todas las filas con valores en cero
            const allZero = programData.every(row => row.real === 0 && row.chimi === 0 && row.total === 0);
            if (!allZero) {
              jsonData.push(...programData);
            }
          }
          currentProgram = row[0];
          programData = [];
        } else if (row.length > 1 && currentProgram) {
          // Procesar filas de datos
          if (row[0] !== 'Hora' && row[1] !== 'Real' && row[2] !== 'Chimi' && row[3] !== 'Total') {
            const dataRow = {
              programa: currentProgram,
              hora: row[0], // Hora
              real: row[1], // Real
              chimi: row[2], // Chimi
              total: row[3], // Total
              fecha: selectedDate ? new Date(selectedDate).toISOString() : '', // Usar la fecha seleccionada y formatearla correctamente
            };
            programData.push(dataRow);
          }
        }
      });

      // Procesar el último programa
      if (currentProgram && programData.length > 0) {
        const allZero = programData.every(row => row.real === 0 && row.chimi === 0 && row.total === 0);
        if (!allZero) {
          jsonData.push(...programData);
        }
      }

      console.log('Datos procesados:', jsonData); // Agregar mensaje de registro

      setFileData(jsonData);
      setFileLoaded(true);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData),
    });
    // Opcionalmente, podrías querer limpiar el estado de fileData o proporcionar retroalimentación al usuario
    setFileLoaded(false);
    setFileData([]);
    alert('Datos subidos exitosamente');
    setStep(0); // Reiniciar el proceso
  };

  return (
    <div className="flex flex-col items-center">
      {step === 0 && (
        <button
          onClick={() => setStep(1)}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-4"
        >
          Subir Datos
        </button>
      )}

      {step === 1 && (
        <div className="flex flex-col items-center animate-fade-in">
          <label className="mb-2 text-lg font-semibold">Selecciona la fecha de los datos a cargar:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mb-4 p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={() => setStep(2)}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col items-center animate-fade-in">
          <label className="mb-2 text-lg font-semibold">Selecciona el archivo a cargar:</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-4 p-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      {fileLoaded && (
        <button
          onClick={handleUpload}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300 mt-4"
        >
          Cargar Datos
        </button>
      )}
    </div>
  );
}