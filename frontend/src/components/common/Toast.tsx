import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Sparkles } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div 
      id="global-toast-container" 
      aria-live="polite"
      className="fixed top-5 right-5 sm:bottom-6 sm:top-auto sm:right-6 z-[999999] flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      {toasts.map(toast => {
        let styleClasses = 'bg-[#1f1c1b] text-white border-[#fdcc87]/30 shadow-2xl';
        let icon = <Info className="w-5 h-5 text-[#fdcc87] shrink-0 mt-0.5" />;
        let label = 'Information';

        if (toast.type === 'success') {
          styleClasses = 'bg-gradient-to-r from-[#570000] via-[#6d0000] to-[#450000] text-white border-[#fdcc87]/60 shadow-2xl shadow-[#570000]/40';
          icon = <CheckCircle2 className="w-5 h-5 text-[#fdcc87] shrink-0 mt-0.5" />;
          label = 'Success';
        } else if (toast.type === 'error') {
          styleClasses = 'bg-gradient-to-r from-red-950 to-red-900 text-white border-red-500/50 shadow-2xl shadow-red-950/50';
          icon = <AlertCircle className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />;
          label = 'Notice';
        } else if (toast.type === 'warning') {
          styleClasses = 'bg-gradient-to-r from-amber-950 to-[#7b581e] text-white border-amber-400/50 shadow-2xl';
          icon = <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />;
          label = 'Warning';
        }

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            role="status"
            className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-2xl border backdrop-blur-xl transition-all transform duration-300 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-bottom-4 ring-1 ring-white/10 ${styleClasses}`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#fdcc87]/80 block">
                  {label}
                </span>
                <p className="text-xs sm:text-sm font-medium leading-snug text-white/95">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1"
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
