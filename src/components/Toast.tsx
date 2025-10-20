import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon text-green-500" />;
      case 'error':
        return <AlertCircle className="toast-icon text-red-500" />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-yellow-500" />;
      case 'info':
        return <Info className="toast-icon text-blue-500" />;
      default:
        return <Info className="toast-icon text-blue-500" />;
    }
  };

  return (
    <div className={`toast ${type} ${isRemoving ? 'removing' : ''}`}>
      {getIcon()}
      <div className="toast-content">
        <h4 className="toast-title">{title}</h4>
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
