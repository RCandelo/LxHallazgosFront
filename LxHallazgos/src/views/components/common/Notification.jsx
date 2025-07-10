import React, { useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';

const Notification = ({ notification, duration = 3000 }) => {
  if (!notification) return null;

  const getStyles = () => {
    switch (notification.type) {
      case 'error':
        return 'bg-red-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'error':
      case 'info':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Check className="w-5 h-5" />;
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${getStyles()}`}>
      {getIcon()}
      <span>{notification.message}</span>
    </div>
  );
};

export default Notification;