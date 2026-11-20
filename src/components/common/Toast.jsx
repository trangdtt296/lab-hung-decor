'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md flex items-start gap-2.5 bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
      <span className="text-xs font-medium leading-relaxed break-words">{message}</span>
    </div>
  );
}

