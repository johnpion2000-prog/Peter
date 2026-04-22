import React, { useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
};

const colors = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
};

const ToastItem: React.FC<{ id: string; message: string; type: 'success' | 'error' | 'info' }> = ({ id, message, type }) => {
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    const t = setTimeout(() => removeToast(id), 4000);
    return () => clearTimeout(t);
  }, [id, removeToast]);

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-md ${colors[type]}`}>
      <span>{icons[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => removeToast(id)} className="ml-auto text-lg leading-none opacity-60 hover:opacity-100">×</button>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => <ToastItem key={t.id} {...t} />)}
    </div>
  );
};

export default ToastContainer;
