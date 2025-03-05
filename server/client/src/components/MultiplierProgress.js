import React from 'react';

const MultiplierProgress = ({ multiplier, streak }) => {
  const segments = 8; // Número total de segmentos
  const filledSegments = Math.min(streak, segments); // Segmentos preenchidos (máximo 8)

  return (
    <div className="multiplier-container mb-4">
      <div className={`multiplier-circle filled-${filledSegments}`}>
        <div className="multiplier-text">x{multiplier}</div>
      </div>
    </div>
  );
};

export default MultiplierProgress;
