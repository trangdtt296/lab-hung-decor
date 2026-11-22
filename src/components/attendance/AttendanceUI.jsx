'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { WEEKDAY_HEADERS, compareWithToday } from '../../lib/payroll';

/** Ký hiệu công: + (1 công), - (0.5 công), • (nghỉ) */
export function AttendanceMark({ value, className = '' }) {
  if (value === 1) {
    return (
      <span className={`w-4 h-4 rounded-[4px] bg-emerald-500 text-white inline-flex items-center justify-center font-black text-xs leading-none ${className}`}>
        +
      </span>
    );
  }
  if (value === 0.5) {
    return (
      <span className={`w-4 h-4 rounded-[4px] bg-amber-400 text-slate-950 inline-flex items-center justify-center font-black text-xs leading-none ${className}`}>
        -
      </span>
    );
  }
  return (
    <span className={`w-4 h-4 inline-flex items-center justify-center text-slate-300 text-xs font-bold ${className}`}>•</span>
  );
}

export function AttendanceLegend({ showEditHints = false }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600">
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <AttendanceMark value={1} /> 1 công
      </span>
      <span className="inline-flex items-center gap-1.5 font-semibold">
        <AttendanceMark value={0.5} /> 0.5 công
      </span>
      {showEditHints && (
        <>
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 font-semibold">
            <Lock className="w-3 h-3 text-amber-600" /> Ngày đã qua: bấm để sửa
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80 font-medium">
            Ngày tương lai: khoá
          </span>
        </>
      )}
    </div>
  );
}

const VALUE_STYLES = {
  1: 'bg-emerald-50 border-emerald-300 text-emerald-950',
  0.5: 'bg-amber-50 border-amber-300 text-amber-950',
  0: 'bg-white border-slate-200 text-slate-400',
};

/**
 * 1 ô ngày chấm công. Khi có `onSelect` thì là nút bấm (admin), ngược lại chỉ hiển thị (nhân viên).
 * Ngày tương lai bị khoá, ngày quá khứ có icon khoá nhỏ, hôm nay có viền nổi bật.
 */
export function AttendanceDayCell({ day, weekday, value = 0, monthKey, todayInfo, showWeekday = false, compact = false, onSelect }) {
  const relation = compareWithToday(day, monthKey, todayInfo);
  const isPast = relation === -1;
  const isToday = relation === 0;
  const isFuture = relation === 1;
  const interactive = Boolean(onSelect) && !isFuture;

  const label = `Ngày ${day}${weekday ? ` (${weekday})` : ''}`;
  const hint = !onSelect ? '' : isFuture ? ' – chưa tới ngày' : isPast ? ' – bấm để sửa' : ' – bấm để đổi công';

  const className = [
    compact
      ? 'w-full h-9 rounded-lg border flex items-center justify-center transition select-none'
      : 'min-h-11 py-1.5 px-0.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition select-none',
    isFuture && onSelect ? 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed' : VALUE_STYLES[value] || VALUE_STYLES[0],
    isToday ? 'ring-2 ring-emerald-500 ring-offset-1 font-black' : '',
    interactive ? 'cursor-pointer hover:brightness-95 active:scale-95' : '',
  ].join(' ');

  const content = compact ? (
    <AttendanceMark value={value} />
  ) : (
    <>
      <span className="text-[11px] font-bold leading-none tabular-nums inline-flex items-center gap-0.5 whitespace-nowrap">
        {day}
        {showWeekday && <span className="font-semibold opacity-70">{weekday}</span>}
        {isPast && onSelect && <Lock className="w-2.5 h-2.5 opacity-50" aria-hidden />}
      </span>
      <AttendanceMark value={value} />
    </>
  );

  if (!onSelect) {
    return (
      <div className={className} title={label}>
        {content}
      </div>
    );
  }

  return (
    <button type="button" disabled={isFuture} onClick={onSelect} title={label + hint} aria-label={label + hint} className={className}>
      {content}
    </button>
  );
}

/**
 * Lịch tháng dạng lưới 7 cột (T2 → CN) — dùng cho mobile admin & trang nhân viên.
 * @param cells mảng từ buildCalendarCells (null = ô trống đầu tháng)
 */
export function AttendanceCalendar({ cells, attendanceMap, monthKey, todayInfo, onSelectDay }) {
  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
        {WEEKDAY_HEADERS.map((w, idx) => (
          <div key={w} className={`text-[11px] font-bold ${idx === 6 ? 'text-rose-500' : 'text-slate-400'}`}>
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((cell, idx) =>
          cell ? (
            <AttendanceDayCell
              key={cell.day}
              day={cell.day}
              weekday={cell.weekday}
              value={attendanceMap[cell.day] || 0}
              monthKey={monthKey}
              todayInfo={todayInfo}
              onSelect={onSelectDay ? () => onSelectDay(cell, attendanceMap[cell.day] || 0) : undefined}
            />
          ) : (
            <div key={`empty-${idx}`} />
          )
        )}
      </div>
    </div>
  );
}
