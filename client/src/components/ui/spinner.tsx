import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`inline-block animate-spin rounded-full border-2 border-solid border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="loading"
    >
      <span className="sr-only">Se încarcă...</span>
    </div>
  );
}