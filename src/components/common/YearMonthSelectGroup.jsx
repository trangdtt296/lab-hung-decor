'use client';

import React from 'react';
import { AVAILABLE_MONTHS, AVAILABLE_YEARS } from '../../lib/payroll';

const THEMES = {
  dark: {
    select: 'bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700',
    option: 'bg-slate-900 text-white',
  },
  light: {
    select: 'bg-slate-100 hover:bg-slate-200/80 text-slate-900 border-slate-200',
    option: 'bg-white text-slate-900',
  },
};

export default function YearMonthSelectGroup({ selectedMonth, onChange, theme = 'light', className = '' }) {
  const [yearPart, monthPart] = selectedMonth.split('-');
  const { select, option } = THEMES[theme] || THEMES.light;
  const selectClass = `${select} border rounded-xl px-2.5 py-2 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors`;

  return (
    <div className={`inline-grid grid-cols-2 gap-1.5 shrink-0 ${className}`}>
      <select
        aria-label="Chọn tháng"
        value={monthPart}
        onChange={(e) => onChange(`${yearPart}-${e.target.value}`)}
        className={selectClass}
      >
        {AVAILABLE_MONTHS.map((m) => (
          <option key={m.value} value={m.value} className={option}>
            {m.label}
          </option>
        ))}
      </select>
      <select
        aria-label="Chọn năm"
        value={yearPart}
        onChange={(e) => onChange(`${e.target.value}-${monthPart}`)}
        className={selectClass}
      >
        {AVAILABLE_YEARS.map((yr) => (
          <option key={yr} value={yr} className={option}>
            Năm {yr}
          </option>
        ))}
      </select>
    </div>
  );
}
