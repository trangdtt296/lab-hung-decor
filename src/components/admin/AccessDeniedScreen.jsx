'use client';

import React, { useState } from 'react';
import { LogOut, RefreshCw, ShieldX, WifiOff } from 'lucide-react';
import { BrandLogo } from '../common/AppHeader';

/**
 * Màn hình 401: đã đăng nhập Firebase nhưng tài khoản chưa được cấp quyền admin
 * (chưa có document admins/{uid}). Hoặc không kiểm tra được quyền do lỗi mạng (isCheckError).
 */
export default function AccessDeniedScreen({ email, isCheckError = false, onRetry, onLogout }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const retry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const Icon = isCheckError ? WifiOff : ShieldX;

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-10">
      <div role="alert" className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center">
        <div className="flex justify-center">
          <BrandLogo size="lg" />
        </div>

        {!isCheckError && (
          <div className="mt-5 text-5xl sm:text-6xl font-black tracking-tight text-rose-600 tabular-nums">401</div>
        )}

        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
          <Icon className="w-3.5 h-3.5" aria-hidden />
          {isCheckError ? 'Không kiểm tra được quyền truy cập' : 'Không có quyền truy cập'}
        </div>

        <p className="mt-4 text-sm text-slate-600 leading-relaxed">
          {isCheckError ? (
            <>Không kết nối được máy chủ để kiểm tra quyền. Kiểm tra mạng rồi thử lại.</>
          ) : (
            <>
              Tài khoản <strong className="text-slate-900 break-all">{email}</strong> chưa được cấp quyền quản trị.
              Vui lòng liên hệ Admin để được cấp quyền, hoặc đăng nhập bằng tài khoản khác.
            </>
          )}
        </p>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={retry}
            disabled={isRetrying}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            Kiểm tra lại
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng nhập tài khoản khác
          </button>
        </div>
      </div>
    </div>
  );
}
