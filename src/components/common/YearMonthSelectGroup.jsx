'use client';

import React from 'react';
import { AVAILABLE_MONTHS, AVAILABLE_YEARS } from '../../lib/payroll';

export default function YearMonthSelectGroup({ selectedMonth, onChange, theme = 'light' }) {
  const [yearPart, monthPart] = selectedMonth.split('-');

  const handleYearChange = (e) => {
    onChange(`${e.target.value}-${monthPart}`);
  };

  const handleMonthChange = (e) => {
    onChange(`${yearPart}-${e.target.value}`);
  };

  const isDark = theme === 'dark';
  const selectClass = isDark
    ? 'bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors'
    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-900 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors';

  const optionClass = isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900';

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0">
      <select
        aria-label="Chọn năm"
        value={yearPart}
        onChange={handleYearChange}
        className={selectClass}
      >
        {AVAILABLE_YEARS.map((yr) => (
          <option key={yr} value={yr} className={optionClass}>
            Năm {yr}
          </option>
        ))}
      </select>

      <select
        aria-label="Chọn tháng"
        value={monthPart}
        onChange={handleMonthChange}
        className={selectClass}
      >
        {AVAILABLE_MONTHS.map((m) => (
          <option key={m.value} value={m.value} className={optionClass}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}

