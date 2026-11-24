'use client';

import React, { useMemo } from 'react';
import { TrendingDown, TrendingUp, Minus, BarChart3 } from 'lucide-react';
import { AVAILABLE_YEARS, formatVND, formatMonthLabel, parseMonthKey, toMonthKey } from '../../lib/payroll';
import { computeYearStats, formatCompactVND, percentChange, FUEL_CATEGORY } from '../../lib/dashboard';
import { useTodayInfo } from '../../hooks/useTodayInfo';
import { CATEGORY_STYLE, DEFAULT_CATEGORY_STYLE } from './ExpensesTab';

/** Màu 2 chuỗi số liệu (đã kiểm tra tách biệt cho người mù màu): Lương = emerald, Chi tiêu = indigo */
const SERIES = {
  salary: { label: 'Lương', bar: 'bg-emerald-600', swatch: 'bg-emerald-600' },
  expenses: { label: 'Chi tiêu', bar: 'bg-indigo-500', swatch: 'bg-indigo-500' },
};

const cardClass = 'bg-white rounded-2xl border border-slate-200 shadow-xs';

/* --------------------------------- Phụ trợ --------------------------------- */

function Change({ value, invert = true, className = '' }) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <span className={`text-slate-400 ${className}`}>—</span>;
  }
  const rounded = Math.round(value);
  // Với chi phí: tăng = xấu (đỏ), giảm = tốt (xanh)
  const up = rounded > 0;
  const Icon = rounded === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const tone = rounded === 0 ? 'text-slate-500' : up === invert ? 'text-rose-600' : 'text-emerald-700';
  return (
    <span className={`inline-flex items-center gap-0.5 font-bold tabular-nums whitespace-nowrap ${tone} ${className}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {up ? '+' : ''}
      {rounded}%
    </span>
  );
}

function StatTile({ label, value, sub, accent }) {
  return (
    <div className={`${cardClass} p-3 sm:p-4 min-w-0`}>
      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-slate-500">
        {accent && <span className={`w-2 h-2 rounded-sm shrink-0 ${accent}`} aria-hidden />}
        <span className="truncate">{label}</span>
      </div>
      <div className="text-base sm:text-xl font-black tabular-nums text-slate-900 truncate mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-slate-500 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
      {Object.values(SERIES).map((s) => (
        <span key={s.label} className="inline-flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-sm ${s.swatch}`} aria-hidden />
          {s.label}
        </span>
      ))}
    </div>
  );
}

/* ---------------------------- Biểu đồ theo tháng ---------------------------- */

/**
 * Chênh lệch so với tháng trước: % và số tiền, VD "▲ +31% · +2,8tr".
 * Chi phí tăng = đỏ, giảm = xanh. Tháng trước = 0 thì chỉ hiện số tiền.
 */
function Delta({ current, previous }) {
  if (previous === null || previous === undefined) return <span className="text-slate-400">—</span>;
  const diff = current - previous;
  const pct = percentChange(current, previous);
  const roundedPct = pct === null ? null : Math.round(pct);
  const flat = diff === 0;
  const up = diff > 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  const tone = flat ? 'text-slate-500' : up ? 'text-rose-600' : 'text-emerald-700';
  const sign = up ? '+' : flat ? '' : '−';
  return (
    <span className={`inline-flex items-center gap-1 font-bold tabular-nums whitespace-nowrap ${tone}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      {roundedPct !== null && (
        <>
          <span>
            {roundedPct > 0 ? '+' : ''}
            {roundedPct}%
          </span>
          <span className="opacity-50" aria-hidden>
            ·
          </span>
        </>
      )}
      <span>
        {sign}
        {formatCompactVND(Math.abs(diff))}
      </span>
    </span>
  );
}

/**
 * 1 cột của biểu đồ (Lương hoặc Chi tiêu): mỗi tháng 1 thanh ngang + số tiền + chênh lệch so với tháng trước.
 * Mỗi cột dùng thang riêng (lương lớn hơn chi tiêu nhiều lần, chung thang thì thanh chi tiêu gần như biến mất).
 */
function SeriesPanel({ series, field, total, rows, selectedMonth, onSelectMonth }) {
  const max = Math.max(1, ...rows.map((m) => m[field]));
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2 px-2">
        <h3 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
          <span className={`w-2.5 h-2.5 rounded-sm ${series.swatch}`} aria-hidden />
          {series.label}
        </h3>
        <span className="text-[11px] text-slate-500 tabular-nums">
          Cả năm <strong className="text-slate-800">{formatVND(total)}</strong>
        </span>
      </div>

      <ul className="mt-2 space-y-1">
        {rows.map((m, i) => {
          const prev = i > 0 ? rows[i - 1] : null;
          const value = m[field];
          const isSelected = m.monthKey === selectedMonth;
          return (
            <li key={m.monthKey}>
              <button
                type="button"
                onClick={() => onSelectMonth(m.monthKey)}
                aria-pressed={isSelected}
                aria-label={`${series.label} ${formatMonthLabel(m.monthKey)}: ${formatVND(value)}${
                  prev?.hasData ? `, tháng trước ${formatVND(prev[field])}` : ''
                }`}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 rounded-xl text-left cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'hover:bg-slate-50 active:bg-slate-50'
                }`}
              >
                <span
                  className={`w-8 shrink-0 text-xs tabular-nums ${isSelected ? 'font-black text-emerald-700' : 'font-bold text-slate-600'}`}
                >
                  T{m.month}
                </span>
                <span className="flex-1 min-w-0 h-4 rounded-[4px] bg-slate-100" aria-hidden>
                  {value > 0 && (
                    <span
                      className={`block h-full rounded-[4px] ${series.bar}`}
                      style={{ width: `${(value / max) * 100}%`, minWidth: 3 }}
                    />
                  )}
                </span>
                <span className="w-28 shrink-0 text-right leading-tight">
                  <span className="block text-xs font-extrabold text-slate-900 tabular-nums">
                    {m.hasData ? formatCompactVND(value) : '—'}
                    {m.isCurrent && <span className="ml-1 text-[9px] font-bold text-amber-600 align-middle">đang chạy</span>}
                  </span>
                  <span className="block text-[10px] mt-0.5">
                    <Delta current={value} previous={prev?.hasData && m.hasData ? prev[field] : null} />
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Biểu đồ 2 cột Lương | Chi tiêu (điện thoại: xếp dọc). Hiện từ tháng đầu tới tháng cuối có dữ liệu. */
function MonthlyChart({ months, totals, selectedMonth, onSelectMonth }) {
  const firstIdx = months.findIndex((m) => m.hasData);
  const lastIdx = months.length - 1 - [...months].reverse().findIndex((m) => m.hasData);
  const rows = firstIdx === -1 ? [] : months.slice(firstIdx, lastIdx + 1);
  const panelProps = { rows, selectedMonth, onSelectMonth };

  return (
    <section className={`${cardClass} p-2 sm:p-3`} aria-labelledby="monthly-chart-title">
      <h2 id="monthly-chart-title" className="px-2 pt-1 text-sm font-extrabold text-slate-900">
        Lương & chi tiêu theo tháng
      </h2>
      <p className="px-2 text-[11px] text-slate-500">Chênh lệch so với tháng trước: % và số tiền. Đỏ = tăng, xanh = giảm.</p>

      <div className="mt-3 grid gap-4 sm:gap-3 md:grid-cols-2 md:divide-x md:divide-slate-100">
        <SeriesPanel series={SERIES.salary} field="salary" total={totals.salary} {...panelProps} />
        <div className="md:pl-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <SeriesPanel series={SERIES.expenses} field="expenses" total={totals.expenses} {...panelProps} />
        </div>
      </div>

      <p className="mt-2 px-2 pb-1 text-[11px] text-slate-400">Bấm vào 1 tháng để chọn tháng đó cho các tab khác.</p>
    </section>
  );
}

/* --------------------------- Danh sách thanh ngang --------------------------- */

function BarList({ title, items, emptyText, barClass }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <section className={`${cardClass} p-3 sm:p-4 flex flex-col`}>
      <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center">{emptyText}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-2.5">
              {item.leading}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 truncate">{item.label}</span>
                  <span className="text-xs font-extrabold text-slate-900 tabular-nums whitespace-nowrap">{formatVND(item.value)}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full ${barClass}`} style={{ width: `${(item.value / max) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 tabular-nums whitespace-nowrap w-16 text-right">{item.note}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ------------------------------ Bảng theo tháng ------------------------------ */

function MonthlyTable({ months, totals, selectedMonth, onSelectMonth }) {
  const rows = months.filter((m) => m.hasData);
  if (rows.length === 0) return null;
  const th = 'px-3 py-2 text-[11px] font-bold text-slate-500 whitespace-nowrap';
  const td = 'px-3 py-2.5 text-xs tabular-nums whitespace-nowrap';

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <h2 className="text-sm font-extrabold text-slate-900 px-3 sm:px-4 pt-3 sm:pt-4 pb-2">Chi tiết từng tháng</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-y border-slate-100">
            <tr>
              <th className={`${th} text-left`}>Tháng</th>
              <th className={th}>Công</th>
              <th className={th}>Lương</th>
              <th className={th}>Chi tiêu</th>
              <th className={th}>Tổng</th>
              <th className={th}>Chênh lệch</th>
              <th className={th}>So tháng trước</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((m) => {
              const prev = months[months.indexOf(m) - 1];
              const diff = prev?.hasData ? m.total - prev.total : null;
              return (
                <tr
                  key={m.monthKey}
                  onClick={() => onSelectMonth(m.monthKey)}
                  className={`cursor-pointer hover:bg-slate-50 ${m.monthKey === selectedMonth ? 'bg-emerald-50/60' : ''}`}
                >
                  <td className={`${td} text-left font-bold text-slate-800`}>
                    {formatMonthLabel(m.monthKey)}
                    {m.isCurrent && <span className="ml-1 text-[10px] font-semibold text-amber-600">đang chạy</span>}
                  </td>
                  <td className={`${td} text-slate-600`}>{m.days}</td>
                  <td className={`${td} text-slate-700`}>{formatVND(m.salary)}</td>
                  <td className={`${td} text-slate-700`}>{formatVND(m.expenses)}</td>
                  <td className={`${td} font-extrabold text-slate-900`}>{formatVND(m.total)}</td>
                  <td className={`${td} font-bold ${diff > 0 ? 'text-rose-600' : diff < 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {diff === null ? '—' : `${diff > 0 ? '+' : diff < 0 ? '−' : ''}${formatVND(Math.abs(diff))}`}
                  </td>
                  <td className={td}>
                    <Change value={prev?.hasData ? percentChange(m.total, prev.total) : null} />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-slate-50 border-t border-slate-200">
            <tr>
              <td className={`${td} text-left font-extrabold text-slate-900`}>Cả năm</td>
              <td className={`${td} font-bold text-slate-700`}>{totals.days}</td>
              <td className={`${td} font-bold text-slate-800`}>{formatVND(totals.salary)}</td>
              <td className={`${td} font-bold text-slate-800`}>{formatVND(totals.expenses)}</td>
              <td className={`${td} font-black text-slate-900`}>{formatVND(totals.total)}</td>
              <td className={td} />
              <td className={td} />
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

/* ------------------------------- So sánh theo năm ------------------------------- */

function YearComparison({ years, selectedYear }) {
  const max = Math.max(1, ...years.map((y) => y.total));
  return (
    <section className={`${cardClass} p-3 sm:p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-slate-900">So sánh các năm</h2>
        <Legend />
      </div>
      <ul className="mt-3 space-y-3">
        {years.map((y, i) => {
          const older = years[i + 1];
          return (
            <li key={y.year} className="flex items-center gap-3">
              <span className={`w-10 text-xs tabular-nums ${y.year === selectedYear ? 'font-black text-emerald-700' : 'font-bold text-slate-700'}`}>
                {y.year}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex h-3 gap-[2px]" style={{ width: `${(y.total / max) * 100}%` }}>
                  {y.salary > 0 && <div className={`${SERIES.salary.bar} rounded-l-[4px]`} style={{ flex: `${y.salary} 1 0` }} />}
                  {y.expenses > 0 && <div className={`${SERIES.expenses.bar} rounded-r-[4px]`} style={{ flex: `${y.expenses} 1 0` }} />}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-extrabold text-slate-900 tabular-nums">{formatVND(y.total)}</div>
                <div className="text-[10px]">
                  <Change value={older?.total ? percentChange(y.total, older.total) : null} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ---------------------------------- Trang ---------------------------------- */

/**
 * Tổng quan: lương & chi tiêu của năm đang chọn (năm lấy theo bộ chọn tháng/năm trên header).
 * "Lương" = số tiền lương xưởng trả (thực nhận + đã ứng), không gồm tiền hoàn chi tiêu
 * — khoản đó đã nằm trong "Chi tiêu" nên không bị tính 2 lần.
 */
export default function DashboardTab({ employees, attendance, advances, expenses, selectedMonth, onSelectMonth }) {
  const todayInfo = useTodayInfo();
  const currentMonthKey = todayInfo ? toMonthKey(todayInfo.year, todayInfo.month) : null;
  const { year: selectedYear } = parseMonthKey(selectedMonth);

  const data = useMemo(() => ({ employees, attendance, advances, expenses }), [employees, attendance, advances, expenses]);

  const yearStats = useMemo(
    () => computeYearStats(selectedYear, data, currentMonthKey),
    [selectedYear, data, currentMonthKey]
  );

  const yearSummaries = useMemo(
    () =>
      AVAILABLE_YEARS.map((y) => {
        const { totals } = Number(y) === selectedYear ? yearStats : computeYearStats(Number(y), data, currentMonthKey);
        return { year: Number(y), ...totals };
      }).filter((y) => y.monthCount > 0),
    [yearStats, selectedYear, data, currentMonthKey]
  );

  const { totals, months, expenseGroups } = yearStats;
  const prevYearTotals = yearSummaries.find((y) => y.year === selectedYear - 1);

  if (totals.monthCount === 0) {
    return (
      <div className={`${cardClass} p-10 text-center`}>
        <BarChart3 className="w-8 h-8 mx-auto text-slate-300" />
        <p className="mt-2 text-sm font-bold text-slate-700">Năm {selectedYear} chưa có dữ liệu</p>
        <p className="text-xs text-slate-500 mt-1">Chọn năm khác ở bộ chọn tháng/năm phía trên.</p>
      </div>
    );
  }

  const expenseShare = totals.total ? Math.round((totals.expenses / totals.total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
        <StatTile
          label={`Tổng chi năm ${selectedYear}`}
          value={formatVND(totals.total)}
          sub={
            prevYearTotals ? (
              <span className="inline-flex items-center gap-1">
                <Change value={percentChange(totals.total, prevYearTotals.total)} /> so với {selectedYear - 1}
              </span>
            ) : (
              `${totals.monthCount} tháng có dữ liệu`
            )
          }
        />
        <StatTile label="Trung bình / tháng" value={formatVND(totals.avgPerMonth)} sub={`${totals.days} công cả năm`} />
        <StatTile
          label="Lương"
          accent={SERIES.salary.swatch}
          value={formatVND(totals.salary)}
          sub={`${100 - expenseShare}% tổng chi`}
        />
        <StatTile
          label="Chi tiêu"
          accent={SERIES.expenses.swatch}
          value={formatVND(totals.expenses)}
          sub={`${expenseShare}% tổng chi`}
        />
      </div>

      <MonthlyChart months={months} totals={totals} selectedMonth={selectedMonth} onSelectMonth={onSelectMonth} />

      <BarList
        title={`Chi tiêu năm ${selectedYear}`}
        barClass={SERIES.expenses.bar}
        emptyText="Chưa có khoản chi nào trong năm."
        items={
          totals.expenses > 0
            ? expenseGroups.map((g) => {
                const { Icon, className } = g.key === 'fuel' ? CATEGORY_STYLE[FUEL_CATEGORY] : DEFAULT_CATEGORY_STYLE;
                return {
                  key: g.key,
                  label: g.label,
                  value: g.amount,
                  note: `${Math.round((g.amount / totals.expenses) * 100)}%`,
                  leading: (
                    <span className={`p-1.5 rounded-lg shrink-0 ${className}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  ),
                };
              })
            : []
        }
      />

      <MonthlyTable months={months} totals={totals} selectedMonth={selectedMonth} onSelectMonth={onSelectMonth} />

      {yearSummaries.length > 1 && <YearComparison years={yearSummaries} selectedYear={selectedYear} />}
    </div>
  );
}
