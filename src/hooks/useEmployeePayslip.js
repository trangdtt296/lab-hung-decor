'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  STANDARD_WORK_DAYS,
  getCurrentMonthKey,
  getDaysInMonth,
  buildCalendarCells,
  calculateEmployeeMonthPayroll,
} from '../lib/payroll';
import { exportEmployeeExcel, getEmployeeYearMonthKeys } from '../lib/exportExcel';
import { useToast } from './useToast';

/**
 * Dữ liệu cho trang nhân viên /e/{slug}. Lấy qua API server (/api/payslip/{slug}) — API chỉ trả
 * phiếu lương của đúng người sở hữu link, trình duyệt không bao giờ nhận dữ liệu người khác.
 * Tự tải lại khi người dùng quay lại tab để thấy chấm công mới nhất.
 */
export function useEmployeePayslip(token) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | not_found | error
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [isCopied, setIsCopied] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Cố ý set sau mount: tháng hiện tại phụ thuộc đồng hồ client, đọc lúc render sẽ lệch hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedMonth(getCurrentMonthKey());
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/payslip/${encodeURIComponent(token)}`, { cache: 'no-store' });
        if (cancelled) return;
        if (res.status === 404) {
          setStatus('not_found');
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = await res.json();
        if (cancelled) return;
        setData(body);
        setStatus('ready');
      } catch (err) {
        console.error(err);
        // Đã có dữ liệu thì giữ nguyên, chỉ báo lỗi khi tải lần đầu thất bại
        if (!cancelled) setStatus((prev) => (prev === 'ready' ? prev : 'error'));
      }
    };
    load();
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token]);

  const employee = data?.employee ?? null;
  const currentMonthDays = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);
  const calendarCells = useMemo(() => buildCalendarCells(currentMonthDays), [currentMonthDays]);
  const payroll = useMemo(
    () => (data ? calculateEmployeeMonthPayroll(data.employee, selectedMonth, data.attendance, data.advances, data.expenses) : null),
    [data, selectedMonth]
  );

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      showToast('Đã copy link');
    } catch {
      showToast(`Không copy được, link: ${window.location.href}`, 'error');
    }
  }, [showToast]);

  /** Các tháng có dữ liệu trong năm — hiện ở lựa chọn "Tất cả các tháng" của hộp Xuất Excel */
  const yearMonthKeys = useMemo(
    () =>
      data ? getEmployeeYearMonthKeys(data.employee, selectedMonth, data.attendance, data.advances, data.expenses) : [selectedMonth],
    [data, selectedMonth]
  );

  /** mode 'single' = phiếu lương PDF tháng đang chọn, 'all' = Excel tổng hợp cả năm */
  const exportPayslip = useCallback(async (mode = 'single') => {
    if (!data) return;
    setIsExportingExcel(true);
    try {
      let fileName;
      if (mode === 'all') {
        fileName = await exportEmployeeExcel(data.employee, selectedMonth, data.attendance, data.advances, data.expenses, {
          scope: 'year',
        });
      } else {
        const { exportPayslipPdf } = await import('../lib/payslip/exportPayslipPdf');
        fileName = await exportPayslipPdf(data.employee, selectedMonth, data.attendance, data.advances, data.expenses);
      }
      if (fileName) showToast(`Đã tải xuống ${fileName}`); // null = hộp "Lưu / Chia sẻ file" đang mở
    } catch (err) {
      console.error(err);
      showToast(mode === 'all' ? 'Có lỗi khi xuất Excel, vui lòng thử lại!' : 'Có lỗi khi xuất phiếu lương PDF, vui lòng thử lại!', 'error');
    } finally {
      setIsExportingExcel(false);
    }
  }, [data, selectedMonth, showToast]);

  return {
    status,
    employee,
    payroll,
    selectedMonth,
    setSelectedMonth,
    currentMonthDays,
    calendarCells,
    standardWorkDays: STANDARD_WORK_DAYS,
    toast,
    isCopied,
    isExportingExcel,
    yearMonthKeys,
    copyLink,
    exportPayslip,
  };
}
