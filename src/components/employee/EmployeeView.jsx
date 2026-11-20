'use client';

import React from 'react';
import { Check, Copy, FileSpreadsheet } from 'lucide-react';
import YearMonthSelectGroup from '../common/YearMonthSelectGroup';
import { formatVND, MONTHS_META } from '../../lib/payroll';

export default function EmployeeView({
  employee,
  payroll,
  selectedMonth,
  onMonthChange,
  currentMonthDays,
  calendarCells,
  standardWorkDays,
  copiedEmpId,
  isExportingExcel,
  onCopyLink,
  onExportExcel,
  hideHeaderCard = false,
}) {
  if (!employee || !payroll) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-slate-500">
        Không tìm thấy thông tin nhân viên hoặc đường dẫn không hợp lệ.
      </div>
    );
  }

  const isCopied = copiedEmpId === employee.id;
  const isExceedingBaseByDays = payroll.basePayByDays > payroll.baseSalary;

  const [yr, mo] = selectedMonth.split('-');
  const selectedMonthDisplay = `Tháng ${Number(mo)}/${yr}`;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Thẻ Header Nhân viên (chỉ hiển thị khi chưa có thanh sticky bar ở trên) */}
      {!hideHeaderCard && (
        <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                {employee.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 break-words">
                    {employee.name}
                  </h1>
                  <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-bold">
                    Chỉ xem
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 break-words">
                  Lab Hung Decor • {employee.roleLabel}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <YearMonthSelectGroup
                selectedMonth={selectedMonth}
                onChange={onMonthChange}
              />
              <button
                type="button"
                onClick={() => onCopyLink(employee)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-800 shrink-0 whitespace-nowrap cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Đã copy!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    <span>Copy link</span>
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isExportingExcel}
                onClick={() => onExportExcel(employee)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 whitespace-nowrap disabled:opacity-60 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span>Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thẻ lương thực nhận */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Lương thực nhận • {selectedMonthDisplay}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/25">
            {MONTHS_META[selectedMonth]?.status || `${currentMonthDays.length} ngày trong tháng`}
          </span>
        </div>

        <div className="text-2xl sm:text-4xl font-black text-white mt-2 tracking-tight tabular-nums break-words">
          {formatVND(payroll.netSalary)}
        </div>

        {isExceedingBaseByDays && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[11px] font-bold">
            <span>
              Lương theo công ({formatVND(payroll.basePayByDays)}) cao hơn lương CB (
              {formatVND(payroll.baseSalary)}) do làm {payroll.totalDays} công (chuẩn{' '}
              {standardWorkDays} công)
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-3.5 border-t border-white/10">
          <div className="bg-white/10 rounded-2xl px-3.5 py-2.5 flex items-center justify-between sm:block">
            <div className="text-[11px] text-slate-300">
              Tổng công thực tế (chuẩn {standardWorkDays} công)
            </div>
            <div className="text-base font-extrabold text-white sm:mt-0.5 tabular-nums whitespace-nowrap">
              {payroll.totalDays}{' '}
              <span className="text-xs font-normal text-slate-300">
                / {currentMonthDays.length} ngày
              </span>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl px-3.5 py-2.5 flex items-center justify-between sm:block">
            <div className="text-[11px] text-slate-300">
              Lương cơ bản (1 công = {formatVND(payroll.dayRate)})
            </div>
            <div className="text-base font-extrabold text-emerald-300 sm:mt-0.5 tabular-nums whitespace-nowrap">
              {formatVND(payroll.baseSalary)}
            </div>
          </div>
        </div>
      </div>

      {/* Lịch chấm công */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-extrabold text-slate-900">
            Bảng chấm công {selectedMonthDisplay}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="w-4 h-4 rounded bg-emerald-500 text-white font-black text-[10px] inline-flex items-center justify-center">
                +
              </span>
              1 công
            </span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <span className="w-4 h-4 rounded bg-amber-400 text-slate-900 font-black text-[10px] inline-flex items-center justify-center">
                -
              </span>
              0.5 công
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
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
            if (!cell) return <div key={`emp-empty-${idx}`} className="py-3" />;
            const val = payroll.attendanceMap[cell.day] || 0;
            return (
              <div
                key={cell.day}
                className={`py-2 rounded-xl flex flex-col items-center justify-center border ${
                  val === 1
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : val === 0.5
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-slate-50/70 border-slate-100 text-slate-400'
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
              </div>
            );
          })}
        </div>
      </div>

      {/* Chi tiết tính lương */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900">
          Chi tiết tính lương {selectedMonthDisplay}
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-800 break-words">
              Lương theo ngày công ({payroll.totalDays} công)
            </div>
            <div className="text-[11px] text-slate-500 tabular-nums break-words">
              ({formatVND(payroll.baseSalary)} ÷ {standardWorkDays}) × {payroll.totalDays} công
            </div>
          </div>
          <span className="text-sm font-black text-slate-900 tabular-nums whitespace-nowrap">
            {formatVND(payroll.basePayByDays)}
          </span>
        </div>

        {payroll.empAdvances.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Khấu trừ ứng lương
            </div>
            {payroll.empAdvances.map((adv) => (
              <div
                key={adv.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs bg-amber-50/80 px-3 py-2.5 rounded-xl border border-amber-200/70"
              >
                <div className="break-words leading-relaxed">
                  <span className="font-bold text-amber-950">{adv.date}:</span>{' '}
                  <span className="text-amber-900">{adv.note}</span>
                </div>
                <span className="font-extrabold text-amber-800 tabular-nums whitespace-nowrap">
                  -{formatVND(adv.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {payroll.empPhotoFees.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Khấu trừ tiền ảnh
            </div>
            {payroll.empPhotoFees.map((pf) => (
              <div
                key={pf.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs bg-rose-50/80 px-3 py-2.5 rounded-xl border border-rose-200/70"
              >
                <div className="break-words leading-relaxed">
                  <span className="font-bold text-rose-950">{pf.date}:</span>{' '}
                  <span className="text-rose-900">{pf.note}</span>
                </div>
                <span className="font-extrabold text-rose-800 tabular-nums whitespace-nowrap">
                  -{formatVND(pf.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {payroll.empReimbursements.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
              Cộng hoàn tiền chi tiêu / mua vật tư
            </div>
            {payroll.empReimbursements.map((exp) => (
              <div
                key={exp.id}
                className="flex flex-wrap items-center justify-between gap-2 text-xs bg-sky-50/80 px-3 py-2.5 rounded-xl border border-sky-200/70"
              >
                <div className="break-words leading-relaxed">
                  <span className="font-bold text-sky-950">
                    {exp.date} ({exp.category}):
                  </span>{' '}
                  <span className="text-sky-900">{exp.note}</span>
                </div>
                <span className="font-extrabold text-sky-800 tabular-nums whitespace-nowrap">
                  +{formatVND(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-extrabold text-slate-900">Tổng thực nhận</span>
          <span className="text-lg sm:text-xl font-black text-emerald-700 tabular-nums whitespace-nowrap">
            {formatVND(payroll.netSalary)}
          </span>
        </div>
      </div>
    </div>
  );
}

