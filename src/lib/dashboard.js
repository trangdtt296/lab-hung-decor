/**
 * src/lib/dashboard.js
 * Số liệu tổng hợp cho trang Tổng quan: lương & chi tiêu theo tháng, theo năm, theo hạng mục, theo nhân viên.
 * Dùng đúng công thức của bảng lương (calculateEmployeeMonthPayroll) để số khớp với tab Lương.
 */
import { calculateEmployeeMonthPayroll, isEmployeeInMonth, toMonthKey, FIRST_MONTH_KEY } from './payroll';

const sumAmount = (items) => items.reduce((s, x) => s + (Number(x.amount) || 0), 0);

/**
 * Số liệu 1 tháng.
 * - salary: tiền lương xưởng trả ra = lương thực nhận (đã trừ ứng, tiền ảnh...) + đã ứng.
 *   Không gồm tiền hoàn chi tiêu để không bị tính 2 lần với `expenses`.
 * - expenses: tổng các khoản chi trong tháng (kể cả khoản hoàn vào lương).
 */
export const computeMonthStats = (monthKey, data, currentMonthKey) => {
  const { employees = [], attendance = {}, advances = [], expenses = [] } = data;
  const rows = employees
    .filter((emp) => isEmployeeInMonth(emp, monthKey, data, currentMonthKey))
    .map((emp) => {
      const p = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
      return { employee: emp, salary: p.netWorkSalary + p.totalAdvances, advances: p.totalAdvances, days: p.totalDays };
    })
    // Bỏ người không có công / ứng nào (VD tháng chưa tới) để không đếm sai số người
    .filter((r) => r.days > 0 || r.advances > 0);

  const monthExpenses = expenses.filter((e) => e.month === monthKey);
  const salary = rows.reduce((s, r) => s + r.salary, 0);
  const expenseTotal = sumAmount(monthExpenses);

  return {
    monthKey,
    month: Number(monthKey.slice(5, 7)),
    salary,
    advances: rows.reduce((s, r) => s + r.advances, 0),
    days: rows.reduce((s, r) => s + r.days, 0),
    headcount: rows.length,
    expenses: expenseTotal,
    total: salary + expenseTotal,
    hasData: rows.length > 0 || monthExpenses.length > 0,
    rows,
    monthExpenses,
  };
};

/** 12 tháng của 1 năm + tổng năm + phân bổ theo hạng mục chi và theo nhân viên */
export const computeYearStats = (year, data, currentMonthKey) => {
  const months = Array.from({ length: 12 }, (_, i) => {
    const key = toMonthKey(year, i + 1);
    const stats = computeMonthStats(key, data, currentMonthKey);
    return {
      ...stats,
      isBeforeStart: key < FIRST_MONTH_KEY,
      isFuture: Boolean(currentMonthKey) && key > currentMonthKey,
      isCurrent: key === currentMonthKey,
    };
  });

  const activeMonths = months.filter((m) => m.hasData);
  const totals = {
    salary: months.reduce((s, m) => s + m.salary, 0),
    expenses: months.reduce((s, m) => s + m.expenses, 0),
    days: months.reduce((s, m) => s + m.days, 0),
  };
  totals.total = totals.salary + totals.expenses;
  totals.monthCount = activeMonths.length;
  totals.avgPerMonth = activeMonths.length ? totals.total / activeMonths.length : 0;

  const byCategory = new Map();
  months.forEach((m) =>
    m.monthExpenses.forEach((e) => {
      const cat = e.category || 'Khác';
      byCategory.set(cat, (byCategory.get(cat) || 0) + (Number(e.amount) || 0));
    })
  );

  const byEmployee = new Map();
  months.forEach((m) =>
    m.rows.forEach((r) => {
      const prev = byEmployee.get(r.employee.id) || { employee: r.employee, salary: 0, days: 0, months: 0 };
      byEmployee.set(r.employee.id, {
        ...prev,
        salary: prev.salary + r.salary,
        days: prev.days + r.days,
        months: prev.months + 1,
      });
    })
  );

  return {
    year,
    months,
    totals,
    categories: [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount),
    employees: [...byEmployee.values()].sort((a, b) => b.salary - a.salary),
  };
};

/* ------------------------------- Định dạng gọn ------------------------------- */

const compactFormatter = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

/** 12500000 → '12,5tr'; 1200000000 → '1,2 tỷ'; 850000 → '850k' (dùng cho trục & nhãn biểu đồ) */
export const formatCompactVND = (amount) => {
  const n = Math.abs(Number(amount) || 0);
  const sign = amount < 0 ? '-' : '';
  if (n >= 1e9) return `${sign}${compactFormatter.format(n / 1e9)} tỷ`;
  if (n >= 1e6) return `${sign}${compactFormatter.format(n / 1e6)}tr`;
  if (n >= 1e3) return `${sign}${compactFormatter.format(Math.round(n / 1e3))}k`;
  return `${sign}${Math.round(n)}`;
};

/** % thay đổi so với kỳ trước (null khi kỳ trước = 0) */
export const percentChange = (current, previous) => (previous ? ((current - previous) / previous) * 100 : null);
