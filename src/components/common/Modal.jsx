'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Khung modal dùng chung:
 * - Mobile: bottom-sheet bám đáy, cuộn được khi bàn phím bật (max-h 90dvh), chừa safe-area iPhone
 * - Desktop: hộp giữa màn hình
 * - Đóng bằng phím Esc / bấm nền mờ, khoá cuộn trang phía sau
 */
const SIZES = { md: 'sm:max-w-md', lg: 'sm:max-w-2xl' };

export default function Modal({ isOpen = true, onClose, title, subtitle, icon, children, footer, size = 'md' }) {
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && onCloseRef.current?.();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`bg-white w-full ${SIZES[size] || SIZES.md} max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl animate-modal-in`}
      >
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h3 id={titleId} className="text-base font-extrabold text-slate-900 leading-snug">
                {title}
              </h3>
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-slate-100 shrink-0">
            {footer}
          </div>
        )}
        {!footer && <div className="pb-[env(safe-area-inset-bottom)] shrink-0" />}
      </div>
    </div>
  );
}
