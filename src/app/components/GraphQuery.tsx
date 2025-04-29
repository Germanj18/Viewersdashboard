import React from 'react';

interface UploadedData {
  channel_name: string;
  created_date: string;
  youtube: number;
  likes: number;
  title: string;
}

interface GraphQueryProps {
  data: UploadedData[];
}

const GraphQuery: React.FC<GraphQueryProps> = ({ data }) => {
  return (
    <div>
      <h2>Gráfico de Datos</h2>
      {/* Ejemplo de renderizado de datos */}
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item.title} - {item.youtube} views</li>
        ))}
      </ul>
    </div>
  );
};

export default GraphQuery;