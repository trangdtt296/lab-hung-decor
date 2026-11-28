/**
 * Xuất phiếu lương PDF của 1 nhân viên cho 1 tháng (thay cho file Excel cá nhân theo tháng).
 * - buildPayslipData: gom số liệu (dùng chung công thức với web: calculateEmployeeMonthPayroll)
 * - exportPayslipPdf: nạp thư viện PDF + font tiếng Việt khi cần, vẽ và tải file về máy
 */
import { createElement } from 'react';
import {
  calculateEmployeeMonthPayroll,
  formatMonthLabel,
  getDaysInMonth,
  getMonthStatus,
  parseMonthKey,
  toPlainAsciiName,
  STANDARD_WORK_DAYS,
} from '../payroll';
import { isInAppBrowser, offerFile, triggerBlobDownload } from '../inAppBrowser';
import { amountToVietnameseWords } from './numberToWords';

const pad = (n) => String(n).padStart(2, '0');
const vnd = new Intl.NumberFormat('vi-VN');

/** 'DD/MM' → số để sắp xếp theo ngày */
const dayOf = (date) => Number(String(date || '').split('/')[0]) || 0;
const byDate = (a, b) => dayOf(a.date) - dayOf(b.date);

const DEDUCTION_LABEL = { advance: 'Ứng lương', photo_fee: 'Tiền ảnh', other_deduction: 'Khoản trừ khác' };

/** Khoản khấu trừ: tiêu đề = loại; dòng phụ = ghi chú (nếu khác tên loại) */
const deductionLine = (item, type) => {
  const label = DEDUCTION_LABEL[type];
  const note = String(item.note || '').trim();
  return {
    key: item.id,
    title: label,
    sub: note && note !== label ? note : '',
    date: item.date,
    amount: Number(item.amount) || 0,
  };
};

/**
 * Số liệu cho PayslipDocument.
 * @param now Date lập phiếu (truyền vào để test được)
 */
export const buildPayslipData = (emp, monthKey, attendance, advances, expenses, now = new Date()) => {
  const p = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
  const { year, month } = parseMonthKey(monthKey);
  const days = getDaysInMonth(monthKey);

  const earnings = [
    {
      key: 'work',
      title: 'Lương theo ngày công',
      sub: `${vnd.format(p.baseSalary)}đ ÷ ${STANDARD_WORK_DAYS} × ${p.totalDays} công`,
      date: '',
      amount: p.basePayByDays,
    },
    ...[...p.empReimbursements].sort(byDate).map((item) => ({
      key: item.id,
      title: String(item.note || item.category || 'Chi hộ xưởng'),
      sub: `Hoàn tiền chi hộ xưởng · ${item.category || 'Khác'}`,
      date: item.date,
      amount: Number(item.amount) || 0,
    })),
  ];

  const deductions = [
    ...[...p.empAdvances].sort(byDate).map((x) => deductionLine(x, 'advance')),
    ...[...p.empPhotoFees].sort(byDate).map((x) => deductionLine(x, 'photo_fee')),
    ...[...p.empOtherDeductions].sort(byDate).map((x) => deductionLine(x, 'other_deduction')),
  ];

  const totalEarnings = p.basePayByDays + p.totalReimbursements;
  const totalDeductions = p.totalAdvances + p.totalPhotoFee + p.totalOtherDeductions;
  // Phần chênh do làm tròn lương thực nhận đến nghìn đồng (giống bảng lương web & Excel)
  const rounding = p.netSalary - (totalEarnings - totalDeductions);

  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const empCode = toPlainAsciiName(emp.name).replace(/_+/g, '').toUpperCase().slice(0, 10) || 'NV';

  return {
    employee: { name: emp.name, roleLabel: emp.roleLabel },
    monthLabel: formatMonthLabel(monthKey),
    periodLabel: `01/${pad(month)} – ${pad(days.length)}/${pad(month)}/${year}`,
    slipNo: `PL-${year}${pad(month)}-${empCode}`,
    issuedAt: `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(today.day)}/${pad(today.month)}/${today.year}`,
    status: getMonthStatus(monthKey, today),
    baseSalary: p.baseSalary,
    dayRate: p.dayRate,
    totalDays: p.totalDays,
    daysInMonth: days.length,
    standardWorkDays: STANDARD_WORK_DAYS,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    rounding,
    netSalary: p.netSalary,
    netInWords: amountToVietnameseWords(p.netSalary),
    attendanceDays: days.map((d) => ({
      day: d.day,
      weekday: d.weekday,
      isSunday: d.isSunday,
      value: Number(p.attendanceMap[d.day]) || 0,
    })),
  };
};

/* ------------------------------ Vẽ & tải file ------------------------------ */

const FONT_WEIGHTS = { Regular: 400, Medium: 500, SemiBold: 600, Bold: 700, ExtraBold: 800 };
let fontsRegistered = false;

const loadRenderer = async () => {
  const [renderer, docModule] = await Promise.all([import('@react-pdf/renderer'), import('./PayslipDocument')]);
  if (!fontsRegistered) {
    const origin = window.location.origin;
    renderer.Font.register({
      family: docModule.PDF_FONT,
      fonts: Object.entries(FONT_WEIGHTS).map(([name, fontWeight]) => ({
        src: `${origin}/fonts/BeVietnamPro-${name}.ttf`,
        fontWeight,
      })),
    });
    // Không ngắt từ tiếng Việt bằng dấu gạch nối
    renderer.Font.registerHyphenationCallback((word) => [word]);
    fontsRegistered = true;
  }
  return { pdf: renderer.pdf, PayslipDocument: docModule.default };
};

/** Logo dạng data URI (không có logo thì phiếu vẫn xuất bình thường) */
const loadLogo = async () => {
  try {
    const res = await fetch('/logo.jpg');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

/**
 * Xuất phiếu lương PDF tháng `monthKey`.
 * @returns tên file nếu đã tải thẳng; null nếu đang chờ người dùng bấm "Lưu / Chia sẻ" (trình duyệt nhúng)
 */
export const exportPayslipPdf = async (emp, monthKey, attendance, advances, expenses) => {
  const [{ pdf, PayslipDocument }, logoSrc] = await Promise.all([loadRenderer(), loadLogo()]);
  const data = buildPayslipData(emp, monthKey, attendance, advances, expenses);
  const blob = await pdf(createElement(PayslipDocument, { data, logoSrc })).toBlob();

  const { year, month } = parseMonthKey(monthKey);
  const fileName = `Phieu_Luong_${toPlainAsciiName(emp.name)}_Thang_${month}_${year}.pdf`;
  if (isInAppBrowser()) {
    offerFile(blob, fileName);
    return null;
  }
  triggerBlobDownload(blob, fileName);
  return fileName;
};
