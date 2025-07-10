import React, { useState, useEffect } from 'react';
import { Edit3, Save, X } from 'lucide-react';

const EditHallazgoModal = ({ 
  isOpen, 
  onClose, 
  hallazgo, 
  onHallazgoChange,
  onSubmit,
  users = [],
  currentUser
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Inicializar formData cuando cambia el hallazgo
  useEffect(() => {
    if (hallazgo) {
      const initialData = { ...hallazgo };
      setFormData(initialData);
      console.log('📝 EditModal - Inicializando con:', initialData);
    }
  }, [hallazgo]);

  // ✅ Comunicar cambios al componente padre
  useEffect(() => {
    if (onHallazgoChange && Object.keys(formData).length > 0) {
      onHallazgoChange(formData);
    }
  }, [formData, onHallazgoChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log('💾 Guardando cambios:', formData);
      
      await onSubmit();
      
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`🔄 Cambiando ${field}:`, value);
    setFormData(prev => ({ 
      ...prev, 
      [field]: value 
    }));
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !hallazgo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Edit3 className="w-6 h-6" />
              <h2 className="text-xl font-semibold">Editar Hallazgo</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info del hallazgo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="ml-2 text-gray-900">{hallazgo.id}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Estado:</span>
                  <span className={`ml-2 ${
                    hallazgo.estado === 'cerrado' ? 'text-green-600' : 
                    hallazgo.estado === 'en_proceso' ? 'text-blue-600' : 'text-yellow-600'
                  }`}>
                    {hallazgo.estado === 'cerrado' ? 'Cerrado' : 
                     hallazgo.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Creado:</span>
                  <span className="ml-2 text-gray-900">
                    {hallazgo.dwh_create ? new Date(hallazgo.dwh_create).toLocaleDateString('es-ES') : '-'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Asignado a:</span>
                  <span className="ml-2 text-gray-900">
                    {hallazgo.usuario?.nombre ? 
                      `${hallazgo.usuario.nombre} ${hallazgo.usuario.apellido || ''}`.trim() : 
                      'Sin asignar'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Campos del formulario */}
            <div className="space-y-6">
              {/* Sección: Información Básica */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                  Información Básica
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Proyecto */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proyecto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.proyecto || ''}
                      onChange={(e) => handleInputChange('proyecto', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del proyecto"
                    />
                  </div>

                  {/* Evaluador */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Evaluador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.evaluador || ''}
                      onChange={(e) => handleInputChange('evaluador', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del evaluador"
                    />
                  </div>

                  {/* Asignado a (Usuario del sistema) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asignado a (Usuario)
                    </label>
                    <select
                      value={formData.asignado_a || ''}
                      onChange={(e) => handleInputChange('asignado_a', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Sin asignar</option>
                      {users.map(user => (
                        <option key={user.id} value={user.correo}>
                          {user.nombre} {user.apellido} ({user.correo})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      El usuario asignado será responsable de este hallazgo
                    </p>
                  </div>

                  {/* Zona */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zona
                    </label>
                    <input
                      type="text"
                      value={formData.zona || ''}
                      onChange={(e) => handleInputChange('zona', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Zona de trabajo"
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={formData.departamento || ''}
                      onChange={(e) => handleInputChange('departamento', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Departamento"
                    />
                  </div>

                  {/* Fecha de inspección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inspección <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dwh_create ? formData.dwh_create.split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dwh_create', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Estado - Solo para admins */}
                  {currentUser?.rol === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={formData.estado || 'pendiente'}
                        onChange={(e) => handleInputChange('estado', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_proceso">En Proceso</option>
                        <option value="cerrado">Cerrado</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección: Detalles del Trabajo */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                  Detalles del Trabajo
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Actividad a realizar */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actividad a Realizar
                    </label>
                    <input
                      type="text"
                      value={formData.actividad_realizar || ''}
                      onChange={(e) => handleInputChange('actividad_realizar', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Descripción de la actividad"
                    />
                  </div>

                  {/* JT */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      JT
                    </label>
                    <input
                      type="text"
                      value={formData.jt || ''}
                      onChange={(e) => handleInputChange('jt', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="JT"
                    />
                  </div>

                  {/* Actividad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actividad
                    </label>
                    <input
                      type="text"
                      value={formData.actividad || ''}
                      onChange={(e) => handleInputChange('actividad', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Actividad realizada"
                    />
                  </div>

                  {/* Resultado */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resultado
                    </label>
                    <textarea
                      value={formData.resultado || ''}
                      onChange={(e) => handleInputChange('resultado', e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Resultado obtenido"
                    />
                  </div>

                  {/* Bloque */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bloque
                    </label>
                    <input
                      type="text"
                      value={formData.bloque || ''}
                      onChange={(e) => handleInputChange('bloque', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Bloque"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Información Personal */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">
                  Información Personal (Opcional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Esta información corresponde a la persona relacionada con el hallazgo
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={formData.nombre || ''}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Apellido"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={formData.correo || ''}
                      onChange={(e) => handleInputChange('correo', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cédula
                    </label>
                    <input
                      type="text"
                      value={formData.cedula || ''}
                      onChange={(e) => handleInputChange('cedula', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Número de cédula"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observaciones || ''}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion || ''}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción detallada..."
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditHallazgoModal;