import React from 'react';
import { canViewAllHallazgos } from '../../../utils/permissions';

const HallazgosCalendar = ({ selectedDate, onDateChange, hallazgos, filters, currentUser }) => {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const matchesSearch = (hallazgo, searchTerm) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      hallazgo.proyecto?.toLowerCase().includes(search) ||
      hallazgo.zona?.toLowerCase().includes(search) ||
      hallazgo.departamento?.toLowerCase().includes(search) ||
      hallazgo.actividad?.toLowerCase().includes(search) ||
      hallazgo.evaluador?.toLowerCase().includes(search) ||
      hallazgo.resultado?.toLowerCase().includes(search)
    );
  };

  const getFilteredHallazgos = () => {
    return hallazgos.filter(h => {
      if (filters.evaluador && h.evaluador !== filters.evaluador) return false;
      if (!matchesSearch(h, filters.search)) return false;

      const canViewAll = canViewAllHallazgos(currentUser);
      if (!canViewAll) {
        return (
          h.usuario_id === currentUser?.id ||
          h.evaluador === currentUser?.nombre
        );
      }

      return true;
    });
  };

  const filteredHallazgos = getFilteredHallazgos();

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-12" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const today = new Date();
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      const hasEvents = filteredHallazgos.some(h => {
        const hDate = new Date(h.fecha_inspeccion);
        return (
          hDate.getDate() === day &&
          hDate.getMonth() === currentMonth &&
          hDate.getFullYear() === currentYear
        );
      });

      days.push(
        <div
          key={day}
          className={`h-12 w-full flex items-center justify-center text-sm cursor-pointer rounded-lg transition-colors ${
            isToday
              ? "bg-blue-600 text-white font-semibold"
              : hasEvents
              ? "bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium"
              : "hover:bg-gray-100"
          }`}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction);
    onDateChange(newDate);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-gray-600 text-sm">
            {day}
          </div>
        ))}
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default HallazgosCalendar;
