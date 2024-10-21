import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext'; // Importar el contexto de tema

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

interface User {
  name?: string | null | undefined;
  email?: string | null | undefined;
  image?: string | null | undefined;
  rol?: string | null | undefined;
}

export default function AuthenticatedFileUpload({ onFileUpload }: AuthenticatedFileUploadProps) {
  const { data: session } = useSession();
  const { theme } = useTheme(); // Obtener el tema actual
  const [fileData, setFileData] = useState<UploadedDataProgram[]>([]);
  const [fileLoaded, setFileLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sheetExists, setSheetExists] = useState<boolean>(true); // Estado para controlar si la hoja existe
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null); // Estado para almacenar el workbook

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
      setWorkbook(workbook); // Almacenar el workbook en el estado
      processFile(workbook, selectedDate);
    };
    reader.readAsArrayBuffer(file);
  };

  const processFile = (workbook: XLSX.WorkBook, date: string) => {
    const sheetName = date.split('-')[2].padStart(2, '0'); // Selecciona la hoja basada en el día del calendario
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      alert(`La hoja con el nombre "${sheetName}" no existe.`);
      setSheetExists(false);
      return;
    }

    setSheetExists(true); // La hoja existe, permitir la carga de datos

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
            fecha: date ? new Date(date).toISOString() : '', // Usar la fecha seleccionada y formatearla correctamente
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

  const handleUpload = async () => {
    await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fileData),
    });
    alert('Datos subidos exitosamente');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    if (workbook) {
      processFile(workbook, newDate); // Procesar el archivo con la nueva fecha
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label className="mb-2 text-lg font-semibold">Selecciona la fecha de los datos a cargar:</label>
      <input
        type="date"
        value={selectedDate}
        onChange={handleDateChange}
        className={`mb-4 p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
      />
      <label className="mb-2 text-lg font-semibold">Selecciona el archivo a cargar:</label>
      <input
        type="file"
        onChange={handleFileChange}
        className={`mb-4 p-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-black border-gray-300'}`}
      />
      {fileLoaded && sheetExists && (
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