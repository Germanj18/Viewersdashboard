// components/SkeletonGraph.tsx
import React from 'react';

const SkeletonGraph = () => {
  return (
    <div className="animate-pulse">
      <div className="h-6 bg-gray-300 rounded mb-4"></div>
      <div className="h-64 bg-gray-300 rounded"></div>
    </div>
  );
};

export default SkeletonGraph;