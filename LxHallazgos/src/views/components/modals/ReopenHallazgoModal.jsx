import React, { useState } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import BaseModal from './BaseModal';

const ReopenHallazgoModal = ({ 
  isOpen, 
  onClose, 
  hallazgo,
  onConfirm 
}) => {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ Validación del motivo
    const motivoString = String(motivo || '').trim();
    
    console.log('ReopenHallazgoModal - handleSubmit:', {
      motivo_original: motivo,
      motivo_type: typeof motivo,
      motivo_string: motivoString,
      motivo_string_type: typeof motivoString,
      hallazgo_id: hallazgo?.id
    });
    
    if (!motivoString) {
      setError('El motivo es obligatorio para reabrir el hallazgo');
      return;
    }

    if (motivoString.length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    // ✅ Enviar hallazgo.id y motivo
    onConfirm(hallazgo.id, motivoString);
    setMotivo('');
    setError('');
  };

  const handleClose = () => {
    setMotivo('');
    setError('');
    onClose();
  };

  const handleMotivoChange = (e) => {
    const value = String(e.target.value || '');
    setMotivo(value);
    setError('');
  };

  if (!hallazgo) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reabrir Hallazgo"
      icon={RotateCcw}
      headerColor="from-yellow-600 to-yellow-700"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <div className="flex items-start space-x-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Está a punto de reabrir el siguiente hallazgo:
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>ID:</strong> {hallazgo.id}</p>
                <p><strong>Proyecto:</strong> {hallazgo.proyecto}</p>
                <p><strong>Evaluador:</strong> {hallazgo.evaluador}</p>
                <p><strong>Actividad:</strong> {hallazgo.actividad}</p>
                {hallazgo.nota_cierre && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p><strong>Comentario de cierre anterior:</strong></p>
                    <p className="italic text-gray-600">"{hallazgo.nota_cierre}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de reapertura <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivo}
            onChange={handleMotivoChange}
            placeholder="Ingrese el motivo por el cual necesita reabrir este hallazgo..."
            rows={4}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-yellow-500'
            }`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> El hallazgo volverá al estado "Pendiente" y podrá ser editado nuevamente.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reabrir Hallazgo</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default ReopenHallazgoModal;