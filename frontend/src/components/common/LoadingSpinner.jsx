// LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const spinner = (
    <div className={`${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center py-8">{spinner}</div>;
};

export default LoadingSpinner;
