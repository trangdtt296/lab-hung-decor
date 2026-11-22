'use client';

import React, { createContext, useContext, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download } from 'lucide-react';
import { formatVND } from '../../lib/payroll';
import { usePayroll } from './PayrollDataContext';
import { ADMIN_TABS } from './adminTabs';
import AccountMenu from './AccountMenu';
import AdminLoginScreen from './AdminLoginScreen';
import Toast from '../common/Toast';
import LoadingScreen from '../common/LoadingScreen';
import AppHeader, { HeaderButton } from '../common/AppHeader';
import ExportAllModal from '../modals/ExportAllModal';

/** Hành động dùng chung giữa các trang (VD mở hộp thoại Xuất Excel từ trang Lương) */
const AdminUiContext = createContext({ openExportModal: () => {} });
export const useAdminUi = () => useContext(AdminUiContext);

const isActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

function DesktopTabs({ pathname }) {
  return (
    <nav aria-label="Chức năng" className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
      {ADMIN_TABS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
              active ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileTabBar({ pathname }) {
  return (
    <nav
      aria-label="Chức năng"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid grid-cols-4 max-w-lg mx-auto">
        {ADMIN_TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-0.5 h-16 transition-colors ${
                active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-emerald-600 text-white' : ''}`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[11px] whitespace-nowrap ${active ? 'font-extrabold' : 'font-semibold'}`}>{label}</span>
            </Link>
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

/**
 * Khung chung của mọi trang admin: kiểm tra đăng nhập, header (chọn tháng, Xuất Excel, tài khoản),
 * thanh tab (desktop trên header, mobile dưới đáy), thẻ số liệu tháng, hộp thoại Xuất Excel.
 */
export default function AdminShell({ children }) {
  const data = usePayroll();
  const pathname = usePathname();
  const [isExportOpen, setIsExportOpen] = useState(false);

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

  // Thẻ số liệu tháng chỉ hiện ở các tab nghiệp vụ (không hiện ở Đổi mật khẩu / Nhập dữ liệu)
  const showKpis = ADMIN_TABS.some((t) => isActive(pathname, t.href));

  return (
    <AdminUiContext.Provider value={{ openExportModal: () => setIsExportOpen(true) }}>
      <div className="min-h-dvh bg-slate-100 text-slate-800 flex flex-col">
        <Toast toast={data.toast} />

        <AppHeader
          title="Lab Hung Decor"
          nav={<DesktopTabs pathname={pathname} />}
          selectedMonth={data.selectedMonth}
          onMonthChange={data.setSelectedMonth}
          actions={
            <>
              <HeaderButton icon={Download} label="Xuất Excel" onClick={() => setIsExportOpen(true)} />
              <AccountMenu email={data.adminEmail} showLegacyImport={data.isLegacyImportEnabled} onLogout={data.logoutAdmin} />
            </>
          }
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
          {!data.isDataReady ? (
            <LoadingScreen fullScreen={false} />
          ) : (
            <>
              {showKpis && <KpiCards kpiStats={data.kpiStats} />}
              {children}
            </>
          )}
        </main>

        <MobileTabBar pathname={pathname} />

        {isExportOpen && (
          <ExportAllModal
            onClose={() => setIsExportOpen(false)}
            selectedMonthDisplayLabel={data.selectedMonthDisplayLabel}
            exportMonthKeys={data.exportMonthKeys}
            isExporting={data.isExportingExcel}
            onExportWorkshop={data.handleExportWorkshop}
          />
        )}
      </div>
    </AdminUiContext.Provider>
  );
}
