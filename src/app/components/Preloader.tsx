// components/Preloader.tsx
import React from 'react';
import Image from 'next/image';
import './Preloader.css'; // Importar el archivo CSS para las animaciones

const Preloader = () => (
  <div className="preloader-container">
    <div className="preloader-logo">
      <Image src="/servicedg-logo-professional.svg" alt="ServiceDG" width={120} height={120} className="preloader-image" />
    </div>
    <div className="preloader-text">
      ServiceDG Analytics
    </div>
    <div className="preloader-progress"></div>
  </div>
);

export default Preloader;