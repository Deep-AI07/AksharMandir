import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map(toast => {
        let bgClass = 'bg-[#1f1c1b] text-white border-[#7b581e]/40';
        let icon = <Info className="w-5 h-5 text-[#fdcc87] shrink-0" />;

        if (toast.type === 'success') {
          bgClass = 'bg-[#570000] text-white border-[#c59b27]/60 shadow-xl shadow-[#570000]/20';
          icon = <CheckCircle2 className="w-5 h-5 text-[#fdcc87] shrink-0" />;
        } else if (toast.type === 'error') {
          bgClass = 'bg-red-900 text-white border-red-500/40 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-[#7b581e] text-white border-[#fdcc87]/40 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-[#fdcc87] shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl border backdrop-blur-md transition-all transform animate-in fade-in slide-in-from-bottom-2 ${bgClass}`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white p-1 rounded-md transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export const Toast = ToastContainer;
