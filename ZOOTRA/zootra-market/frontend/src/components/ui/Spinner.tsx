import React from 'react';

interface SpinnerProps { size?: 'sm' | 'md' | 'lg'; className?: string; }

const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={`${sizes[size]} animate-spin rounded-full border-4 border-gray-200 border-t-green-600 ${className}`}
    role="status"
    aria-label="Loading"
  />
);

export default Spinner;
