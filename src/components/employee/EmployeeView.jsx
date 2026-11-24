'use client';

import React from 'react';
import { formatVND, formatMonthLabel, getMonthStatus } from '../../lib/payroll';
import { useTodayInfo } from '../../hooks/useTodayInfo';
import { AttendanceCalendar, AttendanceLegend } from '../attendance/AttendanceUI';

const TONES = {
  amber: { title: 'text-amber-700', row: 'bg-amber-50/80 border-amber-200/70', strong: 'text-amber-950', text: 'text-amber-900', amount: 'text-amber-800' },
  rose: { title: 'text-rose-700', row: 'bg-rose-50/80 border-rose-200/70', strong: 'text-rose-950', text: 'text-rose-900', amount: 'text-rose-800' },
  sky: { title: 'text-sky-700', row: 'bg-sky-50/80 border-sky-200/70', strong: 'text-sky-950', text: 'text-sky-900', amount: 'text-sky-800' },
};

/** Danh sách khoản cộng/trừ (ứng lương, tiền ảnh, hoàn chi) */
function LineItems({ title, items, tone, sign, describe }) {
  if (!items.length) return null;
  const t = TONES[tone];
  return (
    <div className="space-y-1.5">
      <div className={`text-[11px] font-bold uppercase tracking-wider ${t.title}`}>{title}</div>
      {items.map((item) => (
        <div key={item.id} className={`flex items-start justify-between gap-3 text-xs px-3 py-2.5 rounded-xl border ${t.row}`}>
          <div className="min-w-0 break-words leading-relaxed">
            <span className={`font-bold ${t.strong}`}>{describe(item)}:</span> <span className={t.text}>{item.note}</span>
          </div>
          <span className={`font-extrabold tabular-nums whitespace-nowrap ${t.amount}`}>
            {sign}
            {formatVND(item.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatTile({ label, children }) {
  return (
    <div className="bg-white/10 rounded-2xl px-3.5 py-2.5 flex items-center justify-between gap-2 sm:block">
      <div className="text-[11px] text-slate-300">{label}</div>
      <div className="text-base font-extrabold sm:mt-0.5 tabular-nums whitespace-nowrap">{children}</div>
    </div>
  );
}

function PayrollDetail({ payroll, monthLabel, standardWorkDays }) {
  return (
    <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs space-y-3">
      <h2 className="text-sm font-extrabold text-slate-900">Chi tiết tính lương {monthLabel}</h2>

      <div className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/70">
        <div className="min-w-0 space-y-0.5">
          <div className="text-xs font-bold text-slate-800">Lương theo ngày công ({payroll.totalDays} công)</div>
          <div className="text-[11px] text-slate-500 tabular-nums break-words">
            ({formatVND(payroll.baseSalary)} ÷ {standardWorkDays}) × {payroll.totalDays}
          </div>
        </div>
        <span className="text-sm font-black text-slate-900 tabular-nums whitespace-nowrap">
          {formatVND(payroll.basePayByDays)}
        </span>
      </div>

      <LineItems title="Khấu trừ ứng lương" items={payroll.empAdvances} tone="amber" sign="-" describe={(x) => x.date} />
      <LineItems title="Khấu trừ tiền ảnh" items={payroll.empPhotoFees} tone="rose" sign="-" describe={(x) => x.date} />
      <LineItems title="Khoản trừ khác" items={payroll.empOtherDeductions} tone="rose" sign="-" describe={(x) => x.date} />
      <LineItems
        title="Cộng chi tiêu đã chi hộ xưởng"
        items={payroll.empReimbursements}
        tone="sky"
        sign="+"
        describe={(x) => `${x.date} (${x.category})`}
      />

      <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold text-slate-900">
          Tổng thực nhận <span className="block text-[11px] font-medium text-slate-400">Đã làm tròn đến nghìn đồng</span>
        </span>
        <span className="text-lg sm:text-xl font-black text-emerald-700 tabular-nums whitespace-nowrap">
          {formatVND(payroll.netSalary)}
        </span>
      </div>
    </section>
  );
}

export default function EmployeeView({ payroll, selectedMonth, currentMonthDays, calendarCells, standardWorkDays }) {
  const todayInfo = useTodayInfo();
  const monthLabel = formatMonthLabel(selectedMonth);
  const isExceedingBase = payroll.basePayByDays > payroll.baseSalary;
  const status = getMonthStatus(selectedMonth, todayInfo);

  return (
    <div className="space-y-4">
      {/* Thẻ lương thực nhận */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Lương thực nhận • {monthLabel}
          </span>
          {status && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/25">
              {status}
            </span>
          )}
        </div>

        <div className="text-3xl sm:text-4xl font-black mt-2 tracking-tight tabular-nums break-words">
          {formatVND(payroll.netSalary)}
        </div>

        {isExceedingBase && (
          <p className="mt-2 inline-block px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
            Làm {payroll.totalDays} công (chuẩn {standardWorkDays}) nên lương theo công {formatVND(payroll.basePayByDays)} cao hơn
            lương CB
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-white/10">
          <StatTile label={`Tổng công (chuẩn ${standardWorkDays})`}>
            {payroll.totalDays} <span className="text-xs font-normal text-slate-300">/ {currentMonthDays.length} ngày</span>
          </StatTile>
          <StatTile label={`Lương CB (1 công = ${formatVND(payroll.dayRate)})`}>
            <span className="text-emerald-300">{formatVND(payroll.baseSalary)}</span>
          </StatTile>
        </div>
      </section>

      {/* Lịch chấm công (chỉ xem) */}
      <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-extrabold text-slate-900">Bảng chấm công {monthLabel}</h2>
          <AttendanceLegend />
        </div>
        <AttendanceCalendar
          cells={calendarCells}
          attendanceMap={payroll.attendanceMap}
          monthKey={selectedMonth}
          todayInfo={todayInfo}
        />
      </section>

      {/* Chi tiết tính lương */}
      <PayrollDetail payroll={payroll} monthLabel={monthLabel} standardWorkDays={standardWorkDays} />
    </div>
  );
}
