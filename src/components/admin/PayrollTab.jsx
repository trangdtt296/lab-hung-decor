'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { formatVND } from '../../lib/payroll';
import EmployeeAvatar from '../common/EmployeeAvatar';
import ConfirmButton from '../common/ConfirmButton';

export default function PayrollTab({
  monthPayrollSummary,
  totalNetPayroll,
  selectedMonthDisplayLabel,
  standardWorkDays,
  copiedEmpId,
  isExportingExcel,
  onOpenExportAllModal,
  onOpenAddStaffModal,
  onCopyLink,
  onExportEmployeeExcel,
  onRegenerateSlug,
  onSaveSalaryEdit,
}) {
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [editingSalaryValue, setEditingSalaryValue] = useState('');

  const handleSaveSalary = (empId) => {
    onSaveSalaryEdit(empId, editingSalaryValue);
    setEditingSalaryId(null);
  };

  return (
    <div className="space-y-3.5">
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-semibold">
            Tổng chi còn lại ({selectedMonthDisplayLabel} • Công chuẩn {standardWorkDays} ngày)
          </div>
          <div className="text-lg sm:text-2xl font-black mt-0.5 tabular-nums whitespace-nowrap">
            {formatVND(totalNetPayroll)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenExportAllModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Xuất Excel</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddStaffModal}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold shrink-0 whitespace-nowrap cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
            <span>Thêm nhân viên</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {monthPayrollSummary.map((row) => {
          const isCopied = copiedEmpId === row.employee.id;
          const overBase = row.basePayByDays > row.baseSalary;

          return (
            <div
              key={row.employee.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <EmployeeAvatar name={row.employee.name} size="md" />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-base font-extrabold text-slate-900 break-words">
                          {row.employee.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold tabular-nums whitespace-nowrap">
                          {row.totalDays} công
                        </span>
                        {overBase && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold whitespace-nowrap">
                            Vượt lương CB
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                      <span>Lương CB:</span>
                      {editingSalaryId === row.employee.id ? (
                        <form
                          className="flex items-center gap-1"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveSalary(row.employee.id);
                          }}
                        >
                          <input
                            type="number"
                            inputMode="numeric"
                            step="100000"
                            value={editingSalaryValue}
                            onChange={(e) => setEditingSalaryValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Escape' && setEditingSalaryId(null)}
                            autoFocus
                            className="w-28 px-2 py-1 rounded-lg border border-emerald-500 text-xs font-bold text-slate-900"
                          />
                          <button
                            type="submit"
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold cursor-pointer"
                          >
                            Lưu
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSalaryId(row.employee.id);
                            setEditingSalaryValue(String(row.baseSalary));
                          }}
                          title={`Sửa lương cơ bản – áp dụng từ ${selectedMonthDisplayLabel} trở đi`}
                          className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-emerald-700 tabular-nums whitespace-nowrap cursor-pointer"
                        >
                          <span>{formatVND(row.baseSalary)}</span>
                          <Edit3 className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 tabular-nums">
                      1 ngày = {formatVND(row.dayRate)}
                    </div>
                  </div>
                </div>

                  <div className="sm:text-right">
                    <div className="text-[10px] font-semibold uppercase text-slate-400">
                      Thực nhận
                    </div>
                    <div className="text-base sm:text-lg font-black text-emerald-700 tabular-nums whitespace-nowrap">
                      {formatVND(row.netSalary)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-3 mt-3 border-t border-slate-100 text-[11px]">
                  <div className="bg-slate-50 px-2.5 py-2 rounded-xl flex items-center justify-between sm:block">
                    <div className="text-slate-400">Lương công</div>
                    <div
                      className={`font-bold tabular-nums whitespace-nowrap ${
                        overBase ? 'text-emerald-700' : 'text-slate-800'
                      }`}
                    >
                      {formatVND(row.basePayByDays)}
                    </div>
                  </div>
                  <div className="bg-amber-50/70 px-2.5 py-2 rounded-xl flex items-center justify-between sm:block">
                    <div className="text-amber-700">Ứng + Ảnh</div>
                    <div className="font-bold text-amber-800 tabular-nums whitespace-nowrap">
                      -{formatVND(row.totalAdvances + row.totalPhotoFee)}
                    </div>
                  </div>
                  <div className="bg-sky-50/70 px-2.5 py-2 rounded-xl flex items-center justify-between sm:block">
                    <div className="text-sky-700">Hoàn chi</div>
                    <div className="font-bold text-sky-800 tabular-nums whitespace-nowrap">
                      +{formatVND(row.totalReimbursements)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onCopyLink(row.employee)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs whitespace-nowrap cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 shrink-0" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isExportingExcel}
                  onClick={() => onExportEmployeeExcel(row.employee)}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold whitespace-nowrap disabled:opacity-60 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất Excel</span>
                </button>

                <a
                  href={`/e/${row.employee.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span>Xem chi tiết</span>
                </a>

                <ConfirmButton
                  onConfirm={() => onRegenerateSlug(row.employee.id)}
                  confirmChildren="Link cũ sẽ mất – chạm lại"
                  confirmClassName="bg-amber-500 text-white hover:bg-amber-600"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold whitespace-nowrap"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>Đổi link</span>
                </ConfirmButton>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

