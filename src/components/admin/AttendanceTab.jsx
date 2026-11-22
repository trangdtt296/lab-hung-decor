'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCheck, UserMinus, UserPlus } from 'lucide-react';
import { formatVND, compareWithToday, toMonthKey } from '../../lib/payroll';
import { useTodayInfo } from '../../hooks/useTodayInfo';
import EditPastAttendanceModal from '../modals/EditPastAttendanceModal';
import EmployeeAvatar from '../common/EmployeeAvatar';
import LeaveEmployeeModal from '../modals/LeaveEmployeeModal';
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
  onOpenAddEmployee,
  onMarkEmployeeLeft,
}) {
  const todayInfo = useTodayInfo();
  const [expandedEmpId, setExpandedEmpId] = useState(monthPayrollSummary[0]?.employee?.id ?? null);
  const [editingPastTarget, setEditingPastTarget] = useState(null);
  const [leavingEmployee, setLeavingEmployee] = useState(null);

  const currentMonthKey = todayInfo ? toMonthKey(todayInfo.year, todayInfo.month) : null;
  const isCurrentMonth = currentMonthKey === selectedMonth;
  const isFutureMonth = Boolean(currentMonthKey) && selectedMonth > currentMonthKey;

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

  /**
   * Nút "Cho nghỉ việc": chỉ hiện với nhân viên đang làm và CHƯA có ngày công nào trong tháng
   * (tính tới hôm nay). Người đã có công thì giữ trong bảng để tính lương tháng này.
   */
  const canLeave = (row) => row.employee.active !== false && row.totalDays === 0;
  const leaveButton = (emp, label = 'Cho nghỉ việc') => (
    <button
      type="button"
      onClick={() => setLeavingEmployee(emp)}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold whitespace-nowrap cursor-pointer shrink-0"
    >
      <UserMinus className="w-3.5 h-3.5" />
      {label}
    </button>
  );
  const leftBadge = (
    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-1.5 py-0.5 shrink-0">
      Đã nghỉ
    </span>
  );

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
        <div className="flex flex-wrap items-center gap-2">
          {/* Chỉ thêm nhân viên ở tháng hiện tại (tháng cũ đã chốt, tháng sau chưa tới) */}
          {isCurrentMonth && (
          <button
            type="button"
            onClick={onOpenAddEmployee}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs cursor-pointer whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            Thêm nhân viên
          </button>
          )}
          {isCurrentMonth && monthPayrollSummary.length > 0 && (
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
      </div>

      {monthPayrollSummary.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-500 border border-slate-200">
          {isFutureMonth ? (
            <>
              {selectedMonthDisplayLabel} chưa bắt đầu. Danh sách nhân viên sẽ tự có từ ngày{' '}
              <strong>1/{Number(selectedMonth.slice(5))}</strong>.
            </>
          ) : (
            <>Chưa có nhân viên nào trong {selectedMonthDisplayLabel}.</>
          )}
          {isCurrentMonth && (
            <>
              {' '}Bấm <strong>Thêm nhân viên</strong> để bắt đầu chấm công.
            </>
          )}
        </div>
      )}

      {/* Mobile: thẻ thu gọn, mở ra lịch 7 cột */}
      <div className="md:hidden flex flex-col gap-2.5">
        {monthPayrollSummary.map((row) => {
          const emp = row.employee;
          const isExpanded = expandedEmpId === emp.id;
          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="flex items-center gap-2 pr-3">
              <button
                type="button"
                onClick={() => setExpandedEmpId(isExpanded ? null : emp.id)}
                aria-expanded={isExpanded}
                className="flex-1 min-w-0 p-3.5 flex items-center justify-between gap-2 text-left cursor-pointer"
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
                {canLeave(row) && leaveButton(emp, 'Cho nghỉ')}
                {emp.active === false && leftBadge}
              </div>

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
      <div className={`${monthPayrollSummary.length ? 'md:block' : ''} hidden bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden`}>
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
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-slate-900 truncate">{emp.name}</div>
                          <div className="text-[11px] tabular-nums whitespace-nowrap">
                            <strong className="text-emerald-700">{row.totalDays} công</strong>
                            <span className="text-slate-400"> · </span>
                            <strong className="text-slate-700">{formatVND(row.netSalary)}</strong>
                          </div>
                        </div>
                        {canLeave(row) && leaveButton(emp, 'Cho nghỉ')}
                        {emp.active === false && leftBadge}
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

      {leavingEmployee && (
        <LeaveEmployeeModal
          employee={leavingEmployee}
          monthLabel={selectedMonthDisplayLabel}
          onClose={() => setLeavingEmployee(null)}
          onConfirm={() => onMarkEmployeeLeft(leavingEmployee.id)}
        />
      )}

      <EditPastAttendanceModal
        isOpen={Boolean(editingPastTarget)}
        onClose={() => setEditingPastTarget(null)}
        target={editingPastTarget}
        onConfirm={onSetAttendanceValue}
      />
    </div>
  );
}
