import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext'; // Importar el contexto del tema
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/20/solid'; // Importar los íconos de verificación y carga para Heroicons v2

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

interface FileUploadProps {
  onFileUpload: (data: UploadedDataChannel[]) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado para mostrar la animación de carga
  const { theme } = useTheme(); // Obtener el tema

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    setSuccessMessage(null); // Limpiar el mensaje de éxito al cambiar el archivo
  };

  const cleanQuotes = (value: string) => {
    return value.replace(/^'|'$/g, '');
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setIsLoading(true); // Mostrar la animación de carga

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Obtener las claves de la primera fila y limpiar las comillas
      const keys = jsonData[0].map((key: string) => cleanQuotes(key));

      // Formatear los datos antes de enviarlos
      const formattedData: UploadedDataChannel[] = jsonData.slice(1).map(row => {
        const cleanedRow = row.map((value: string) => cleanQuotes(value));
        const item = Object.fromEntries(keys.map((key: string, index: number) => [key, cleanedRow[index]]));

        if (!item.date || !item.hour) {
          console.error('Datos inválidos:', item);
          return null;
        }
        const [date, time] = item.date.split(' ');
        return {
          date,
          hour: item.hour,
          luzu: Number(item.luzu),
          olga: Number(item.olga),
          gelatina: Number(item.gelatina),
          blender: Number(item.blender),
          lacasa: Number(item.lacasa),
          vorterix: Number(item.vorterix),
          bondi: Number(item.bondi),
          carajo: Number(item.carajo),
          azz: Number(item.azz),
        };
      }).filter(item => item !== null) as UploadedDataChannel[]; // Filtrar elementos nulos y asegurar el tipo

      onFileUpload(formattedData);

      // Enviar los datos a la nueva ruta de API
      const response = await fetch('/api/uploadExcel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: formattedData, confirmDelete }), // Asegúrate de enviar los datos en el formato correcto
      });

      const result = await response.json();
      setIsLoading(false); // Ocultar la animación de carga

      if (response.ok) {
        if (result.confirmDelete) {
          setWarning(result.message);
          setConfirmDelete(true);
        } else {
          console.log('Datos subidos correctamente');
          setWarning(null);
          setConfirmDelete(false);
          setSuccessMessage('Datos subidos correctamente');
        }
      } else {
        console.error('Error al subir los datos');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirm = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Obtener las claves de la primera fila y limpiar las comillas
      const keys = jsonData[0].map((key: string) => cleanQuotes(key));

      // Formatear los datos antes de enviarlos
      const formattedData: UploadedDataChannel[] = jsonData.slice(1).map(row => {
        const cleanedRow = row.map((value: string) => cleanQuotes(value));
        const item = Object.fromEntries(keys.map((key: string, index: number) => [key, cleanedRow[index]]));

        if (!item.date || !item.hour) {
          console.error('Datos inválidos:', item);
          return null;
        }
        const [date, time] = item.date.split(' ');
        return {
          date,
          hour: item.hour,
          luzu: Number(item.luzu),
          olga: Number(item.olga),
          gelatina: Number(item.gelatina),
          blender: Number(item.blender),
          lacasa: Number(item.lacasa),
          vorterix: Number(item.vorterix),
          bondi: Number(item.bondi),
          carajo: Number(item.carajo),
          azz: Number(item.azz),
        };
      }).filter(item => item !== null) as UploadedDataChannel[]; // Filtrar elementos nulos y asegurar el tipo

      onFileUpload(formattedData);

      // Enviar los datos a la nueva ruta de API con confirmación
      const response = await fetch('/api/uploadExcel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: formattedData, confirmDelete: true }), // Confirmar eliminación
      });

      if (response.ok) {
        console.log('Datos subidos correctamente');
        setWarning(null);
        setConfirmDelete(false);
        setSuccessMessage('Datos subidos correctamente');
      } else {
        console.error('Error al subir los datos');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleCancel = () => {
    setWarning(null);
    setConfirmDelete(false);
  };

  return (
    <div className={`flex flex-col items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-md w-full max-w-md`}>
      <input
        type="file"
        onChange={handleFileChange}
        className={`mb-4 p-2 border ${theme === 'dark' ? 'border-gray-600 text-white bg-gray-700' : 'border-gray-300 text-black bg-gray-100'} rounded-lg w-full`}
      />
      <button
        onClick={handleFileUpload}
        className="bg-green-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
      >
        Upload
      </button>
      {isLoading && (
        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-100'} border ${theme === 'dark' ? 'border-gray-600' : 'border-blue-400'} rounded-lg flex items-center`}>
          <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin mr-2" />
          <p className={`${theme === 'dark' ? 'text-white' : 'text-black'}`}>Validando datos...</p>
        </div>
      )}
      {warning && (
        <div className="mt-4 p-4 bg-yellow-200 text-yellow-800 rounded-lg">
          <p>{warning}</p>
          <div className="flex space-x-4">
            <button
              onClick={handleConfirm}
              className="bg-red-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition duration-300"
            >
              Confirmar
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow-md hover:bg-gray-600 transition duration-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-200 text-green-800 rounded-lg flex items-center">
          <p>{successMessage}</p>
          <CheckCircleIcon className="h-6 w-6 text-green-500 ml-2" />
        </div>
      )}
    </div>
  );
}