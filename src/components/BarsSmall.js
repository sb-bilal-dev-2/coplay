import React from 'react';

const BarsSmall = () => {
  return (
    <button className="BarsSmall w-8 h-8 relative cursor-pointer">
      <div className="absolute inset-0 rounded-full transform rotate-45"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full flex flex-col items-center justify-center">
          <div className="w-5 h-0.5 bg-white mb-2 rounded"></div>
          <div className="w-5 h-0.5 bg-white rounded"></div>
        </div>
      </div>
    </button>
  );
};

export default BarsSmall;
