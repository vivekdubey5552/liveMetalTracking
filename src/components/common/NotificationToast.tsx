import React from 'react';
import { Bell, X, CheckCircle, TrendingUp } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'alert' | 'success' | 'info';
  timestamp: number;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 border border-amber-500/40 rounded-xl p-4 shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-sans">
                {toast.title}
              </h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5 leading-snug">
                {toast.message}
              </p>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                {new Date(toast.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
