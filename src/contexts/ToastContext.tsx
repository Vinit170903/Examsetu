import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-4 pointer-events-none items-center">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 transform transition-all min-w-[320px] max-w-md border
              ${toast.type === 'success' ? 'bg-white border-amber-200' : ''}
              ${toast.type === 'error' ? 'bg-white border-rose-200' : ''}
              ${toast.type === 'info' ? 'bg-white border-slate-200' : ''}
            `}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
              ${toast.type === 'success' ? 'bg-amber-100 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : ''}
              ${toast.type === 'error' ? 'bg-rose-100 text-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : ''}
              ${toast.type === 'info' ? 'bg-slate-100 text-slate-600 shadow-[0_0_15px_rgba(148,163,184,0.3)]' : ''}
            `}>
              {toast.type === 'success' && <CheckCircle className="w-6 h-6" />}
              {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
              {toast.type === 'info' && <Info className="w-6 h-6" />}
            </div>

            <div className="flex-1">
              <h4 className={`font-bold text-base 
                ${toast.type === 'success' ? 'text-amber-900' : ''}
                ${toast.type === 'error' ? 'text-rose-900' : ''}
                ${toast.type === 'info' ? 'text-slate-900' : ''}
              `}>
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Notice'}
              </h4>
              <p className="font-semibold text-sm text-slate-600 leading-snug">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
