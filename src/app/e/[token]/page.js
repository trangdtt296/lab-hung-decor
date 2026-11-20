'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, FileSpreadsheet } from 'lucide-react';
import { usePayrollData } from '../../../hooks/usePayrollData';
import EmployeeView from '../../../components/employee/EmployeeView';
import Toast from '../../../components/common/Toast';
import YearMonthSelectGroup from '../../../components/common/YearMonthSelectGroup';

function EmployeeContent({ params }) {
  const resolvedParams = use(params);
  const token = resolvedParams?.token;

  const {
    employees,
    selectedMonth,
    setSelectedMonth,
    currentMonthDays,
    calendarCells,
    STANDARD_WORK_DAYS,
    copiedEmpId,
    isExportingExcel,
    copyEmployeeLink,
    handleExportEmployee,
    calculatePayroll,
    toast,
  } = usePayrollData();

  const employee = employees.find(
    (e) => e.slug.toLowerCase() === (token || '').toLowerCase()
  );

  const payroll = employee ? calculatePayroll(employee, selectedMonth) : null;
  const isCopied = employee && copiedEmpId === employee.id;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 flex flex-col">
      <Toast message={toast} />

      {/* HEADER CỐ ĐỊNH Ở ĐỈNH TRANG (STICKY TOP-0) - NỀN SLATE-900 SANG TRỌNG */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-500/20">
              LH
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight block">
                  {employee ? employee.name : 'Lab Hung Decor'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-bold">
                  Chỉ xem
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                Lab Hung Decor • {employee?.roleLabel || 'Bảng công & Lương'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <YearMonthSelectGroup
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
              theme="dark"
            />

            {employee && (
              <>
                <button
                  type="button"
                  onClick={() => copyEmployeeLink(employee)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white shrink-0 whitespace-nowrap cursor-pointer transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Đã copy!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isExportingExcel}
                  onClick={() => handleExportEmployee(employee)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs shrink-0 whitespace-nowrap disabled:opacity-60 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất Excel</span>
                </button>
              </>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cổng Admin</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {employee && payroll ? (
          <EmployeeView
            employee={employee}
            payroll={payroll}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            currentMonthDays={currentMonthDays}
            calendarCells={calendarCells}
            standardWorkDays={STANDARD_WORK_DAYS}
            copiedEmpId={copiedEmpId}
            isExportingExcel={isExportingExcel}
            onCopyLink={copyEmployeeLink}
            onExportExcel={handleExportEmployee}
            hideHeaderCard={true}
          />
        ) : (
          <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              !
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-slate-900">
                Không tìm thấy nhân viên
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đường dẫn mã nhân viên <strong>{token}</strong> không tồn tại hoặc đã được Admin đổi link mới. Vui lòng liên hệ Admin để nhận link chính xác.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function EmployeeTokenPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs text-slate-500">
          Đang tải thông tin nhân viên...
        </div>
      }
    >
      <EmployeeContent params={params} />
    </Suspense>
  );
}
