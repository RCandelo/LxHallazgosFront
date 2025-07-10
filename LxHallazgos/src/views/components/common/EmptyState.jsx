import React from 'react';

const EmptyState = ({ 
  title = "No hay datos", 
  description = "No se encontraron registros", 
  icon: Icon,
  action 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="text-center">
        {Icon && <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};
export default EmptyState;