'use client';

import React, { createContext, useContext } from 'react';
import { usePayrollData } from '../../hooks/usePayrollData';

/**
 * Dữ liệu admin dùng chung cho mọi trang (chấm công, ứng, chi, lương, cài đặt).
 * Đặt ở layout nên chuyển trang không mở lại kết nối Firestore hay mất tháng đang chọn.
 */
const PayrollDataContext = createContext(null);

export function PayrollDataProvider({ children }) {
  const data = usePayrollData();
  return <PayrollDataContext.Provider value={data}>{children}</PayrollDataContext.Provider>;
}

export function usePayroll() {
  const ctx = useContext(PayrollDataContext);
  if (!ctx) throw new Error('usePayroll phải được dùng bên trong <PayrollDataProvider>');
  return ctx;
}
