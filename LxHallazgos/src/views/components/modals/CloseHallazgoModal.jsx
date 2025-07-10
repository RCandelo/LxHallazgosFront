import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import BaseModal from './BaseModal';

const CloseHallazgoModal = ({ 
  isOpen, 
  onClose, 
  hallazgo,
  onConfirm 
}) => {
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // ✅ Asegurar que comentario es string
    const comentarioString = String(comentario || '').trim();
    
    console.log('CloseHallazgoModal - handleSubmit:', {
      comentario_original: comentario,
      comentario_type: typeof comentario,
      comentario_string: comentarioString,
      comentario_string_type: typeof comentarioString,
      hallazgo_id: hallazgo?.id
    });
    
    if (!comentarioString) {
      setError('El comentario es obligatorio para cerrar el hallazgo');
      return;
    }

    if (comentarioString.length < 10) {
      setError('El comentario debe tener al menos 10 caracteres');
      return;
    }

    // ✅ Enviar siempre como string
    onConfirm(hallazgo.id, comentarioString);
    setComentario('');
    setError('');
  };

  const handleClose = () => {
    setComentario('');
    setError('');
    onClose();
  };

  const handleComentarioChange = (e) => {
    // ✅ Asegurar que siempre sea string
    const value = String(e.target.value || '');
    setComentario(value);
    setError('');
  };

  if (!hallazgo) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Cerrar Hallazgo"
      icon={X}
      headerColor="from-red-600 to-red-700"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-4">
          <div className="flex items-start space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Está a punto de cerrar el siguiente hallazgo:
              </p>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                <p><strong>ID:</strong> {hallazgo.id}</p>
                <p><strong>Proyecto:</strong> {hallazgo.proyecto}</p>
                <p><strong>Evaluador:</strong> {hallazgo.evaluador}</p>
                <p><strong>Actividad:</strong> {hallazgo.actividad}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario de cierre <span className="text-red-500">*</span>
          </label>
          <textarea
            value={comentario}
            onChange={handleComentarioChange}
            placeholder="Ingrese un comentario explicando el motivo del cierre..."
            rows={4}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
              error 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-red-500'
            }`}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> Una vez cerrado, el hallazgo solo podrá ser reabierto por usted mismo.
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
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cerrar Hallazgo</span>
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default CloseHallazgoModal;