'use client';

import React, { useState } from 'react';
import {
  CalendarCheck,
  HandCoins,
  ShoppingBag,
  Wallet,
  Settings,
  FileSpreadsheet,
  ArrowLeft,
  Check,
  Copy,
} from 'lucide-react';
import { usePayrollData } from '../hooks/usePayrollData';
import { formatVND } from '../lib/payroll';
import Toast from '../components/common/Toast';
import YearMonthSelectGroup from '../components/common/YearMonthSelectGroup';
import AdminLoginScreen from '../components/common/AdminLoginScreen';
import AttendanceTab from '../components/admin/AttendanceTab';
import AdvancesTab from '../components/admin/AdvancesTab';
import ExpensesTab from '../components/admin/ExpensesTab';
import PayrollTab from '../components/admin/PayrollTab';
import SettingsTab from '../components/admin/SettingsTab';
import EmployeeView from '../components/employee/EmployeeView';
import AdvanceModal from '../components/modals/AdvanceModal';
import ExpenseModal from '../components/modals/ExpenseModal';
import AddEmployeeModal from '../components/modals/AddEmployeeModal';
import ExportAllModal from '../components/modals/ExportAllModal';

export default function HomePage() {
  const {
    employees,
    selectedMonth,
    setSelectedMonth,
    selectedMonthDisplayLabel,
    advances,
    expenses,
    isAdminAuthenticated,
    adminPassword,
    cloudSyncStatus,
    isFirebaseConfigured,
    toast,
    copiedEmpId,
    isExportingExcel,
    currentMonthDays,
    calendarCells,
    monthPayrollSummary,
    kpiStats,
    STANDARD_WORK_DAYS,
    DEMO_ADMIN_EMAIL,
    toggleAttendance,
    quickMarkSingleEmployee,
    quickMarkAllToday,
    addAdvance,
    deleteAdvance,
    addExpense,
    deleteExpense,
    addEmployee,
    saveSalaryEdit,
    regenerateSlug,
    copyEmployeeLink,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    seedSampleData,
    handleExportWorkshop,
    handleExportEmployee,
    calculatePayroll,
  } = usePayrollData();

  const [adminTab, setAdminTab] = useState('attendance');
  const [previewEmployeeId, setPreviewEmployeeId] = useState(null);

  // Modals
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showExportAllModal, setShowExportAllModal] = useState(false);

  const adminTabs = [
    { id: 'attendance', label: 'Chấm công', icon: CalendarCheck },
    { id: 'advances', label: 'Ứng', icon: HandCoins },
    { id: 'expenses', label: 'Chi', icon: ShoppingBag },
    { id: 'payroll', label: 'Lương', icon: Wallet },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const previewEmployee = previewEmployeeId
    ? employees.find((e) => e.id === previewEmployeeId)
    : null;
  const previewPayroll = previewEmployee
    ? calculatePayroll(previewEmployee, selectedMonth)
    : null;
  const isPreviewCopied = previewEmployee && copiedEmpId === previewEmployee.id;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 flex flex-col">
      <Toast message={toast} />

      {/* 1. NẾU CHƯA ĐĂNG NHẬP ADMIN -> HIỂN THỊ FORM ĐĂNG NHẬP */}
      {!isAdminAuthenticated ? (
        <AdminLoginScreen
          activeDemoPassword={adminPassword}
          onLogin={loginAdmin}
        />
      ) : previewEmployee && previewPayroll ? (
        /* 2. CHẾ ĐỘ ADMIN ĐANG XEM THỬ BẢNG CÔNG & LƯƠNG NHÂN VIÊN -> HEADER CỐ ĐỊNH STICKY TOP-0 */
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
            <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-500/20">
                  LH
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white tracking-tight">
                      {previewEmployee.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-[10px] font-bold">
                      Chỉ xem (Admin xem thử)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lab Hung Decor • {previewEmployee.roleLabel}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Đổi nhân viên xem thử nhanh */}
                <select
                  aria-label="Chọn nhân viên khác xem thử"
                  value={previewEmployeeId}
                  onChange={(e) => setPreviewEmployeeId(e.target.value)}
                  className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-white">
                      Xem: {emp.name}
                    </option>
                  ))}
                </select>

                <YearMonthSelectGroup
                  selectedMonth={selectedMonth}
                  onChange={setSelectedMonth}
                  theme="dark"
                />

                <button
                  type="button"
                  onClick={() => copyEmployeeLink(previewEmployee)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white shrink-0 whitespace-nowrap cursor-pointer transition-colors"
                >
                  {isPreviewCopied ? (
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
                  onClick={() => handleExportEmployee(previewEmployee)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs shrink-0 whitespace-nowrap disabled:opacity-60 cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewEmployeeId(null)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white shrink-0 whitespace-nowrap cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Quay lại Admin</span>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
            <EmployeeView
              employee={previewEmployee}
              payroll={previewPayroll}
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
          </main>
        </div>
      ) : (
        /* 3. GIAO DIỆN CHÍNH QUẢN TRỊ ADMIN -> HEADER CỐ ĐỊNH STICKY TOP-0 */
        <div className="min-h-screen flex flex-col">
          {/* HEADER CỐ ĐỊNH Ở ĐỈNH TRANG (STICKY TOP-0) - NỀN SLATE-900 SANG TRỌNG */}
          <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md text-white border-b border-slate-800 shadow-md">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-emerald-500/20">
                  LH
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                    Lab Hung Decor
                  </h1>
                  <p className="text-[11px] text-slate-400">
                    Công chuẩn {STANDARD_WORK_DAYS} ngày • {currentMonthDays.length} ngày/tháng
                  </p>
                </div>
              </div>

              {/* Thanh Tab điều hướng trên Màn hình máy tính (Desktop) */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
                {adminTabs.map((tab) => {
                  const Icon = tab.icon;
                  const active = adminTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAdminTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Chọn Năm/Tháng & Xuất Excel */}
              <div className="flex flex-wrap items-center gap-2">
                <YearMonthSelectGroup
                  selectedMonth={selectedMonth}
                  onChange={setSelectedMonth}
                  theme="dark"
                />
                <button
                  type="button"
                  onClick={() => setShowExportAllModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs shrink-0 whitespace-nowrap cursor-pointer transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>
          </header>

          {/* VÙNG NỘI DUNG CUỘN BÊN DƯỚI HEADER */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 pb-24 md:pb-10">
            {/* Thẻ KPI thống kê nhanh */}
            {adminTab !== 'settings' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500">Tổng quỹ lương</div>
                  <div className="text-sm sm:text-base font-black text-emerald-700 tabular-nums whitespace-nowrap">
                    {formatVND(kpiStats.totalNetPayroll)}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500">Tổng ngày công</div>
                  <div className="text-sm sm:text-base font-black text-slate-900 tabular-nums whitespace-nowrap">
                    {kpiStats.totalWorkDays}{' '}
                    <span className="text-xs font-normal text-slate-400">công</span>
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500">Đã ứng lương</div>
                  <div className="text-sm sm:text-base font-black text-amber-700 tabular-nums whitespace-nowrap">
                    {formatVND(kpiStats.totalAdvances)}
                  </div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-slate-500">Chi & Đổ xăng</div>
                  <div className="text-sm sm:text-base font-black text-indigo-700 tabular-nums whitespace-nowrap">
                    {formatVND(kpiStats.totalExpenses)}
                  </div>
                </div>
              </div>
            )}

            {/* Nội dung các Tab nghiệp vụ */}
            {adminTab === 'attendance' && (
              <AttendanceTab
                monthPayrollSummary={monthPayrollSummary}
                currentMonthDays={currentMonthDays}
                calendarCells={calendarCells}
                selectedMonthDisplayLabel={selectedMonthDisplayLabel}
                selectedMonth={selectedMonth}
                standardWorkDays={STANDARD_WORK_DAYS}
                onToggleAttendance={toggleAttendance}
                onQuickMarkSingleEmployee={quickMarkSingleEmployee}
                onQuickMarkAllToday={quickMarkAllToday}
              />
            )}

            {adminTab === 'advances' && (
              <AdvancesTab
                advances={advances}
                employees={employees}
                selectedMonth={selectedMonth}
                totalAdvances={kpiStats.totalAdvances}
                onOpenAddAdvance={() => setShowAdvanceModal(true)}
                onDeleteAdvance={deleteAdvance}
              />
            )}

            {adminTab === 'expenses' && (
              <ExpensesTab
                expenses={expenses}
                employees={employees}
                selectedMonth={selectedMonth}
                totalExpenses={kpiStats.totalExpenses}
                totalReimbursements={kpiStats.totalReimbursements}
                totalFuel={kpiStats.totalFuel}
                onOpenAddExpense={() => setShowExpenseModal(true)}
                onDeleteExpense={deleteExpense}
              />
            )}

            {adminTab === 'payroll' && (
              <PayrollTab
                monthPayrollSummary={monthPayrollSummary}
                totalNetPayroll={kpiStats.totalNetPayroll}
                selectedMonthDisplayLabel={selectedMonthDisplayLabel}
                standardWorkDays={STANDARD_WORK_DAYS}
                copiedEmpId={copiedEmpId}
                isExportingExcel={isExportingExcel}
                onOpenExportAllModal={() => setShowExportAllModal(true)}
                onOpenAddStaffModal={() => setShowAddStaffModal(true)}
                onCopyLink={copyEmployeeLink}
                onExportEmployeeExcel={handleExportEmployee}
                onPreviewEmployee={(empId) => setPreviewEmployeeId(empId)}
                onRegenerateSlug={regenerateSlug}
                onSaveSalaryEdit={saveSalaryEdit}
              />
            )}

            {adminTab === 'settings' && (
              <SettingsTab
                demoEmail={DEMO_ADMIN_EMAIL}
                employeesCount={employees.length}
                cloudSyncStatus={cloudSyncStatus}
                isFirebaseConfigured={isFirebaseConfigured}
                onChangePassword={changeAdminPassword}
                onLogout={logoutAdmin}
                onSeedSampleData={seedSampleData}
              />
            )}
          </main>

          {/* Thanh điều hướng cố định chân trang trên Mobile */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
            <div className="grid grid-cols-5 py-1.5 px-0.5">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const active = adminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setAdminTab(tab.id)}
                    className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                      active
                        ? 'text-emerald-600'
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <div className={`p-1 rounded-xl ${active ? 'bg-emerald-50' : ''}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      )}

      {/* Các Modals */}
      <AdvanceModal
        isOpen={showAdvanceModal}
        onClose={() => setShowAdvanceModal(false)}
        employees={employees}
        selectedMonth={selectedMonth}
        onAddAdvance={addAdvance}
      />

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        employees={employees}
        selectedMonth={selectedMonth}
        onAddExpense={addExpense}
      />

      <AddEmployeeModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onAddEmployee={addEmployee}
      />

      <ExportAllModal
        isOpen={showExportAllModal}
        onClose={() => setShowExportAllModal(false)}
        selectedMonthDisplayLabel={selectedMonthDisplayLabel}
        isExporting={isExportingExcel}
        onExportWorkshop={handleExportWorkshop}
      />
    </div>
  );
}
