import React from 'react';

export const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-5 w-5 border-2',
    medium: 'h-8 w-8 border-[3px]',
    large: 'h-12 w-12 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-t-primary-600 border-r-transparent border-b-primary-600 border-l-transparent ${sizeClasses[size]}`}></div>
    </div>
  );
};
