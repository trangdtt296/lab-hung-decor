'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCheck } from 'lucide-react';
import { formatVND, compareWithToday, toMonthKey } from '../../lib/payroll';
import { useTodayInfo } from '../../hooks/useTodayInfo';
import EditPastAttendanceModal from '../modals/EditPastAttendanceModal';
import EmployeeAvatar from '../common/EmployeeAvatar';
import { AttendanceCalendar, AttendanceDayCell, AttendanceLegend } from '../attendance/AttendanceUI';

export default function AttendanceTab({
  monthPayrollSummary,
  currentMonthDays,
  calendarCells,
  selectedMonthDisplayLabel,
  selectedMonth,
  onToggleAttendance,
  onSetAttendanceValue,
  onQuickMarkAllToday,
}) {
  const todayInfo = useTodayInfo();
  const [expandedEmpId, setExpandedEmpId] = useState(monthPayrollSummary[0]?.employee?.id ?? null);
  const [editingPastTarget, setEditingPastTarget] = useState(null);

  const isCurrentMonth = todayInfo && toMonthKey(todayInfo.year, todayInfo.month) === selectedMonth;

  /** Hôm nay: bấm để xoay vòng công. Ngày đã qua: mở popup xác nhận để tránh bấm nhầm. */
  const handleSelectDay = (emp, day, weekday, currentValue) => {
    const relation = compareWithToday(day, selectedMonth, todayInfo);
    if (relation === 1 || relation === null) return;
    if (relation === 0) {
      onToggleAttendance(emp.id, day);
      return;
    }
    const [year, month] = selectedMonth.split('-');
    setEditingPastTarget({
      employee: emp,
      day,
      currentValue,
      dateStr: `${String(day).padStart(2, '0')}/${month}/${year}`,
      weekday,
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            Chấm công {selectedMonthDisplayLabel}{' '}
            <span className="font-semibold text-slate-400">({currentMonthDays.length} ngày)</span>
          </h2>
          <AttendanceLegend showEditHints />
        </div>
        {isCurrentMonth && (
          <button
            type="button"
            onClick={() => onQuickMarkAllToday(todayInfo.day)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
          >
            <CheckCheck className="w-4 h-4" />
            Chấm đủ hôm nay cho cả xưởng
          </button>
        )}
      </div>

      {/* Mobile: thẻ thu gọn, mở ra lịch 7 cột */}
      <div className="md:hidden flex flex-col gap-2.5">
        {monthPayrollSummary.map((row) => {
          const emp = row.employee;
          const isExpanded = expandedEmpId === emp.id;
          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                aria-expanded={isExpanded}
                className="w-full p-3.5 flex items-center justify-between gap-2 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <EmployeeAvatar name={emp.name} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-slate-900 truncate">{emp.name}</div>
                    <div className="text-[11px] text-slate-500 tabular-nums">
                      <strong className="text-emerald-700">{row.totalDays} công</strong> · Thực nhận{' '}
                      <strong className="text-slate-800">{formatVND(row.netSalary)}</strong>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3.5 pt-2.5 border-t border-slate-100">
                  <AttendanceCalendar
                    cells={calendarCells}
                    attendanceMap={row.attendanceMap}
                    monthKey={selectedMonth}
                    todayInfo={todayInfo}
                    onSelectDay={(cell, val) => handleSelectDay(emp, cell.day, cell.weekday, val)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop: ma trận nhân viên × ngày giống file Excel, cuộn ngang trong khung */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-10 bg-slate-50 text-left px-3 py-2 font-bold text-slate-600 border-b border-r border-slate-200 min-w-44">
                  Nhân viên
                </th>
                {currentMonthDays.map((d) => {
                  const isTodayCol = compareWithToday(d.day, selectedMonth, todayInfo) === 0;
                  return (
                    <th
                      key={d.day}
                      className={`px-0.5 py-1.5 border-b border-slate-200 font-bold tabular-nums min-w-8 ${
                        isTodayCol ? 'bg-emerald-100 text-emerald-900' : d.isSunday ? 'text-rose-500' : 'text-slate-500'
                      }`}
                    >
                      <div className="leading-none">{d.day}</div>
                      <div className="text-[10px] font-semibold opacity-70 mt-0.5">{d.weekday}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {monthPayrollSummary.map((row) => {
                const emp = row.employee;
                return (
                  <tr key={emp.id} className="group">
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 px-3 py-1.5 border-b border-r border-slate-100">
                      <div className="flex items-center gap-2">
                        <EmployeeAvatar name={emp.name} size="xs" />
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-900 truncate">{emp.name}</div>
                          <div className="text-[11px] tabular-nums whitespace-nowrap">
                            <strong className="text-emerald-700">{row.totalDays} công</strong>
                            <span className="text-slate-400"> · </span>
                            <strong className="text-slate-700">{formatVND(row.netSalary)}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    {currentMonthDays.map((d) => (
                      <td key={d.day} className="p-0.5 border-b border-slate-100 group-hover:bg-slate-50">
                        <AttendanceDayCell
                          compact
                          day={d.day}
                          weekday={d.weekday}
                          value={row.attendanceMap[d.day] || 0}
                          monthKey={selectedMonth}
                          todayInfo={todayInfo}
                          onSelect={() => handleSelectDay(emp, d.day, d.weekday, row.attendanceMap[d.day] || 0)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <EditPastAttendanceModal
        isOpen={Boolean(editingPastTarget)}
        onClose={() => setEditingPastTarget(null)}
        target={editingPastTarget}
        onConfirm={onSetAttendanceValue}
      />
    </div>
  );
}
