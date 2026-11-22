'use client';

import React from 'react';
import Image from 'next/image';
import YearMonthSelectGroup from './YearMonthSelectGroup';

const LOGO_SIZES = {
  md: { px: 40, className: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl' },
  lg: { px: 64, className: 'w-16 h-16 rounded-2xl' },
};

/** Logo Hùng Decor (public/logo.jpg — nền đen, hợp với header tối) */
export function BrandLogo({ size = 'md', priority = false }) {
  const { px, className } = LOGO_SIZES[size] || LOGO_SIZES.md;
  return (
    <Image
      src="/logo.jpg"
      alt="Hùng Decor – Khung tranh"
      width={px}
      height={px}
      priority={priority}
      className={`${className} shrink-0 object-cover shadow-sm ring-1 ring-white/10`}
    />
  );
}

/** Nút trên header: mobile chỉ hiện icon (label đưa vào aria-label), từ sm hiện cả chữ */
export function HeaderButton({ icon: Icon, label, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    ghost: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white',
  };
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer transition-colors disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/**
 * Header dính đỉnh trang.
 * Mobile: hàng 1 = logo + nút; hàng 2 = chọn tháng/năm full-width.
 * Desktop: tất cả trên 1 hàng, `nav` (tab) hiện ở giữa từ breakpoint lg.
 */
export default function AppHeader({ leading, title, nav, selectedMonth, onMonthChange, actions, maxWidth = 'max-w-7xl' }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md pt-[env(safe-area-inset-top)]">
      <div className={`${maxWidth} mx-auto px-4 sm:px-6`}>
        <div className="flex items-center justify-between gap-3 h-14 sm:h-16">
          <div className="flex items-center gap-2.5 min-w-0">
            {leading || <BrandLogo priority />}
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight truncate">{title}</h1>
          </div>

          {nav && <div className="hidden lg:block">{nav}</div>}

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:block">
              <YearMonthSelectGroup selectedMonth={selectedMonth} onChange={onMonthChange} theme="dark" />
            </div>
            {actions}
          </div>
        </div>

        <div className="sm:hidden pb-2.5">
          <YearMonthSelectGroup selectedMonth={selectedMonth} onChange={onMonthChange} theme="dark" className="grid! w-full" />
        </div>
      </div>
    </header>
  );
}
