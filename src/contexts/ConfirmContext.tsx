import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts);
      setIsOpen(true);
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = () => {
    if (resolver) resolver.resolve(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (resolver) resolver.resolve(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleCancel}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden z-10 animate-in zoom-in-95 duration-200">
            <div className={`p-6 border-b ${options.isDestructive ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${options.isDestructive ? 'bg-amber-100 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-amber-100 text-amber-600'}`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{options.title || 'Please Confirm'}</h3>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{options.message}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {options.cancelText || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-5 py-2 font-bold text-white rounded-lg transition-colors shadow-sm
                  ${options.isDestructive ? 'bg-amber-600 hover:bg-amber-700' : 'bg-amber-600 hover:bg-amber-700'}
                `}
              >
                {options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
