// components/common/ErrorState.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-red-800 font-semibold mb-2">Error al cargar datos</h3>
        <p className="text-red-600">{error}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;