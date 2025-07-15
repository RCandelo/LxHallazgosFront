import React, { useMemo, useState } from 'react';
import { X, TrendingUp, TrendingDown, Clock, Target, Users, Calendar, Award, CheckCircle2, Filter, RotateCcw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const AdvancedDashboardModal = ({ hallazgos, isOpen, onClose, currentUser, canViewAll }) => {
  if (!isOpen) return null;

  // Estados para filtros del dashboard
  const [dashboardFilters, setDashboardFilters] = useState({
    year: '',
    month: '',
    evaluador: '',
    cerradoPor: '',
    estado: '',
    zona: ''
  });

  // Función para limpiar filtros
  const clearFilters = () => {
    setDashboardFilters({
      year: '',
      month: '',
      evaluador: '',
      cerradoPor: '',
      estado: '',
      zona: ''
    });
  };

  // Función para actualizar filtros
  const updateFilter = (key, value) => {
    setDashboardFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filtrar hallazgos según permisos Y filtros del dashboard
  const filteredHallazgos = hallazgos.filter(h => {
    // Filtro por permisos
    if (!canViewAll && h.usuario_id !== currentUser?.id && h.evaluador !== currentUser?.nombre) {
      return false;
    }

    // Aplicar filtros del dashboard
    const fechaHallazgo = new Date(h.dwh_create);
    
    // Filtro por año
    if (dashboardFilters.year && fechaHallazgo.getFullYear().toString() !== dashboardFilters.year) {
      return false;
    }
    
    // Filtro por mes
    if (dashboardFilters.month && (fechaHallazgo.getMonth() + 1).toString() !== dashboardFilters.month) {
      return false;
    }
    
    // Filtro por evaluador
    if (dashboardFilters.evaluador && h.evaluador !== dashboardFilters.evaluador) {
      return false;
    }
    
    // Filtro por quien cerró
    if (dashboardFilters.cerradoPor && (h.quien_cerro !== dashboardFilters.cerradoPor && h.cerrado_por !== dashboardFilters.cerradoPor)) {
      return false;
    }
    
    // Filtro por estado
    if (dashboardFilters.estado) {
      if (dashboardFilters.estado === 'abiertos' && h.estado === 'cerrado') {
        return false;
      }
      if (dashboardFilters.estado === 'cerrados' && h.estado !== 'cerrado') {
        return false;
      }
      if (dashboardFilters.estado !== 'abiertos' && dashboardFilters.estado !== 'cerrados' && h.estado !== dashboardFilters.estado) {
        return false;
      }
    }
    
    // Filtro por zona
    if (dashboardFilters.zona && h.zona !== dashboardFilters.zona) {
      return false;
    }

    return true;
  });

  // Obtener listas únicas para los filtros
  const filterOptions = useMemo(() => {
    const baseHallazgos = canViewAll ? hallazgos : hallazgos.filter(h => h.usuario_id === currentUser?.id || h.evaluador === currentUser?.nombre);
    
    return {
      years: [...new Set(baseHallazgos.map(h => new Date(h.dwh_create).getFullYear().toString()))].sort((a, b) => b.localeCompare(a)),
      evaluadores: [...new Set(baseHallazgos.map(h => h.evaluador).filter(Boolean))].sort(),
      cerradores: [...new Set(baseHallazgos.filter(h => h.estado === 'cerrado').map(h => h.quien_cerro || h.cerrado_por).filter(Boolean))].sort(),
      zonas: [...new Set(baseHallazgos.map(h => h.zona).filter(Boolean))].sort()
    };
  }, [hallazgos, currentUser, canViewAll]);

  // Procesar datos para análisis
  const analytics = useMemo(() => {
    // Estadísticas básicas
    const total = filteredHallazgos.length;
    const abiertos = filteredHallazgos.filter(h => h.estado !== 'cerrado').length;
    const cerrados = filteredHallazgos.filter(h => h.estado === 'cerrado').length;
    const enProceso = filteredHallazgos.filter(h => h.estado === 'en_proceso').length;
    const pendientes = filteredHallazgos.filter(h => h.estado === 'pendiente').length;

    // Tendencias mensuales (últimos 6 meses)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthData = filteredHallazgos.filter(h => {
        const hallazgoDate = new Date(h.dwh_create);
        return hallazgoDate.getMonth() === month && hallazgoDate.getFullYear() === year;
      });

      monthlyTrends.push({
        mes: date.toLocaleDateString('es-ES', { month: 'short' }),
        total: monthData.length,
        cerrados: monthData.filter(h => h.estado === 'cerrado').length,
        abiertos: monthData.filter(h => h.estado !== 'cerrado').length
      });
    }

    // Distribución por estado
    const estadosData = [
      { name: 'Cerrados', value: cerrados, color: '#22c55e' },
      { name: 'En Proceso', value: enProceso, color: '#3b82f6' },
      { name: 'Pendientes', value: pendientes, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    // Top evaluadores
    const evaluadoresCount = {};
    filteredHallazgos.forEach(h => {
      if (h.evaluador) {
        evaluadoresCount[h.evaluador] = (evaluadoresCount[h.evaluador] || 0) + 1;
      }
    });

    const topEvaluadores = Object.entries(evaluadoresCount)
      .map(([name, count]) => ({ 
        name, 
        total: count,
        cerrados: filteredHallazgos.filter(h => h.evaluador === name && h.estado === 'cerrado').length
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Análisis de quién cierra los hallazgos
    const cerradoPorCount = {};
    filteredHallazgos
      .filter(h => h.estado === 'cerrado' && (h.quien_cerro || h.cerrado_por))
      .forEach(h => {
        const cerrador = h.quien_cerro || h.cerrado_por;
        cerradoPorCount[cerrador] = (cerradoPorCount[cerrador] || 0) + 1;
      });

    const topCerradores = Object.entries(cerradoPorCount)
      .map(([name, count]) => ({ 
        name, 
        cerrados: count,
        // Calcular tiempo promedio de cierre para esta persona
        tiempoPromedio: (() => {
          const hallazgosCerradosPorEsta = filteredHallazgos.filter(h => 
            h.estado === 'cerrado' && 
            (h.quien_cerro === name || h.cerrado_por === name) &&
            h.fecha_cierre && h.dwh_create
          );
          
          if (hallazgosCerradosPorEsta.length === 0) return 0;
          
          const tiempoTotal = hallazgosCerradosPorEsta.reduce((acc, h) => {
            const inicio = new Date(h.dwh_create);
            const fin = new Date(h.fecha_cierre);
            const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
            return acc + dias;
          }, 0);
          
          return Math.round(tiempoTotal / hallazgosCerradosPorEsta.length);
        })()
      }))
      .sort((a, b) => b.cerrados - a.cerrados)
      .slice(0, 5);

    // Análisis por departamento
    const departamentosCount = {};
    filteredHallazgos.forEach(h => {
      if (h.departamento) {
        departamentosCount[h.departamento] = (departamentosCount[h.departamento] || 0) + 1;
      }
    });

    const departamentosData = Object.entries(departamentosCount)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Tiempo promedio de cierre (en días)
    const cerradosConTiempo = filteredHallazgos.filter(h => h.estado === 'cerrado' && h.fecha_cierre && h.dwh_create);
    const tiempoPromedio = cerradosConTiempo.length > 0 
      ? cerradosConTiempo.reduce((acc, h) => {
          const inicio = new Date(h.dwh_create);
          const fin = new Date(h.fecha_cierre);
          const dias = (fin - inicio) / (1000 * 60 * 60 * 24);
          return acc + dias;
        }, 0) / cerradosConTiempo.length
      : 0;

    // Tasa de cierre (porcentaje)
    const tasaCierre = total > 0 ? (cerrados / total) * 100 : 0;

    return {
      total,
      abiertos,
      cerrados,
      enProceso,
      pendientes,
      monthlyTrends,
      estadosData,
      topEvaluadores,
      topCerradores,
      departamentosData,
      tiempoPromedio: Math.round(tiempoPromedio),
      tasaCierre: Math.round(tasaCierre * 10) / 10
    };
  }, [filteredHallazgos, currentUser, canViewAll]);

  const kpis = [
    {
      title: 'Total Hallazgos',
      value: analytics.total,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null
    },
    {
      title: 'Tasa de Cierre',
      value: `${analytics.tasaCierre}%`,
      icon: analytics.tasaCierre >= 70 ? TrendingUp : TrendingDown,
      color: analytics.tasaCierre >= 70 ? 'text-green-600' : 'text-red-600',
      bgColor: analytics.tasaCierre >= 70 ? 'bg-green-100' : 'bg-red-100',
      trend: analytics.tasaCierre >= 70 ? '+5%' : '-2%'
    },
    {
      title: 'Tiempo Promedio',
      value: `${analytics.tiempoPromedio} días`,
      icon: Clock,
      color: analytics.tiempoPromedio <= 7 ? 'text-green-600' : 'text-orange-600',
      bgColor: analytics.tiempoPromedio <= 7 ? 'bg-green-100' : 'bg-orange-100',
      trend: null
    },
    {
      title: 'Cerradores Activos',
      value: analytics.topCerradores.length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: null
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-bold">Dashboard Avanzado</h2>
            <p className="text-blue-100">Análisis detallado de hallazgos</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sección de Filtros */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Filtros del Dashboard
              </h3>
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center space-x-1"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-sm">Limpiar</span>
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {/* Filtro Año */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
                <select
                  value={dashboardFilters.year}
                  onChange={(e) => updateFilter('year', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Mes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mes</label>
                <select
                  value={dashboardFilters.month}
                  onChange={(e) => updateFilter('month', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="1">Enero</option>
                  <option value="2">Febrero</option>
                  <option value="3">Marzo</option>
                  <option value="4">Abril</option>
                  <option value="5">Mayo</option>
                  <option value="6">Junio</option>
                  <option value="7">Julio</option>
                  <option value="8">Agosto</option>
                  <option value="9">Septiembre</option>
                  <option value="10">Octubre</option>
                  <option value="11">Noviembre</option>
                  <option value="12">Diciembre</option>
                </select>
              </div>

              {/* Filtro Evaluador */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Evaluador</label>
                <select
                  value={dashboardFilters.evaluador}
                  onChange={(e) => updateFilter('evaluador', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.evaluadores.map(evaluador => (
                    <option key={evaluador} value={evaluador}>{evaluador}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Cerrado Por */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cerrado por</label>
                <select
                  value={dashboardFilters.cerradoPor}
                  onChange={(e) => updateFilter('cerradoPor', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  {filterOptions.cerradores.map(cerrador => (
                    <option key={cerrador} value={cerrador}>{cerrador}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                <select
                  value={dashboardFilters.estado}
                  onChange={(e) => updateFilter('estado', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="abiertos">Abiertos</option>
                  <option value="cerrados">Cerrados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_proceso">En Proceso</option>
                </select>
              </div>

              {/* Filtro Zona */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Zona</label>
                <select
                  value={dashboardFilters.zona}
                  onChange={(e) => updateFilter('zona', e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todas</option>
                  {filterOptions.zonas.map(zona => (
                    <option key={zona} value={zona}>{zona}</option>
                  ))}
                </select>
              </div>

              {/* Contador de resultados */}
              <div className="flex items-end">
                <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                  {filteredHallazgos.length} resultados
                </div>
              </div>
            </div>

            {/* Indicadores de filtros activos */}
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(dashboardFilters).map(([key, value]) => {
                if (!value) return null;
                
                const filterLabels = {
                  year: 'Año',
                  month: 'Mes',
                  evaluador: 'Evaluador',
                  cerradoPor: 'Cerrado por',
                  estado: 'Estado',
                  zona: 'Zona'
                };

                const monthNames = {
                  '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
                  '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
                  '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
                };

                const displayValue = key === 'month' ? monthNames[value] || value : value;

                return (
                  <span
                    key={key}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1"
                  >
                    <span>{filterLabels[key]}: {displayValue}</span>
                    <button
                      onClick={() => updateFilter(key, '')}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <div key={index} className={`${kpi.bgColor} rounded-xl p-6 border border-gray-200`}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-8 h-8 ${kpi.color}`} />
                    {kpi.trend && (
                      <span className={`text-sm font-medium ${kpi.color}`}>
                        {kpi.trend}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">{kpi.title}</h3>
                  <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              );
            })}
          </div>

          {/* Gráficos principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tendencias mensuales */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Tendencias Mensuales
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="total" stackId="1" stroke="#3b82f6" fill="#93c5fd" />
                  <Area type="monotone" dataKey="cerrados" stackId="2" stroke="#22c55e" fill="#86efac" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución por estado */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-600" />
                Distribución por Estado
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.estadosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.estadosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Análisis por evaluadores y departamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top evaluadores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Top Evaluadores
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topEvaluadores} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" name="Total" />
                  <Bar dataKey="cerrados" fill="#22c55e" name="Cerrados" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top cerradores */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-green-600" />
                Quién Cierra Más
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.topCerradores} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value, name) => [value, name === 'cerrados' ? 'Hallazgos Cerrados' : 'Tiempo Promedio (días)']} />
                  <Bar dataKey="cerrados" fill="#22c55e" name="cerrados" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Distribución por departamento */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Por Departamento
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departamentosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tabla resumen */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumen por Evaluador */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen por Evaluador</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Evaluador</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Total</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Cerrados</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Tasa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topEvaluadores.map((evaluador, index) => {
                      const tasaCierre = evaluador.total > 0 ? (evaluador.cerrados / evaluador.total) * 100 : 0;
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{evaluador.name}</td>
                          <td className="p-3 text-center text-gray-700">{evaluador.total}</td>
                          <td className="p-3 text-center text-green-600 font-medium">{evaluador.cerrados}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              tasaCierre >= 80 ? 'bg-green-100 text-green-800' :
                              tasaCierre >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tasaCierre.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumen por Cerrador */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Eficiencia de Cierre</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-700">Cerrado por</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Cerrados</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Tiempo Prom.</th>
                      <th className="text-center p-3 font-semibold text-gray-700">Eficiencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topCerradores.map((cerrador, index) => {
                      return (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900">{cerrador.name}</td>
                          <td className="p-3 text-center text-green-600 font-medium">{cerrador.cerrados}</td>
                          <td className="p-3 text-center text-gray-700">{cerrador.tiempoPromedio} días</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              cerrador.tiempoPromedio <= 3 ? 'bg-green-100 text-green-800' :
                              cerrador.tiempoPromedio <= 7 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {cerrador.tiempoPromedio <= 3 ? 'Excelente' :
                               cerrador.tiempoPromedio <= 7 ? 'Bueno' : 'Mejorar'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Datos actualizados: {new Date().toLocaleDateString('es-ES')}
            </p>
            <p className="text-sm text-blue-600 font-medium">
              Mostrando {filteredHallazgos.length} de {hallazgos.length} hallazgos
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedDashboardModal;