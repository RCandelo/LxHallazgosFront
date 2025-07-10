import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Plus, Upload, Search, X, ChevronDown } from 'lucide-react';

const HallazgosFilters = ({ 
  viewMode, 
  onViewModeChange, 
  filters, 
  onFiltersChange, 
  users,
  canCreate,
  canViewAll,
  onAddNew,
  onUpload 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRangeType, setDateRangeType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const evaluadores = canViewAll 
    ? Array.from(new Set(users.map(u => u.nombre))).sort()
    : [];

  // ✅ BÚSQUEDA SÍNCRONA - Sin debounce, cambio inmediato
  const handleSearchChange = (e) => {
    const newFilters = { ...filters, search: e.target.value };
    console.log('🔍 Búsqueda INMEDIATA:', e.target.value);
    onFiltersChange(newFilters);
  };

  // ✅ EVALUADOR SÍNCRONO - Cambio inmediato
  const handleEvaluadorChange = (e) => {
    const newFilters = { ...filters, evaluador: e.target.value };
    console.log('👨‍💼 Evaluador INMEDIATO:', e.target.value);
    onFiltersChange(newFilters);
  };

  // ✅ APLICAR FECHA SÍNCRONAMENTE
  const handleDateRangeApply = () => {
    let dateFilter = null;
    
    if (dateRangeType === 'range') {
      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          alert('La fecha de inicio no puede ser posterior a la fecha de fin');
          return;
        }
        
        dateFilter = {
          type: 'range',
          startDate,
          endDate,
          month: null,
          year: null
        };
        
        console.log('📅 Aplicando filtro por rango INMEDIATAMENTE:', dateFilter);
      } else {
        alert('Por favor selecciona ambas fechas para el rango');
        return;
      }
    } else if (dateRangeType === 'month') {
      if (selectedMonth && selectedYear) {
        dateFilter = {
          type: 'month',
          startDate: null,
          endDate: null,
          month: selectedMonth,
          year: selectedYear
        };
        
        console.log('📅 Aplicando filtro por mes INMEDIATAMENTE:', dateFilter);
      } else {
        alert('Por favor selecciona mes y año');
        return;
      }
    } else {
      dateFilter = null;
      console.log('📅 Removiendo filtros de fecha INMEDIATAMENTE');
    }
    
    // ✅ APLICAR INMEDIATAMENTE
    const newFilters = { ...filters, dateRange: dateFilter };
    onFiltersChange(newFilters);
    setShowDatePicker(false);
  };

  // ✅ RESET SÍNCRONO
  const resetFilters = () => {
    const clearedFilters = {
      evaluador: '',
      search: '',
      dateRange: null
    };
    
    console.log('🗑️ Limpiando filtros INMEDIATAMENTE');
    
    // Reset estados locales
    setDateRangeType('all');
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    setSelectedYear(new Date().getFullYear());
    
    // ✅ APLICAR RESET INMEDIATAMENTE
    onFiltersChange(clearedFilters);
  };

  const getDateDisplayText = () => {
    if (!filters.dateRange) {
      return 'Todas las fechas';
    }
    
    if (filters.dateRange.type === 'range') {
      return `${filters.dateRange.startDate} - ${filters.dateRange.endDate}`;
    }
    
    if (filters.dateRange.type === 'month') {
      const monthName = months.find(m => m.value === filters.dateRange.month)?.label;
      return `${monthName} ${filters.dateRange.year}`;
    }
    
    return 'Todas las fechas';
  };

  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // ✅ Función para cerrar el picker si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDatePicker && !event.target.closest('.date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  // ✅ Sincronizar estado interno con filtros externos
  useEffect(() => {
    if (filters.dateRange) {
      setDateRangeType(filters.dateRange.type || 'all');
      if (filters.dateRange.type === 'range') {
        setStartDate(filters.dateRange.startDate || '');
        setEndDate(filters.dateRange.endDate || '');
      } else if (filters.dateRange.type === 'month') {
        setSelectedMonth(filters.dateRange.month || '');
        setSelectedYear(filters.dateRange.year || new Date().getFullYear());
      }
    } else {
      setDateRangeType('all');
      setStartDate('');
      setEndDate('');
      setSelectedMonth('');
      setSelectedYear(new Date().getFullYear());
    }
  }, [filters.dateRange]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
      <div className="space-y-4">
        {/* Fila superior */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
            {/* Búsqueda SÍNCRONA */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por proyecto, zona, departamento, actividad..."
                value={filters.search || ''}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {filters.search && (
                <button
                  onClick={() => onFiltersChange({ ...filters, search: '' })}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Vista */}
            <button
              onClick={() => onViewModeChange(viewMode === "calendar" ? "list" : "calendar")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>{viewMode === "calendar" ? "Vista Lista" : "Vista Calendario"}</span>
            </button>
          </div>

          {/* Acciones */}
          {canCreate && (
            <div className="flex space-x-3">
              <button
                onClick={onAddNew}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm hover:from-green-700 hover:to-green-800 flex items-center space-x-2 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
              <button
                onClick={onUpload}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 transition-all shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Cargar</span>
              </button>
            </div>
          )}
        </div>

        {/* Fila inferior - Filtros */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filtro por fecha */}
          <div className="relative date-picker-container">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center space-x-2 ${
                filters.dateRange ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{getDateDisplayText()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown fecha */}
            {showDatePicker && (
              <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 w-80">
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    {['all', 'range', 'month'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setDateRangeType(type)}
                        className={`flex-1 py-1 px-3 text-sm rounded transition-colors ${
                          dateRangeType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'Todas' : type === 'range' ? 'Rango' : 'Mes'}
                      </button>
                    ))}
                  </div>

                  {dateRangeType === 'range' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Desde</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Hasta</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {dateRangeType === 'month' && (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Mes</label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">Seleccionar mes</option>
                          {months.map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Año</label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(Number(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      onClick={() => setShowDatePicker(false)}
                      className="flex-1 py-1 px-3 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDateRangeApply}
                      className="flex-1 py-1 px-3 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filtro por evaluador SÍNCRONO */}
          {canViewAll && (
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">EVALUADOR</span>
              <select
                onChange={handleEvaluadorChange}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.evaluador || ""}
              >
                <option value="">Todos los evaluadores</option>
                {evaluadores.map(nombre => (
                  <option key={nombre} value={nombre}>{nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Botón limpiar filtros SÍNCRONO */}
          {(filters.search || filters.dateRange || filters.evaluador) && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* ✅ Indicador de filtros activos */}
        {(filters.search || filters.dateRange || filters.evaluador) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-medium text-gray-600">Filtros activos:</span>
            {filters.search && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                Búsqueda: "{filters.search}"
              </span>
            )}
            {filters.evaluador && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Evaluador: {filters.evaluador}
              </span>
            )}
            {filters.dateRange && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                {filters.dateRange.type === 'range' 
                  ? `${filters.dateRange.startDate} - ${filters.dateRange.endDate}`
                  : `${months.find(m => m.value === filters.dateRange.month)?.label} ${filters.dateRange.year}`
                }
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HallazgosFilters;