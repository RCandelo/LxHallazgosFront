import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload, X, Download, AlertTriangle } from 'lucide-react';
import BaseModal from './BaseModal';
import { hallazgosService } from '../../../services/hallazgos.service';
import { showNotification, showWarning } from '../../../utils/NotificationManager';

const UploadFileModal = ({ 
  isOpen, 
  onClose, 
  onFileUpload
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // ✅ Tipos de archivo permitidos más específicos
  const ALLOWED_TYPES = {
    'text/csv': '.csv',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
  };

  // ✅ Tamaño máximo de archivo (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // ✅ Validación de tipo de archivo
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      showNotification(
        `Tipo de archivo no permitido. Solo se aceptan archivos ${Object.values(ALLOWED_TYPES).join(', ')}`,
        "error"
      );
      return;
    }

    // ✅ Validación de tamaño
    if (file.size > MAX_FILE_SIZE) {
      showNotification(
        `El archivo es muy grande. Tamaño máximo permitido: ${(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB`,
        "error"
      );
      return;
    }

    // ✅ Advertencia para archivos grandes
    if (file.size > 5 * 1024 * 1024) { // Mayor a 5MB
      showWarning(
        `Archivo grande detectado (${(file.size / (1024 * 1024)).toFixed(1)}MB). El procesamiento puede tomar más tiempo.`
      );
    }

    setSelectedFile(file);
    showNotification(`Archivo "${file.name}" seleccionado correctamente`, "success");
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showNotification("No hay archivo seleccionado", "error");
      return;
    }

    try {
      setIsUploading(true);
      console.log('📤 Iniciando carga del archivo:', selectedFile.name);
      
      // ✅ Crear evento sintético para mantener compatibilidad
      const syntheticEvent = { 
        target: { 
          files: [selectedFile] 
        } 
      };
      
      await onFileUpload(syntheticEvent);
      
      // ✅ Limpiar y cerrar solo si fue exitoso
      setSelectedFile(null);
      onClose();
      
      // ✅ La notificación de éxito la maneja el hook useHallazgos
      
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      
      // ✅ Notificación específica según el tipo de error
      if (error.message?.includes('formato')) {
        showNotification('Error en el formato del archivo. Verifique que las columnas sean correctas.', 'error');
      } else if (error.message?.includes('tamaño')) {
        showNotification('El archivo es muy grande para procesar.', 'error');
      } else {
        showNotification(
          error.message || 'Error al cargar el archivo. Inténtelo nuevamente.',
          'error'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      console.log('📥 Iniciando descarga de plantilla...');
      
      await hallazgosService.downloadTemplate();
      
      showNotification('Plantilla descargada exitosamente', 'success');
      
      console.log('✅ Plantilla descargada exitosamente');
    } catch (error) {
      console.error('❌ Error downloading template:', error);
      
      // ✅ Mensaje de error más específico
      if (error.response?.status === 404) {
        showNotification('Plantilla no encontrada en el servidor', 'error');
      } else if (error.response?.status >= 500) {
        showNotification('Error del servidor. Inténtelo más tarde.', 'error');
      } else {
        showNotification('Error al descargar la plantilla', 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // ✅ Función para limpiar archivo y notificar
  const handleRemoveFile = () => {
    setSelectedFile(null);
    showNotification('Archivo removido', 'info');
    
    // ✅ Limpiar el input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ✅ Función para formatear el tamaño del archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cargar Hallazgos"
      icon={FileSpreadsheet}
      maxWidth="max-w-lg"
    >
      <div className="p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Seleccione un archivo Excel (.xlsx, .xls) o CSV para cargar múltiples hallazgos.
          </p>
          
          {/* ✅ Información más detallada */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 mb-3">
              <strong>Formato requerido:</strong> El archivo debe contener las columnas: 
              Proyecto, Evaluador, Zona, Departamento, Actividad, Resultado, etc.
            </p>
            <div className="flex items-center space-x-2 text-xs text-blue-600 mb-3">
              <AlertTriangle className="w-3 h-3" />
              <span>Tamaño máximo: {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB</span>
            </div>
            
            <button
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>{isDownloading ? 'Descargando...' : 'Descargar Plantilla'}</span>
            </button>
          </div>
        </div>

        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          
          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
              {/* ✅ Información del tipo de archivo */}
              <p className="text-xs text-blue-600">
                {ALLOWED_TYPES[selectedFile.type] || 'Archivo válido'}
              </p>
              <button
                onClick={handleRemoveFile}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1 mx-auto"
              >
                <X className="w-4 h-4" />
                <span>Remover archivo</span>
              </button>
            </div>
          ) : (
            <>
              <label className="cursor-pointer">
                <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  Haga clic para seleccionar archivo
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                o arrastre y suelte el archivo aquí
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Formatos: .xlsx, .xls, .csv (máx. {(MAX_FILE_SIZE / (1024 * 1024)).toFixed(1)}MB)
              </p>
            </>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? 'Descargando...' : 'Descargar Plantilla'}</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isUploading}
            >
              Cancelar
            </button>
            {selectedFile && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Cargar Archivo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default UploadFileModal;