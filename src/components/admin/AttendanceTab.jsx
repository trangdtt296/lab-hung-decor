'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { formatVND } from '../../lib/payroll';

export default function AttendanceTab({
  monthPayrollSummary,
  currentMonthDays,
  calendarCells,
  selectedMonthDisplayLabel,
  selectedMonth,
  standardWorkDays,
  onToggleAttendance,
  onQuickMarkSingleEmployee,
  onQuickMarkAllToday,
}) {
  const [expandedEmpId, setExpandedEmpId] = useState(monthPayrollSummary[0]?.employee?.id || 'thuy');

  return (
    <div className="space-y-3.5">
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            Chấm công {selectedMonthDisplayLabel} ({currentMonthDays.length} ngày)
          </h2>
          <p className="text-xs text-slate-500">
            Lương 1 ngày = Lương CB ÷ {standardWorkDays}. Chạm ô ngày để đổi{' '}
            <strong>+</strong> (1 công) / <strong>-</strong> (0.5 công).
          </p>
        </div>

        <button
          type="button"
          onClick={onQuickMarkAllToday}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 whitespace-nowrap cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 shrink-0" />
          <span>+ Ngày {currentMonthDays.length}</span>
        </button>
      </div>

      {/* Chế độ danh sách thẻ thu gọn cho Màn hình điện thoại (Mobile) */}
      <div className="md:hidden flex flex-col gap-3">
          {monthPayrollSummary.map((row) => {
            const emp = row.employee;
            const isExpanded = expandedEmpId === emp.id;

            return (
              <div
                key={emp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
              >
                <div className="p-3.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900">
                          {emp.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold tabular-nums whitespace-nowrap">
                          {row.totalDays} công
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Lương công:{' '}
                        <strong className="text-slate-800 whitespace-nowrap">
                          {formatVND(row.basePayByDays)}
                        </strong>{' '}
                        • Thực nhận:{' '}
                        <strong className="text-emerald-700 whitespace-nowrap">
                          {formatVND(row.netSalary)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onQuickMarkSingleEmployee(emp)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold whitespace-nowrap cursor-pointer"
                    >
                      + Ngày {currentMonthDays.length}
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                      aria-label="Thu gọn hoặc mở rộng lịch chấm công"
                      className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-slate-100">
                    <div className="grid grid-cols-7 gap-1 text-center mb-1.5 pt-2">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((w, idx) => (
                        <div
                          key={w}
                          className={`text-[11px] font-bold ${
                            idx === 6 ? 'text-rose-500' : 'text-slate-400'
                          }`}
                        >
                          {w}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarCells.map((cell, idx) => {
                        if (!cell) {
                          return (
                            <div
                              key={`m-empty-${emp.id}-${idx}`}
                              className="py-3"
                            />
                          );
                        }
                        const val = row.attendanceMap[cell.day] || 0;
                        return (
                          <button
                            key={cell.day}
                            type="button"
                            onClick={() => onToggleAttendance(emp.id, cell.day)}
                            className={`py-2 rounded-xl flex flex-col items-center justify-center border transition-all active:scale-95 cursor-pointer ${
                              val === 1
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                                : val === 0.5
                                ? 'bg-amber-50 border-amber-300 text-amber-950'
                                : 'bg-slate-50 border-slate-200/70 text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-[11px] font-bold leading-none tabular-nums">
                              {cell.day}
                            </span>
                            <span
                              className={`mt-1 text-[10px] font-black leading-none px-1.5 py-0.5 rounded-full ${
                                val === 1
                                  ? 'bg-emerald-500 text-white'
                                  : val === 0.5
                                  ? 'bg-amber-400 text-slate-900'
                                  : 'text-slate-300'
                              }`}
                            >
                              {val === 1 ? '+' : val === 0.5 ? '-' : '•'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chế độ bảng lưới ma trận cho Màn hình máy tính (Desktop) */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>
              Nhấp vào từng ô ngày để chuyển giữa <strong>+</strong> (1 công),{' '}
              <strong>-</strong> (0.5 công) và trống.
            </span>
            <span className="font-semibold text-slate-700">
              {currentMonthDays.length} ngày trong {selectedMonthDisplayLabel}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {monthPayrollSummary.map((row) => {
              const emp = row.employee;
              return (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/40 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                        {emp.name.slice(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <span className="text-sm font-extrabold text-slate-900">
                          {emp.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {emp.roleLabel} • CB: {formatVND(row.baseSalary)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold tabular-nums">
                        Tổng: {row.totalDays} công
                      </span>
                      <span className="text-xs font-bold text-slate-700 tabular-nums">
                        Công: {formatVND(row.basePayByDays)}
                      </span>
                      <span className="text-xs font-extrabold text-emerald-700 tabular-nums">
                        Thực nhận: {formatVND(row.netSalary)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onQuickMarkSingleEmployee(emp)}
                        className="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 text-xs font-bold cursor-pointer"
                      >
                        + Ngày {currentMonthDays.length}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-11 xl:grid-cols-16 gap-1.5">
                    {currentMonthDays.map((d) => {
                      const val = row.attendanceMap[d.day] || 0;
                      return (
                        <button
                          key={d.day}
                          type="button"
                          onClick={() => onToggleAttendance(emp.id, d.day)}
                          title={`Ngày ${d.dateStr} (${d.weekday})`}
                          className={`py-1.5 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                            val === 1
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : val === 0.5
                              ? 'bg-amber-50 border-amber-300 text-amber-950'
                              : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-[10px] font-bold leading-none tabular-nums">
                            {d.day} {d.weekday}
                          </span>
                          <span
                            className={`mt-1 text-[10px] font-black leading-none px-1.5 py-0.5 rounded-full ${
                              val === 1
                                ? 'bg-emerald-500 text-white'
                                : val === 0.5
                                ? 'bg-amber-400 text-slate-900'
                                : 'text-slate-300'
                            }`}
                          >
                            {val === 1 ? '+' : val === 0.5 ? '-' : '•'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
    </div>
  );
}

