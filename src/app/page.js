'use client';

import React, { useState } from 'react';
import { CalendarCheck, HandCoins, ShoppingBag, Wallet, Settings, FileSpreadsheet } from 'lucide-react';
import { usePayrollData } from '../hooks/usePayrollData';
import { formatVND } from '../lib/payroll';
import Toast from '../components/common/Toast';
import LoadingScreen from '../components/common/LoadingScreen';
import AppHeader, { HeaderButton } from '../components/common/AppHeader';
import AdminLoginScreen from '../components/admin/AdminLoginScreen';
import AttendanceTab from '../components/admin/AttendanceTab';
import AdvancesTab from '../components/admin/AdvancesTab';
import ExpensesTab from '../components/admin/ExpensesTab';
import PayrollTab from '../components/admin/PayrollTab';
import SettingsTab from '../components/admin/SettingsTab';
import AdvanceModal from '../components/modals/AdvanceModal';
import ExpenseModal from '../components/modals/ExpenseModal';
import AddEmployeeModal from '../components/modals/AddEmployeeModal';
import ExportAllModal from '../components/modals/ExportAllModal';

const ADMIN_TABS = [
  { id: 'attendance', label: 'Chấm công', icon: CalendarCheck },
  { id: 'advances', label: 'Ứng', icon: HandCoins },
  { id: 'expenses', label: 'Chi', icon: ShoppingBag },
  { id: 'payroll', label: 'Lương', icon: Wallet },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

function DesktopTabs({ activeTab, onChange }) {
  return (
    <nav aria-label="Chức năng" className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
      {ADMIN_TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              active ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function MobileTabBar({ activeTab, onChange }) {
  return (
    <nav
      aria-label="Chức năng"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-5 max-w-lg mx-auto">
        {ADMIN_TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 h-16 cursor-pointer transition-colors ${
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-emerald-600 text-white' : ''}`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[11px] whitespace-nowrap ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function KpiCards({ kpiStats }) {
  const items = [
    { label: 'Tổng chi 1 tháng', value: formatVND(kpiStats.totalMonthCost), color: 'text-rose-600' },
    { label: 'Tổng lương ứng', value: formatVND(kpiStats.totalAdvances), color: 'text-amber-700' },
    { label: 'Tổng chi còn lại', value: formatVND(kpiStats.totalNetPayroll), color: 'text-emerald-700' },
    { label: 'Chi tiêu & đổ xăng', value: formatVND(kpiStats.totalExpenses), color: 'text-indigo-700' },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-4">
      {items.map(({ label, value, color }) => (
        <div key={label} className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs min-w-0">
          <div className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">{label}</div>
          <div className={`text-sm sm:text-base font-black tabular-nums truncate mt-0.5 ${color}`}>{value}</div>
        </div>
      ))}
    </div>
  );
}

/** Thiếu biến môi trường Firebase → app không có nguồn dữ liệu, báo rõ cho người cài đặt */
function FirebaseConfigError() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div role="alert" className="max-w-md w-full bg-white rounded-3xl border border-rose-200 shadow-sm p-6 space-y-2">
        <h1 className="text-base font-extrabold text-rose-700">Chưa cấu hình Firebase</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Toàn bộ dữ liệu được lấy từ Firestore. Hãy khai báo các biến <code>NEXT_PUBLIC_FIREBASE_*</code> trong file{' '}
          <code>.env</code> (xem <code>.env.example</code>) rồi build lại ứng dụng.
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const data = usePayrollData();
  const {
    employees,
    selectedMonth,
    setSelectedMonth,
    selectedMonthDisplayLabel,
    kpiStats,
    isExportingExcel,
  } = data;

  const [adminTab, setAdminTab] = useState('attendance');
  // Chỉ 1 modal mở tại 1 thời điểm; modal được mount khi mở nên form luôn được reset
  const [openModal, setOpenModal] = useState(null);
  const closeModal = () => setOpenModal(null);

  const changeTab = (id) => {
    setAdminTab(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!data.isFirebaseConfigured) return <FirebaseConfigError />;
  if (!data.isAuthReady) return <LoadingScreen message="Đang kiểm tra đăng nhập..." />;

  if (!data.isAdminAuthenticated) {
    return (
      <div className="min-h-dvh bg-slate-100 text-slate-800 flex flex-col">
        <Toast toast={data.toast} />
        <AdminLoginScreen onLogin={data.loginAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-100 text-slate-800 flex flex-col">
      <Toast toast={data.toast} />

      <AppHeader
        title="Lab Hung Decor"
        nav={<DesktopTabs activeTab={adminTab} onChange={changeTab} />}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        actions={<HeaderButton icon={FileSpreadsheet} label="Xuất Excel" onClick={() => setOpenModal('export')} />}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
        {!data.isDataReady ? (
          <LoadingScreen fullScreen={false} />
        ) : (
          <>
        {adminTab !== 'settings' && <KpiCards kpiStats={kpiStats} />}

        {adminTab === 'attendance' && (
          <AttendanceTab
            monthPayrollSummary={data.monthPayrollSummary}
            currentMonthDays={data.currentMonthDays}
            calendarCells={data.calendarCells}
            selectedMonthDisplayLabel={selectedMonthDisplayLabel}
            selectedMonth={selectedMonth}
            onToggleAttendance={data.toggleAttendance}
            onSetAttendanceValue={data.setAttendanceValue}
            onQuickMarkAllToday={data.quickMarkAllToday}
          />
        )}

        {adminTab === 'advances' && (
          <AdvancesTab
            advances={data.advances}
            employees={employees}
            selectedMonth={selectedMonth}
            totalAdvances={kpiStats.totalAdvances}
            onOpenAddAdvance={() => setOpenModal('advance')}
            onDeleteAdvance={data.deleteAdvance}
          />
        )}

        {adminTab === 'expenses' && (
          <ExpensesTab
            expenses={data.expenses}
            employees={employees}
            selectedMonth={selectedMonth}
            totalExpenses={kpiStats.totalExpenses}
            totalReimbursements={kpiStats.totalReimbursements}
            totalFuel={kpiStats.totalFuel}
            onOpenAddExpense={() => setOpenModal('expense')}
            onDeleteExpense={data.deleteExpense}
          />
        )}

        {adminTab === 'payroll' && (
          <PayrollTab
            monthPayrollSummary={data.monthPayrollSummary}
            totalNetPayroll={kpiStats.totalNetPayroll}
            selectedMonthDisplayLabel={selectedMonthDisplayLabel}
            standardWorkDays={data.STANDARD_WORK_DAYS}
            copiedEmpId={data.copiedEmpId}
            isExportingExcel={isExportingExcel}
            onOpenExportAllModal={() => setOpenModal('export')}
            onOpenAddStaffModal={() => setOpenModal('employee')}
            onCopyLink={data.copyEmployeeLink}
            onExportEmployeeExcel={data.handleExportEmployee}
            onRegenerateSlug={data.regenerateSlug}
            onSaveSalaryEdit={data.saveSalaryEdit}
          />
        )}

        {adminTab === 'settings' && (
          <SettingsTab
            adminEmail={data.adminEmail}
            employeesCount={employees.length}
            cloudSyncStatus={data.cloudSyncStatus}
            onChangePassword={data.changeAdminPassword}
            onLogout={data.logoutAdmin}
          />
        )}
          </>
        )}
      </main>

      <MobileTabBar activeTab={adminTab} onChange={changeTab} />

      {openModal === 'advance' && (
        <AdvanceModal onClose={closeModal} employees={employees} selectedMonth={selectedMonth} onAddAdvance={data.addAdvance} />
      )}
      {openModal === 'expense' && (
        <ExpenseModal onClose={closeModal} employees={employees} selectedMonth={selectedMonth} onAddExpense={data.addExpense} />
      )}
      {openModal === 'employee' && <AddEmployeeModal onClose={closeModal} onAddEmployee={data.addEmployee} />}
      {openModal === 'export' && (
        <ExportAllModal
          onClose={closeModal}
          selectedMonthDisplayLabel={selectedMonthDisplayLabel}
          exportMonthKeys={data.exportMonthKeys}
          isExporting={isExportingExcel}
          onExportWorkshop={data.handleExportWorkshop}
        />
      )}
    </div>
  );
}
