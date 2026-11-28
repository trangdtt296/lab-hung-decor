'use client';

import React, { Suspense, use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Download, FileText, Info } from 'lucide-react';
import { useEmployeePayslip } from '../../../hooks/useEmployeePayslip';
import { formatMonthLabel } from '../../../lib/payroll';
import EmployeeView from '../../../components/employee/EmployeeView';
import EmployeeAvatar from '../../../components/common/EmployeeAvatar';
import Toast from '../../../components/common/Toast';
import LoadingScreen from '../../../components/common/LoadingScreen';
import AppHeader, { BrandLogo, HeaderButton } from '../../../components/common/AppHeader';
import ExportAllModal from '../../../components/modals/ExportAllModal';

function NotFound({ token }) {
  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
        !
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-extrabold text-slate-900">Không tìm thấy nhân viên</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Link <strong className="break-all">{token}</strong> không tồn tại hoặc đã được Admin đổi link mới. Vui lòng liên hệ
          Admin để nhận link chính xác.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Về trang chủ
      </Link>
    </div>
  );
}

export default function EmployeeTokenPage({ params }) {
  // cacheComponents: params động phải được đọc bên trong Suspense
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-slate-100 flex items-center justify-center text-xs text-slate-500">
          Đang tải thông tin nhân viên...
        </div>
      }
    >
      <EmployeeContent params={params} />
    </Suspense>
  );
}

function LoadError() {
  return (
    <div role="alert" className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border border-rose-200 text-center space-y-2">
      <h2 className="text-base font-extrabold text-rose-700">Không tải được bảng lương</h2>
      <p className="text-xs text-slate-500">Kiểm tra kết nối mạng rồi tải lại trang.</p>
    </div>
  );
}

function EmployeeContent({ params }) {
  const { token = '' } = use(params);
  const {
    status,
    employee,
    payroll,
    selectedMonth,
    setSelectedMonth,
    currentMonthDays,
    calendarCells,
    standardWorkDays,
    toast,
    isCopied,
    isExportingExcel,
    yearMonthKeys,
    copyLink,
    exportPayslip,
  } = useEmployeePayslip(token);
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-800 flex flex-col">
      <Toast toast={toast} />

      <AppHeader
        leading={employee ? <EmployeeAvatar name={employee.name} size="md" /> : undefined}
        title={employee ? employee.name : 'Lab Hung Decor'}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        actions={
          employee && (
            <>
              <HeaderButton
                variant="ghost"
                icon={isCopied ? Check : Copy}
                label={isCopied ? 'Đã copy!' : 'Copy link'}
                onClick={copyLink}
              />
              <HeaderButton icon={Download} label="Xuất phiếu lương" disabled={isExportingExcel} onClick={() => setIsExportOpen(true)} />
            </>
          )
        }
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {status === 'loading' && <LoadingScreen fullScreen={false} message="Đang tải bảng lương..." />}
        {status === 'not_found' && <NotFound token={token} />}
        {status === 'error' && <LoadError />}
        {status === 'ready' && payroll && (
          <EmployeeView
            payroll={payroll}
            selectedMonth={selectedMonth}
            currentMonthDays={currentMonthDays}
            calendarCells={calendarCells}
            standardWorkDays={standardWorkDays}
          />
        )}
      </main>

      {isExportOpen && employee && (
        <ExportAllModal
          onClose={() => setIsExportOpen(false)}
          title="Xuất phiếu lương"
          subtitle={employee.name}
          icon={<FileText className="w-5 h-5" />}
          selectedMonthDisplayLabel={formatMonthLabel(selectedMonth)}
          exportMonthKeys={yearMonthKeys}
          isExporting={isExportingExcel}
          singleBadge="PDF"
          allBadge="Excel"
          singleDescription="Phiếu lương: chấm công, thu nhập, khấu trừ và thực nhận"
          allDescription={(count) => `Tổng hợp ${count} tháng có dữ liệu trong năm ${selectedMonth.slice(0, 4)} vào 1 file`}
          onExport={async (mode) => {
            await exportPayslip(mode);
            setIsExportOpen(false);
          }}
        />
      )}

      {/* Chân trang: thương hiệu + nhắc số liệu tháng đang chạy còn thay đổi & ai để hỏi khi thấy sai */}
      <footer className="mt-4 bg-slate-900 text-slate-300 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo />
            <div>
              <div className="text-sm font-extrabold text-white">Hùng Decor · Khung tranh</div>
              <div className="text-[11px] text-slate-400">Phiếu lương cá nhân</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-400/10 border border-amber-400/25 px-3.5 py-2.5 md:max-w-md">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" aria-hidden />
            <p className="text-xs leading-relaxed">
              Số liệu tháng đang chạy có thể thay đổi cho tới khi chốt lương.{' '}
              <strong className="text-amber-200">Nếu thấy chưa đúng, vui lòng báo lại quản lý.</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
