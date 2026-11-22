'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/** Màn hình chờ khi đang khôi phục phiên đăng nhập / tải dữ liệu Firestore lần đầu */
export default function LoadingScreen({ message = 'Đang tải dữ liệu...', fullScreen = true }) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${fullScreen ? 'min-h-dvh' : 'py-24'}`}
    >
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs font-semibold">{message}</span>
    </div>
  );
}
