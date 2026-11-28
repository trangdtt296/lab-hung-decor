/**
 * src/lib/payroll.js
 * Quy tắc tính lương công chuẩn 30 ngày, tiện ích ngày tháng & định dạng.
 * Không chứa dữ liệu: mọi dữ liệu (nhân viên, chấm công, ứng, chi) lấy từ Firestore.
 */
// Lương 1 ngày = lương cơ bản / 30 (cố định, không phụ thuộc số ngày trong tháng)
export const STANDARD_WORK_DAYS = 30;

/**
 * Làm tròn lương thực nhận. 1 = tới đồng; 1000 = tới nghìn đồng
 * (giống công thức ROUND(...,-3) trong file Google Sheets mẫu).
 * Dùng chung cho web và công thức Excel để 2 nơi luôn khớp số.
 */
export const NET_SALARY_ROUNDING = 1000;


export const AVAILABLE_MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1).padStart(2, '0'),
  label: `Tháng ${i + 1}`,
}));

/** Tháng đầu tiên có dữ liệu trên hệ thống (dữ liệu cũ nạp từ Google Sheets bắt đầu từ T9/2026) */
export const FIRST_MONTH_KEY = '2026-09';

/** Các năm cho bộ chọn: từ năm bắt đầu tới năm hiện tại (mới nhất trước) */
export const AVAILABLE_YEARS = (() => {
  const first = Number(FIRST_MONTH_KEY.slice(0, 4));
  const last = Math.max(first, new Date().getFullYear());
  return Array.from({ length: last - first + 1 }, (_, i) => String(last - i));
})();

export const WEEKDAY_HEADERS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const WEEKDAY_BY_JS_INDEX = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const ATTENDANCE_VALUES = { FULL: 1, HALF: 0.5, OFF: 0 };

/** 1 → '+', 0.5 → '-', còn lại → '' (ký hiệu dùng trong bảng chấm công & Excel) */
export const attendanceMark = (value) =>
  value === ATTENDANCE_VALUES.FULL ? '+' : value === ATTENDANCE_VALUES.HALF ? '-' : '';

/* ----------------------------- Ngày & tháng ----------------------------- */

export const toMonthKey = (year, month) => `${year}-${String(month).padStart(2, '0')}`;

export const parseMonthKey = (monthKey) => {
  const [year, month] = String(monthKey).split('-').map(Number);
  return { year, month };
};

/** Mã tháng hiện tại (VD: '2026-11') */
export const getCurrentMonthKey = () => {
  const now = new Date();
  return toMonthKey(now.getFullYear(), now.getMonth() + 1);
};

/** { year, month, day } của hôm nay — chỉ gọi trên client để tránh lệch SSR */
export const getTodayInfo = () => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
};

/** 'Tháng 11/2026' */
export const formatMonthLabel = (monthKey) => {
  const { year, month } = parseMonthKey(monthKey);
  return `Tháng ${month}/${year}`;
};

/** Danh sách ngày trong tháng kèm thứ (T2..CN) */
export const getDaysInMonth = (monthKey) => {
  const { year, month } = parseMonthKey(monthKey);
  const totalDays = new Date(year, month, 0).getDate();
  return Array.from({ length: totalDays }, (_, i) => {
    const d = i + 1;
    const jsDay = new Date(year, month - 1, d).getDay();
    return {
      day: d,
      weekday: WEEKDAY_BY_JS_INDEX[jsDay],
      mondayBasedIndex: (jsDay + 6) % 7, // T2 = 0 ... CN = 6
      isSunday: jsDay === 0,
      dateStr: `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    };
  });
};

/** Ô lịch dạng lưới 7 cột (T2 → CN), null = ô trống đầu tháng */
export const buildCalendarCells = (days) => [
  ...Array(days[0]?.mondayBasedIndex || 0).fill(null),
  ...days,
];

/**
 * So sánh 1 ngày trong tháng với hôm nay: -1 quá khứ, 0 hôm nay, 1 tương lai.
 * Trả về null khi chưa biết hôm nay (SSR).
 */
export const compareWithToday = (day, monthKey, todayInfo) => {
  if (!monthKey || !day || !todayInfo) return null;
  const { year, month } = parseMonthKey(monthKey);
  const target = year * 10000 + month * 100 + day;
  const today = todayInfo.year * 10000 + todayInfo.month * 100 + todayInfo.day;
  return Math.sign(target - today);
};

export const isPastDay = (day, monthKey, todayInfo) => compareWithToday(day, monthKey, todayInfo) === -1;
export const isToday = (day, monthKey, todayInfo) => compareWithToday(day, monthKey, todayInfo) === 0;
export const isFutureDay = (day, monthKey, todayInfo) => compareWithToday(day, monthKey, todayInfo) === 1;

/** Trạng thái tháng: đã chốt / đang chạy / chưa tới */
export const getMonthStatus = (monthKey, todayInfo) => {
  if (!todayInfo) return '';
  const current = toMonthKey(todayInfo.year, todayInfo.month);
  if (monthKey < current) return 'Đã chốt';
  if (monthKey === current) return 'Đang chạy';
  return 'Chưa tới';
};

/**
 * Các tháng có dữ liệu (chấm công / ứng / chi) tính tới `untilMonthKey`, sắp xếp tăng dần.
 * Luôn bao gồm `untilMonthKey`.
 */
export const getMonthKeysWithData = (
  { attendance = {}, advances = [], expenses = [] },
  untilMonthKey,
  { sameYearOnly = false } = {}
) => {
  const keys = new Set([
    ...Object.keys(attendance),
    ...advances.map((a) => a.month),
    ...expenses.map((e) => e.month),
  ]);
  if (untilMonthKey) keys.add(untilMonthKey);
  const year = untilMonthKey?.slice(0, 4);
  return [...keys]
    .filter(Boolean)
    .filter((k) => !untilMonthKey || k <= untilMonthKey)
    .filter((k) => !sameYearOnly || k.startsWith(year))
    .sort();
};

/* ------------------------------ Định dạng ------------------------------- */

const vndFormatter = new Intl.NumberFormat('vi-VN');

/** 9000000 → '9.000.000đ' */
export const formatVND = (amount) => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) return '0đ';
  return `${vndFormatter.format(Math.round(amount))}đ`;
};

/** '9.000.000' → 9000000 (bỏ mọi ký tự không phải số) */
export const parseMoneyInput = (value) => Number(String(value ?? '').replace(/\D/g, '')) || 0;

const removeDiacritics = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');

/** Tên tiếng Việt → chuỗi an toàn cho tên file */
export const toPlainAsciiName = (str) => removeDiacritics(str).replace(/[^a-zA-Z0-9_-]/g, '_');

/**
 * Slug ngẫu nhiên cho link riêng của nhân viên (VD: 'duong-k7m2xq9fh4tw').
 * Link là "chìa khoá" xem phiếu lương nên phần ngẫu nhiên dài 12 ký tự (~10^17 tổ hợp, không đoán được).
 */
export const generateRandomSlug = (name) => {
  const cleanName = removeDiacritics(name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint32Array(12);
  globalThis.crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => chars[b % chars.length]).join('');
  return `${cleanName || 'nv'}-${rand}`;
};

/* ------------------------------ Tính lương ------------------------------ */

/**
 * Lương cơ bản áp dụng cho 1 tháng. `employee.salaryByMonth` lưu các mốc thay đổi lương
 * ({ '2026-09': 7500000, '2026-11': 8000000 }): mỗi mốc có hiệu lực từ tháng đó trở đi
 * cho tới mốc kế tiếp. Nhờ vậy sửa lương tháng này không làm đổi lương các tháng đã chốt.
 */
export const getBaseSalaryForMonth = (emp, monthKey) => {
  if (!emp) return 0;
  const history = emp.salaryByMonth || {};
  const keys = Object.keys(history).sort();
  const effective = keys.filter((k) => k <= monthKey).pop() ?? keys[0];
  return effective !== undefined ? Number(history[effective]) || 0 : Number(emp.baseSalary) || 0;
};

/** Nhân viên có dữ liệu (chấm công / ứng / chi tiêu) trong tháng hay không */
export const employeeHasMonthData = (emp, monthKey, { attendance = {}, advances = [], expenses = [] }) =>
  Object.keys(attendance[monthKey]?.[emp.id] || {}).length > 0 ||
  advances.some((a) => a.month === monthKey && a.employeeId === emp.id) ||
  expenses.some((e) => e.month === monthKey && (e.employeeId === emp.id || e.payerId === emp.id));

/**
 * Nhân viên có xuất hiện trên bảng lương của tháng không:
 * - Không hiện ở các tháng trước khi vào làm (trước mốc lương đầu tiên)
 * - Tháng chưa tới (sau tháng hiện tại): chưa tự lấy nhân viên sang, chỉ hiện ai đã có dữ liệu tháng đó.
 *   Từ ngày 1 của tháng, nhân viên đang làm mới tự xuất hiện.
 * - Đã nghỉ (active: false): vẫn hiện ở các tháng trước tháng nghỉ (inactiveFrom) và ở tháng nào
 *   còn dữ liệu (VD làm nửa tháng rồi nghỉ), ẩn ở các tháng sau
 * @param currentMonthKey tháng hiện tại 'YYYY-MM' (mặc định theo đồng hồ máy; null = chưa biết, bỏ qua quy tắc tháng tới)
 */
export const isEmployeeInMonth = (emp, monthKey, data, currentMonthKey = getCurrentMonthKey()) => {
  const firstMonth = Object.keys(emp.salaryByMonth || {}).sort()[0];
  if (firstMonth && monthKey < firstMonth) return false;
  if (currentMonthKey && monthKey > currentMonthKey) return employeeHasMonthData(emp, monthKey, data);
  if (emp.active !== false) return true;
  if (emp.inactiveFrom && monthKey < emp.inactiveFrom) return true;
  return employeeHasMonthData(emp, monthKey, data);
};

/**
 * Danh sách cho ô chọn nhân viên khi SỬA 1 khoản cũ: nhân viên đang làm + người được khoản đó nhắc tới
 * (có thể đã nghỉ), để ô chọn không bị nhảy sang người khác.
 */
export const withReferencedEmployees = (activeEmployees, allEmployees, ids) => {
  const extra = allEmployees.filter((e) => ids.includes(e.id) && !activeEmployees.some((a) => a.id === e.id));
  return [...activeEmployees, ...extra];
};

/** Lương cơ bản hiện hành = mốc lương mới nhất */
export const latestBaseSalary = (salaryByMonth = {}, fallback = 0) => {
  const keys = Object.keys(salaryByMonth).sort();
  return keys.length ? salaryByMonth[keys[keys.length - 1]] : fallback;
};

/**
 * Làm tròn giống hàm ROUND của Excel/Google Sheets: .5 làm tròn ra xa số 0
 * (Math.round của JS làm tròn -1.5 thành -1, còn Excel ra -2).
 */
export const roundNetSalary = (amount) => {
  const units = Math.abs(amount) / NET_SALARY_ROUNDING;
  // Bù sai số dấu phẩy động (VD 2.4999999 do phép chia /30)
  const rounded = Math.round(units + 1e-9) * NET_SALARY_ROUNDING;
  return amount < 0 ? -rounded : rounded;
};

const sumAmount = (items) => items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

/**
 * Công thức tính lương chuẩn 30 ngày công:
 * - dayRate = baseSalary / 30
 * - basePayByDays = dayRate * totalDays (tháng 31 ngày làm đủ 31 công sẽ > baseSalary)
 * - netWorkSalary = làm tròn nghìn (dayRate * totalDays - ứng - tiền ảnh - khoản trừ khác)
 * - netSalary (số thực trả) = netWorkSalary + totalReimbursements (chỉ người chi tiền có khoản này)
 */
export const calculateEmployeeMonthPayroll = (
  emp,
  monthKey,
  attendanceData = {},
  advancesList = [],
  expensesList = []
) => {
  const monthAtt = (emp && attendanceData[monthKey]?.[emp.id]) || {};
  const totalDays = Object.values(monthAtt).reduce((sum, val) => sum + (Number(val) || 0), 0);

  const baseSalary = getBaseSalaryForMonth(emp, monthKey);
  const dayRate = baseSalary / STANDARD_WORK_DAYS;
  const basePayByDays = Math.round(dayRate * totalDays);

  const ofThisEmployeeMonth = (item) => emp && item.month === monthKey && item.employeeId === emp.id;
  const empAdvances = advancesList.filter((a) => ofThisEmployeeMonth(a) && a.type === 'advance');
  const empPhotoFees = advancesList.filter((a) => ofThisEmployeeMonth(a) && a.type === 'photo_fee');
  // Khoản trừ khác (VD "Tiền CA bắt"): trừ vào lương nhưng không tính vào "Tổng lương ứng"
  const empOtherDeductions = advancesList.filter((a) => ofThisEmployeeMonth(a) && a.type === 'other_deduction');
  // Khoản chi "hoàn vào lương" được cộng cho NGƯỜI CHI tiền (payerId), không phải người mua —
  // giống bảng lương tổng: mục "Chi Tiêu" của người chi = tổng các khoản họ đã chi hộ xưởng.
  const empReimbursements = expensesList.filter(
    (e) => emp && e.month === monthKey && e.reimburse && e.payerId === emp.id
  );

  const totalAdvances = sumAmount(empAdvances);
  const totalPhotoFee = sumAmount(empPhotoFees);
  const totalOtherDeductions = sumAmount(empOtherDeductions);
  const totalReimbursements = sumAmount(empReimbursements);

  // Cùng công thức với file Excel: "Lương thực nhận" = ROUND((lương/30)*công − ứng − ảnh, -3),
  // "Lương + Chi tiêu" = lương thực nhận + tiền hoàn chi. Dùng dayRate * totalDays chưa làm tròn
  // để web và Excel ra đúng 1 con số.
  const netWorkSalary = roundNetSalary(dayRate * totalDays - totalAdvances - totalPhotoFee - totalOtherDeductions);
  const netSalary = netWorkSalary + totalReimbursements;

  return {
    baseSalary,
    dayRate,
    totalDays,
    basePayByDays,
    empAdvances,
    totalAdvances,
    empPhotoFees,
    totalPhotoFee,
    empOtherDeductions,
    totalOtherDeductions,
    empReimbursements,
    totalReimbursements,
    netWorkSalary,
    netSalary,
    attendanceMap: monthAtt,
  };
};
