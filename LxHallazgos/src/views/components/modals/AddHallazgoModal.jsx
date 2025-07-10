import React from 'react';
import { Plus, Save, User } from 'lucide-react';
import BaseModal from './BaseModal';

const AddHallazgoModal = ({ 
  isOpen, 
  onClose, 
  newHallazgo, 
  onHallazgoChange, 
  onSubmit,
  users = [], // ✅ Agregar users para asignaciones
  currentUser 
}) => {
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const handleInputChange = (field, value) => {
    onHallazgoChange(prev => ({ ...prev, [field]: value }));
  };

  // Campos principales del formulario
  const formFields = [
    { label: "Zona", name: "zona", type: "text", required: true },
    { label: "Departamento", name: "departamento", type: "text", required: true },
    { label: "Actividad a Realizar", name: "actividad_realizar", type: "textarea", required: true, colSpan: 2 },
    { label: "Jornada de Trabajo (JT)", name: "jt", type: "text", required: false },
    { label: "Actividad", name: "actividad", type: "text", required: true },
    { label: "Resultado", name: "resultado", type: "textarea", required: true, colSpan: 2 },
    { label: "Bloque", name: "bloque", type: "text", required: false },
  ];

  // Campos de información personal
  const personalFields = [
    { label: "Nombre", name: "nombre", type: "text", required: false },
    { label: "Apellido", name: "apellido", type: "text", required: false },
    { label: "Correo", name: "correo", type: "email", required: false },
    { label: "Cédula", name: "cedula", type: "text", required: false }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Hallazgo"
      icon={Plus}
      headerColor="from-green-600 to-green-700"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* SECCIÓN: INFORMACIÓN BÁSICA */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Información del Hallazgo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Proyecto */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newHallazgo.proyecto || ''}
                onChange={(e) => handleInputChange('proyecto', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nombre del proyecto"
              />
            </div>

            {/* Evaluador - Input libre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Evaluador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newHallazgo.evaluador || ''}
                onChange={(e) => handleInputChange('evaluador', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Nombre del evaluador"
              />
            </div>

            {/* ✅ ASIGNADO A (Usuario del sistema) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asignado a (Usuario)
              </label>
              <select
                value={newHallazgo.asignado_a || ''}
                onChange={(e) => handleInputChange('asignado_a', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Sin asignar (creador: {currentUser?.nombre})</option>
                {users.map(user => (
                  <option key={user.id} value={user.correo}>
                    {user.nombre} {user.apellido} ({user.correo})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Si no se asigna, el hallazgo será asignado a quien lo crea
              </p>
            </div>

            {/* Fecha de Inspección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inspección <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={newHallazgo.dwh_create || ''}
                onChange={(e) => handleInputChange('dwh_create', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Estado inicial - Solo para admins */}
            {currentUser?.rol === 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Inicial
                </label>
                <select
                  value={newHallazgo.estado || 'pendiente'}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN: INFORMACIÓN PERSONAL (OPCIONAL) */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Información Personal (Opcional)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Esta información corresponde a la persona relacionada con el hallazgo (puede ser diferente al usuario del sistema)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalFields.map(({ label, name, type, required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={type}
                  value={newHallazgo[name] || ''}
                  onChange={(e) => handleInputChange(name, e.target.value)}
                  placeholder={`Ingrese ${label.toLowerCase()}`}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN: DETALLES DEL HALLAZGO */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Detalles del Hallazgo
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formFields.map(({ label, name, type, required, colSpan }) => (
              <div key={name} className={colSpan === 2 ? 'md:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} {required && <span className="text-red-500">*</span>}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    required={required}
                    value={newHallazgo[name] || ''}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    rows={3}
                    placeholder={`Ingrese ${label.toLowerCase()}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                ) : (
                  <input
                    required={required}
                    type={type}
                    value={newHallazgo[name] || ''}
                    onChange={(e) => handleInputChange(name, e.target.value)}
                    placeholder={`Ingrese ${label.toLowerCase()}`}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Observaciones y Descripción */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones
              </label>
              <textarea
                value={newHallazgo.observaciones || ''}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={4}
                placeholder="Observaciones adicionales..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción Detallada
              </label>
              <textarea
                value={newHallazgo.descripcion || ''}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={4}
                placeholder="Descripción detallada del hallazgo..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Hallazgo</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddHallazgoModal;