import React from 'react';
import { X } from 'lucide-react';

const HallazgoDetailModal = ({ hallazgo, isOpen, onClose }) => {
  if (!isOpen || !hallazgo) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Detalle del Hallazgo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Información del Proyecto
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Proyecto</label>
                  <p className="text-gray-900">{hallazgo.proyecto || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Evaluador</label>
                  <p className="text-gray-900">{hallazgo.evaluador || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Zona</label>
                  <p className="text-gray-900">{hallazgo.zona || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Departamento</label>
                  <p className="text-gray-900">{hallazgo.departamento || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Información Personal
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Nombre</label>
                  <p className="text-gray-900">{hallazgo.nombre || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Apellido</label>
                  <p className="text-gray-900">{hallazgo.apellido || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Cédula</label>
                  <p className="text-gray-900">{hallazgo.cedula || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Correo</label>
                  <p className="text-gray-900">{hallazgo.correo || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actividades y Descripción */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Actividad a Realizar</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {hallazgo.actividad_realizar || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Actividad</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {hallazgo.actividad || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {hallazgo.descripcion || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Observaciones</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {hallazgo.observaciones || '-'}
              </p>
            </div>
          </div>

          {/* Estado y Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Estado y Fechas
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Estado</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    hallazgo.estado === 'cerrado' 
                      ? 'bg-green-100 text-green-800' 
                      : hallazgo.estado === 'en_proceso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {hallazgo.estado === 'cerrado' ? 'Cerrado' : 
                     hallazgo.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Fecha de Creación</label>
                  <p className="text-gray-900">{formatDate(hallazgo.dwh_create)}</p>
                </div>
                {hallazgo.fecha_cierre && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Fecha de Cierre</label>
                    <p className="text-gray-900">{formatDate(hallazgo.fecha_cierre)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información de Cierre */}
            {hallazgo.estado === 'cerrado' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Información de Cierre
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Nota de Cierre</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {hallazgo.nota_cierre || '-'}
                    </p>
                  </div>
                  {hallazgo.quien_cerro && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Cerrado por</label>
                      <p className="text-gray-900">{hallazgo.quien_cerro}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HallazgoDetailModal;