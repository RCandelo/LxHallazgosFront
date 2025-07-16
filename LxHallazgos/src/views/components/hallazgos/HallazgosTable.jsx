import React, { useState, useMemo } from 'react';
import { canEditHallazgo, canViewAllHallazgos, canReopenHallazgo } from '../../../utils/permissions';
import { Edit3, X, RotateCcw, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const HallazgosTable = ({ 
  hallazgos, 
  users, 
  currentUser, 
  filters, 
  permissions,
  onEdit, 
  onClose,
  onReopen,
  onDelete,
  onViewDetail,
  showNotification,
  canEditHallazgo: checkCanEdit,
  canCloseHallazgo: checkCanClose,
  canReopenHallazgo: checkCanReopen,
  canDeleteHallazgo: checkCanDelete
}) => {
  
  // ✅ ESTADO DE PAGINACIÓN
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Fijo en 50 elementos

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch (error) {
      return '-';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  
  // ✅ SOLO aplicar filtros de permisos de usuario (esto no se hace en backend)
  const filteredHallazgos = hallazgos.filter(h => {
    // ✅ Solo filtro por permisos de visualización
    if (permissions.canViewAll) {
      return true; // Admin y editores ven todos los hallazgos ya filtrados por el backend
    }
    
    // Usuario normal solo ve sus propios hallazgos
    return h.usuario_id === currentUser?.id || h.evaluador === currentUser?.nombre;
  });

  // ✅ CÁLCULOS DE PAGINACIÓN
  const totalItems = filteredHallazgos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentHallazgos = filteredHallazgos.slice(startIndex, endIndex);

  // ✅ FUNCIONES DE NAVEGACIÓN
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // ✅ RESETEAR PÁGINA CUANDO CAMBIAN LOS FILTROS
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, hallazgos.length]);

  // ✅ GENERAR NÚMEROS DE PÁGINA PARA MOSTRAR
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 4) {
        // Cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Cerca del final
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // En el medio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  // ✅ DEBUG - Mostrar información de filtrado y paginación
  console.log('📊 HallazgosTable DEBUG:', {
    totalRecibidos: hallazgos.length,
    despuesDePermisos: filteredHallazgos.length,
    paginaActual: currentPage,
    totalPaginas: totalPages,
    mostrandoDesde: startIndex + 1,
    mostrandoHasta: Math.min(endIndex, totalItems),
    filtrosActivos: filters,
    permisos: permissions,
    usuario: currentUser?.nombre
  });

  if (filteredHallazgos.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-gray-500 mb-4">
            {hallazgos.length === 0 
              ? 'No hay hallazgos que coincidan con los filtros aplicados'
              : 'No tienes permisos para ver estos hallazgos'
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ✅ Información de estado de filtros y paginación */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800">
            Hallazgos ({filteredHallazgos.length} 
            {hallazgos.length !== filteredHallazgos.length && ` de ${hallazgos.length}`})
          </h3>
          
          {/* ✅ Indicadores de filtros activos */}
          <div className="flex space-x-2 text-sm">
            {filters.search && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Búsqueda: "{filters.search}"
              </span>
            )}
            {filters.evaluador && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Evaluador: {filters.evaluador}
              </span>
            )}
            {filters.dateRange && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {filters.dateRange.type === 'range' 
                  ? `${filters.dateRange.startDate} - ${filters.dateRange.endDate}`
                  : `${filters.dateRange.month}/${filters.dateRange.year}`
                }
              </span>
            )}
          </div>
        </div>

        {/* ✅ Información de paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
            <span>
              Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} resultados
            </span>
            <span>
              Página {currentPage} de {totalPages}
            </span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700">Fecha</th>
              <th className="text-left p-4 font-semibold text-gray-700">Proyecto</th>
              <th className="text-left p-4 font-semibold text-gray-700">Evaluador</th>
              <th className="text-left p-4 font-semibold text-gray-700">Zona</th>
              <th className="text-left p-4 font-semibold text-gray-700">Departamento</th>
              <th className="text-left p-4 font-semibold text-gray-700">Actividad</th>
              <th className="text-left p-4 font-semibold text-gray-700">Estado</th>
              <th className="text-left p-4 font-semibold text-gray-700">Información de Cierre</th>
              <th className="text-left p-4 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentHallazgos.map((h) => {
              const evaluadorUser = users.find(u => u.nombre === h.evaluador);
              const puedeEditarEste = checkCanEdit ? checkCanEdit(h) : canEditHallazgo(currentUser, h);
              const puedeReabrirEste = checkCanReopen ? checkCanReopen(h) : canReopenHallazgo(currentUser, h);
              
              return (
                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {formatDate(h.dwh_create)}
                  </td>
                  <td className="p-4 text-sm text-gray-700 max-w-xs">
                    <div title={h.proyecto}>
                      {truncateText(h.proyecto, 30)}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-700">{h.evaluador}</td>
                  <td className="p-4 text-sm text-gray-700">{h.zona}</td>
                  <td className="p-4 text-sm text-gray-700">{h.departamento}</td>
                  <td className="p-4 text-sm text-gray-700 max-w-xs">
                    <div title={h.actividad}>
                      {truncateText(h.actividad, 25)}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      h.estado === 'cerrado' 
                        ? 'bg-green-100 text-green-800' 
                        : h.estado === 'en_proceso'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {h.estado === 'cerrado' ? 'Cerrado' : 
                       h.estado === 'en_proceso' ? 'En Proceso' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-700">
                    {h.estado === 'cerrado' ? (
                      <div className="max-w-xs">
                        {h.nota_cierre && (
                          <p className="truncate italic text-gray-600 mb-1" title={h.nota_cierre}>
                            "{truncateText(h.nota_cierre, 40)}"
                          </p>
                        )}
                        <div className="text-xs text-gray-500">
                          <p>Cerrado: {formatDate(h.fecha_cierre)}</p>
                          {h.quien_cerro && <p>Por: {h.quien_cerro}</p>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDetail(h)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                        title="Ver detalle completo"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                      {puedeEditarEste && (
                        <button
                          onClick={() => onEdit(h)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          title="Editar hallazgo"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>
                      )}
                      {h.estado !== "cerrado" && onClose && (
                        <button
                          onClick={() => onClose(h)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          title="Cerrar hallazgo"
                        >
                          <X className="w-3 h-3" />
                          <span>Cerrar</span>
                        </button>
                      )}
                      {h.estado === "cerrado" && puedeReabrirEste && onReopen && (
                        <button
                          onClick={() => onReopen(h)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          title="Reabrir hallazgo"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reabrir</span>
                        </button>
                      )}
                      {permissions.isAdmin && onDelete && (
                        <button
                          onClick={() => onDelete(h)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg text-sm transition-colors flex items-center space-x-1"
                          title="Eliminar hallazgo"
                        >
                          <X className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ CONTROLES DE PAGINACIÓN */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Información de página */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>
                Página {currentPage} de {totalPages} 
                ({totalItems} elementos total)
              </span>
            </div>

            {/* Controles de navegación */}
            <div className="flex items-center space-x-1">
              {/* Ir al inicio */}
              <button
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors`}
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Página anterior */}
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors`}
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Números de página */}
              <div className="flex items-center space-x-1 mx-2">
                {getPageNumbers.map((page, index) => (
                  <React.Fragment key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          page === currentPage
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                        }`}
                      >
                        {page}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Página siguiente */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors`}
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Ir al final */}
              <button
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                } transition-colors`}
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HallazgosTable;