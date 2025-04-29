// components/Preloader.tsx
import React from 'react';
import Image from 'next/image';
import './Preloader.css'; // Importar el archivo CSS para las animaciones

const Preloader = () => (
  <div className="preloader-container">
    <div className="preloader-logo">
      <Image src="/logo-expansion-verde.png" alt="Expansion" width={100} height={100} className="preloader-image" />
    </div>
  </div>
);

export default Preloader;