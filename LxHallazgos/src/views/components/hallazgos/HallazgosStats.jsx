import React from 'react';
import { TrendingUp, TrendingDown, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';

const HallazgosStats = ({ hallazgos, currentUser, canViewAll }) => {
  // Filtrar hallazgos según permisos
  const filteredHallazgos = hallazgos.filter(h => {
    if (canViewAll) return true;
    return h.usuario_id === currentUser?.id || h.evaluador === currentUser?.nombre;
  });

  // Calcular estadísticas
  const stats = {
    total: filteredHallazgos.length,
    abiertos: filteredHallazgos.filter(h => h.estado !== 'cerrado').length,
    cerrados: filteredHallazgos.filter(h => h.estado === 'cerrado').length,
    misHallazgos: filteredHallazgos.filter(h => h.usuario_id === currentUser?.id).length,
    // Estadísticas del mes actual usando dwh_create
    esteMes: filteredHallazgos.filter(h => {
      const fecha = new Date(h.dwh_create); // Cambio aquí
      const ahora = new Date();
      return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
    }).length,
    // Tendencia usando dwh_create
    mesAnterior: filteredHallazgos.filter(h => {
      const fecha = new Date(h.dwh_create); // Cambio aquí
      const ahora = new Date();
      const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1);
      return fecha.getMonth() === mesAnterior.getMonth() && fecha.getFullYear() === mesAnterior.getFullYear();
    }).length
  };

  const tendencia = stats.esteMes - stats.mesAnterior;
  const porcentajeCerrados = stats.total > 0 ? Math.round((stats.cerrados / stats.total) * 100) : 0;

  const statCards = [
    {
      title: 'Total Hallazgos',
      value: stats.total,
      icon: AlertCircle,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Abiertos',
      value: stats.abiertos,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Cerrados',
      value: stats.cerrados,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      borderColor: 'border-green-200',
      extra: `${porcentajeCerrados}%`
    },
    {
      title: canViewAll ? 'Este Mes' : 'Mis Hallazgos',
      value: canViewAll ? stats.esteMes : stats.misHallazgos,
      icon: canViewAll ? (tendencia >= 0 ? TrendingUp : TrendingDown) : Users,
      color: canViewAll ? (tendencia >= 0 ? 'red' : 'green') : 'purple',
      bgColor: canViewAll ? (tendencia >= 0 ? 'bg-red-50' : 'bg-green-50') : 'bg-purple-50',
      textColor: canViewAll ? (tendencia >= 0 ? 'text-red-600' : 'text-green-600') : 'text-purple-600',
      borderColor: canViewAll ? (tendencia >= 0 ? 'border-red-200' : 'border-green-200') : 'border-purple-200',
      trend: canViewAll ? tendencia : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className={`${stat.bgColor} rounded-xl p-6 border ${stat.borderColor} transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">{stat.title}</h3>
              <Icon className={`w-5 h-5 ${stat.textColor}`} />
            </div>
            <div className="flex items-baseline justify-between">
              <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
              {stat.extra && (
                <span className={`text-sm font-medium ${stat.textColor}`}>{stat.extra}</span>
              )}
              {stat.trend !== null && stat.trend !== 0 && (
                <span className={`text-sm font-medium ${stat.textColor}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend}
                </span>
              )}
            </div>
            {stat.trend !== null && (
              <p className="text-xs text-gray-600 mt-1">
                vs. mes anterior
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default HallazgosStats;