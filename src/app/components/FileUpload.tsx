import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useTheme } from '../ThemeContext'; // Importar el contexto del tema

interface UploadedData {
  channel_name: string;
  created_date: string; // Cambiar a created_date para consistencia
  youtube: number;
  likes: number;
  title: string;
}

interface FileUploadProps {
  onFileUpload: (data: UploadedData[]) => void;
}

export default function FileUpload({ onFileUpload }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { theme } = useTheme(); // Obtener el tema

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
    setSuccessMessage(null); // Limpiar el mensaje de éxito al cambiar el archivo
  };

  const handleFileUpload = async () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: UploadedData[] = XLSX.utils.sheet_to_json(worksheet);

      // Separar la fecha y la hora antes de enviar los datos
      const formattedData = jsonData.map(item => {
        const [date, time] = item.created_date.split('T');
        const formattedTime = time.split('.')[0].substring(0, 5); // Obtener solo HH:MM
        return {
          ...item,
          fecha: date,
          hora: formattedTime,
        };
      });

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
      const jsonData: UploadedData[] = XLSX.utils.sheet_to_json(worksheet);

      // Separar la fecha y la hora antes de enviar los datos
      const formattedData = jsonData.map(item => {
        const [date, time] = item.created_date.split('T');
        const formattedTime = time.split('.')[0].substring(0, 5); // Obtener solo HH:MM
        return {
          ...item,
          fecha: date,
          hora: formattedTime,
        };
      });

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
        <div className="mt-4 p-4 bg-green-200 text-green-800 rounded-lg">
          <p>{successMessage}</p>
        </div>
      )}
    </div>
  );
}