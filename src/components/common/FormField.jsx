'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:text-slate-500';

export const primaryButtonClass =
  'w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold shadow-md cursor-pointer disabled:opacity-60 transition-colors';

/** Nhãn + ô nhập, giữ khoảng cách & kiểu chữ thống nhất giữa các form */
export default function FormField({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold text-slate-700 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

/** Ô mật khẩu có nút con mắt ẩn/hiện nằm trong ô */
export function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? 'text' : 'password'} className={`${inputClass} pr-11 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        title={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

/** Chọn ngày trong tháng → trả về chuỗi 'DD/MM' (tránh nhập tay sai định dạng) */
export function DayOfMonthSelect({ monthKey, value, onChange }) {
  const [year, month] = monthKey.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();
  const mm = String(month).padStart(2, '0');
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      {Array.from({ length: totalDays }, (_, i) => {
        const v = `${String(i + 1).padStart(2, '0')}/${mm}`;
        return (
          <option key={v} value={v}>
            {v}
          </option>
        );
      })}
    </select>
  );
}

/** Ngày mặc định cho form: hôm nay nếu đang xem tháng hiện tại, ngược lại ngày 01 */
export const defaultDateForMonth = (monthKey) => {
  const now = new Date();
  const [year, month] = monthKey.split('-').map(Number);
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  const day = isCurrentMonth ? now.getDate() : 1;
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
};
