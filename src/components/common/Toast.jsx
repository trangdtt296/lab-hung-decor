'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

/** Thông báo ngắn. Mobile: nổi phía trên thanh điều hướng đáy; desktop: góc trên. */
export default function Toast({ toast }) {
  const isError = toast?.type === 'error';
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed z-[60] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md pointer-events-none bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-auto lg:top-20"
    >
      {toast && (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md animate-modal-in ${
            isError ? 'bg-rose-950/95 border-rose-800 text-rose-50' : 'bg-slate-900/95 border-slate-700/80 text-white'
          }`}
        >
          <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isError ? 'text-rose-300' : 'text-emerald-400'}`} />
          <span className="text-xs font-medium leading-relaxed break-words">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
