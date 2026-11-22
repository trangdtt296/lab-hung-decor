'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, FileUp, KeyRound, LogOut } from 'lucide-react';
import AdminAvatar from './AdminAvatar';
import { ACCOUNT_PAGES } from './adminTabs';

const itemClass = 'flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50';

/**
 * Nút tài khoản trên header: email đang đăng nhập, Đổi mật khẩu, (Nhập dữ liệu cũ khi bật cờ), Đăng xuất
 */
export default function AccountMenu({ email, showLegacyImport, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Tài khoản"
        className="inline-flex items-center gap-1 h-9 pl-1 pr-1.5 sm:pr-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer transition-colors"
      >
        <AdminAvatar size={28} />
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 overflow-hidden z-50 animate-modal-in"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <AdminAvatar size={40} />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-slate-400">Quản trị viên</div>
              <div className="text-sm font-bold text-slate-900 truncate">{email}</div>
            </div>
          </div>
          <Link href={ACCOUNT_PAGES.changePassword} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <KeyRound className="w-4 h-4 text-slate-500" />
            Đổi mật khẩu
          </Link>
          {showLegacyImport && (
            <Link href={ACCOUNT_PAGES.legacyImport} role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <FileUp className="w-4 h-4 text-slate-500" />
              Nhập dữ liệu cũ (Excel)
            </Link>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 cursor-pointer border-t border-slate-100"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}
