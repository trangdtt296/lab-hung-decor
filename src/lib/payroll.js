/**
 * src/lib/payroll.js
 * Chứa toàn bộ hằng số, quy tắc tính lương chuẩn 30 ngày, hàm định dạng tiền tệ và dữ liệu mẫu khởi tạo.
 */

// Lương công chuẩn cố định = 30 ngày; lương 1 ngày = lương cơ bản / 30
export const STANDARD_WORK_DAYS = 30;

export const DEMO_ADMIN_EMAIL = 'admin@labhungdecor.vn';
export const DEFAULT_DEMO_PASSWORD = '123456';

export const AVAILABLE_MONTHS = [
  { value: '01', label: 'Tháng 1' },
  { value: '02', label: 'Tháng 2' },
  { value: '03', label: 'Tháng 3' },
  { value: '04', label: 'Tháng 4' },
  { value: '05', label: 'Tháng 5' },
  { value: '06', label: 'Tháng 6' },
  { value: '07', label: 'Tháng 7' },
  { value: '08', label: 'Tháng 8' },
  { value: '09', label: 'Tháng 9' },
  { value: '10', label: 'Tháng 10' },
  { value: '11', label: 'Tháng 11' },
  { value: '12', label: 'Tháng 12' },
];

export const AVAILABLE_YEARS = ['2026', '2025'];

export const MONTHS_META = {
  '2026-08': { status: 'Đã chốt (31 ngày)' },
  '2026-09': { status: 'Đã chốt' },
  '2026-10': { status: 'Đã chốt (31 ngày)' },
  '2026-11': { status: 'Đang chạy' },
};

export const CHRONOLOGICAL_MONTH_KEYS = ['2026-08', '2026-09', '2026-10', '2026-11'];

/**
 * Định dạng số tiền sang định dạng VNĐ (VD: 9.000.000đ)
 */
export const formatVND = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + 'đ';
};

/**
 * Chuyển tên tiếng Việt có dấu thành chuỗi không dấu an toàn cho tên file
 */
export const toPlainAsciiName = (str) => {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Lấy danh sách các ngày trong tháng (1 -> 28/29/30/31) kèm thứ trong tuần
 */
export const getDaysInMonth = (monthKey) => {
  const [year, month] = monthKey.split('-').map(Number);
  const totalDays = new Date(year, month, 0).getDate();
  const days = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  for (let d = 1; d <= totalDays; d++) {
    const dateObj = new Date(year, month - 1, d);
    const mondayBasedIndex = (dateObj.getDay() + 6) % 7; // T2 = 0 ... CN = 6
    days.push({
      day: d,
      weekday: dayNames[dateObj.getDay()],
      mondayBasedIndex,
      isSunday: dateObj.getDay() === 0,
      dateStr: `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`,
    });
  }
  return days;
};

/**
 * Sinh chuỗi slug ngẫu nhiên an toàn cho link truy cập riêng của nhân viên
 */
export const generateRandomSlug = (name) => {
  const cleanName = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${cleanName || 'nv'}-${rand}`;
};

/**
 * Hàm tạo dữ liệu chấm công mẫu
 */
export const buildAttendanceMap = (totalDays, targetWorkDays, maxActiveDay = totalDays) => {
  const map = {};
  if (targetWorkDays <= 0) return map;

  if (targetWorkDays >= maxActiveDay) {
    for (let d = 1; d <= maxActiveDay; d++) {
      map[d] = 1;
    }
    return map;
  }

  let remaining = targetWorkDays;
  for (let d = 1; d <= maxActiveDay && remaining > 0; d++) {
    const availableDays = maxActiveDay - d + 1;
    if (remaining >= availableDays) {
      map[d] = 1;
      remaining -= 1;
    } else if (remaining >= 1) {
      if (d % 7 === 0 && availableDays - 1 >= remaining) {
        map[d] = 0;
      } else {
        map[d] = 1;
        remaining -= 1;
      }
    } else if (remaining === 0.5) {
      map[d] = 0.5;
      remaining = 0;
    }
  }
  if (remaining === 0.5) {
    for (let d = 1; d <= maxActiveDay; d++) {
      if (!map[d]) {
        map[d] = 0.5;
        break;
      }
    }
  }
  return map;
};

/**
 * Dữ liệu nhân sự mẫu ban đầu
 */
export const INITIAL_EMPLOYEES = [
  {
    id: 'thuy',
    name: 'Thúy',
    roleLabel: 'Quản lý xưởng & In ấn',
    baseSalary: 9000000,
    slug: 'thuy-x9a2k',
    active: true,
  },
  {
    id: 'lep',
    name: 'Lép',
    roleLabel: 'Kỹ thuật khung & Giao hàng',
    baseSalary: 7500000,
    slug: 'lep-m4p7q',
    active: true,
  },
  {
    id: 'duong',
    name: 'Dương',
    roleLabel: 'Gia công khung & Đóng gói',
    baseSalary: 7500000,
    slug: 'duong-k7m2x',
    active: true,
  },
  {
    id: 'ly',
    name: 'Ly',
    roleLabel: 'Hoàn thiện & Kiểm hàng',
    baseSalary: 6600000,
    slug: 'ly-r3w8n',
    active: true,
  },
  {
    id: 'linh',
    name: 'Linh',
    roleLabel: 'Phụ xưởng & Đóng gói',
    baseSalary: 6000000,
    slug: 'linh-v5t1z',
    active: true,
  },
];

export const HISTORICAL_BASE_SALARY = {
  '2026-08': {
    thuy: 9000000,
    lep: 7500000,
    duong: 7500000,
    ly: 6600000,
    linh: 6000000,
  },
  '2026-09': {
    thuy: 9000000,
    lep: 7500000,
    duong: 7500000,
    ly: 6600000,
    linh: 6000000,
  },
  '2026-10': {
    thuy: 9000000,
    lep: 7500000,
    duong: 7500000,
    ly: 6600000,
    linh: 6000000,
  },
  '2026-11': {
    thuy: 9000000,
    lep: 7500000,
    duong: 7500000,
    ly: 6600000,
    linh: 6000000,
  },
};

export const INITIAL_ATTENDANCE = {
  '2026-08': {
    thuy: buildAttendanceMap(31, 31, 31),
    lep: buildAttendanceMap(31, 28, 31),
    duong: buildAttendanceMap(31, 25, 31),
    ly: buildAttendanceMap(31, 24, 31),
    linh: buildAttendanceMap(31, 20, 31),
  },
  '2026-09': {
    thuy: buildAttendanceMap(30, 26, 30),
    lep: buildAttendanceMap(30, 25, 30),
    duong: buildAttendanceMap(30, 22, 30),
    ly: buildAttendanceMap(30, 24, 30),
    linh: buildAttendanceMap(30, 21, 30),
  },
  '2026-10': {
    thuy: buildAttendanceMap(31, 27, 31),
    lep: buildAttendanceMap(31, 24, 31),
    duong: buildAttendanceMap(31, 23, 31),
    ly: buildAttendanceMap(31, 26.5, 31),
    linh: buildAttendanceMap(31, 25, 31),
  },
  '2026-11': {
    thuy: buildAttendanceMap(30, 18, 20),
    lep: buildAttendanceMap(30, 17, 20),
    duong: {
      1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
      11: 1, 12: 0.5, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1,
    },
    ly: buildAttendanceMap(30, 18.5, 20),
    linh: buildAttendanceMap(30, 16, 20),
  },
};

export const INITIAL_ADVANCES = [
  { id: 'adv-1', month: '2026-08', employeeId: 'lep', date: '09/08', type: 'advance', amount: 2500000, note: 'Ứng lương đợt 1 tháng 8' },
  { id: 'adv-2', month: '2026-08', employeeId: 'duong', date: '20/08', type: 'advance', amount: 1500000, note: 'Ứng lương đợt 1 tháng 8' },
  { id: 'adv-3', month: '2026-08', employeeId: 'linh', date: '24/08', type: 'photo_fee', amount: 90000, note: 'Tiền in ảnh cá nhân tháng 8' },
  { id: 'adv-4', month: '2026-09', employeeId: 'thuy', date: '28/09', type: 'photo_fee', amount: 140000, note: 'Tiền in ảnh cá nhân tháng 9' },
  { id: 'adv-5', month: '2026-09', employeeId: 'lep', date: '26/09', type: 'advance', amount: 1500000, note: 'Ứng lương tháng 9' },
  { id: 'adv-6', month: '2026-09', employeeId: 'lep', date: '29/09', type: 'photo_fee', amount: 170000, note: 'Tiền ảnh tháng 9' },
  { id: 'adv-7', month: '2026-09', employeeId: 'duong', date: '22/09', type: 'advance', amount: 1500000, note: 'Ứng lương tháng 9' },
  { id: 'adv-8', month: '2026-09', employeeId: 'ly', date: '28/09', type: 'photo_fee', amount: 305000, note: 'Tiền ảnh tháng 9' },
  { id: 'adv-9', month: '2026-10', employeeId: 'thuy', date: '25/10', type: 'photo_fee', amount: 60000, note: 'Tiền ảnh lẻ tháng 10' },
  { id: 'adv-10', month: '2026-10', employeeId: 'duong', date: '18/10', type: 'advance', amount: 2000000, note: 'Ứng lương giữa tháng 10' },
  { id: 'adv-11', month: '2026-10', employeeId: 'linh', date: '21/10', type: 'advance', amount: 1000000, note: 'Ứng lương tháng 10' },
  { id: 'adv-12', month: '2026-11', employeeId: 'duong', date: '12/11', type: 'advance', amount: 2000000, note: 'Ứng lương tháng 11' },
  { id: 'adv-13', month: '2026-11', employeeId: 'linh', date: '14/11', type: 'photo_fee', amount: 85000, note: 'Tiền ảnh tháng 11' },
];

export const INITIAL_EXPENSES = [
  { id: 'exp-1', month: '2026-08', date: '05/08', employeeId: 'thuy', category: 'Vật tư xưởng', note: 'Keo 502, băng keo trong, đinh ghim khung', amount: 529000, reimburse: true },
  { id: 'exp-2', month: '2026-08', date: '14/08', employeeId: 'thuy', category: 'Cước vận chuyển', note: 'Cước xe nhận phôi khung từ kho', amount: 480000, reimburse: true },
  { id: 'exp-3', month: '2026-08', date: '24/08', employeeId: 'thuy', category: 'Đổ xăng', note: 'Đổ xăng xe giao hàng nội thành', amount: 220000, reimburse: true },
  { id: 'exp-4', month: '2026-08', date: '29/08', employeeId: 'thuy', category: 'Ăn uống', note: 'Nước uống & ăn nhẹ tăng ca đóng hàng', amount: 180000, reimburse: true },
  { id: 'exp-5', month: '2026-09', date: '06/09', employeeId: 'thuy', category: 'Vật tư xưởng', note: 'Giấy in ảnh lụa & màng cán bóng', amount: 689000, reimburse: true },
  { id: 'exp-6', month: '2026-09', date: '15/09', employeeId: 'thuy', category: 'Đổ xăng', note: 'Đổ xăng đi gửi chành xe', amount: 250000, reimburse: true },
  { id: 'exp-7', month: '2026-09', date: '23/09', employeeId: 'thuy', category: 'Cước vận chuyển', note: 'Cước nhận kiện mika & nẹp khung', amount: 350000, reimburse: true },
  { id: 'exp-8', month: '2026-10', date: '04/10', employeeId: 'thuy', category: 'Vật tư xưởng', note: 'Mua 10 lọ keo 502, góc nhựa bảo vệ khung', amount: 644000, reimburse: true },
  { id: 'exp-9', month: '2026-10', date: '16/10', employeeId: 'thuy', category: 'Cước vận chuyển', note: 'Cước xe tải giao đơn sỉ khách sạn', amount: 650000, reimburse: true },
  { id: 'exp-10', month: '2026-10', date: '26/10', employeeId: 'thuy', category: 'Đổ xăng', note: 'Đổ xăng xe giao hàng tuần 4', amount: 280000, reimburse: true },
  { id: 'exp-11', month: '2026-11', date: '03/11', employeeId: 'thuy', category: 'Vật tư xưởng', note: 'Băng keo xốp 2 mặt & móc treo tranh', amount: 390000, reimburse: true },
  { id: 'exp-12', month: '2026-11', date: '10/11', employeeId: 'lep', category: 'Đổ xăng', note: 'Đổ xăng xe máy đi giao tranh khách lẻ', amount: 120000, reimburse: true },
  { id: 'exp-13', month: '2026-11', date: '17/11', employeeId: 'thuy', category: 'Đổ xăng', note: 'Đổ xăng giao hàng & lấy vật tư', amount: 150000, reimburse: true },
  { id: 'exp-14', month: '2026-11', date: '18/11', employeeId: 'fund', category: 'Ăn uống', note: 'Liên hoan nhẹ giữa tháng từ quỹ xưởng', amount: 320000, reimburse: false },
];

/**
 * Công thức tính lương chuẩn 30 ngày công:
 * - dayRate = baseSalary / 30
 * - basePayByDays = dayRate * totalDays (tháng 31 ngày làm đủ 31 công sẽ > baseSalary)
 * - netSalary = basePayByDays - totalAdvances - totalPhotoFee + totalReimbursements
 */
export const calculateEmployeeMonthPayroll = (
  emp,
  monthKey,
  attendanceData = {},
  advancesList = [],
  expensesList = []
) => {
  if (!emp) {
    return {
      baseSalary: 0,
      dayRate: 0,
      totalDays: 0,
      basePayByDays: 0,
      empAdvances: [],
      totalAdvances: 0,
      empPhotoFees: [],
      totalPhotoFee: 0,
      empReimbursements: [],
      totalReimbursements: 0,
      netSalary: 0,
      attendanceMap: {},
    };
  }

  const monthAtt = attendanceData[monthKey]?.[emp.id] || {};
  const totalDays = Object.values(monthAtt).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const histSalary = HISTORICAL_BASE_SALARY[monthKey]?.[emp.id];
  const baseSalary = histSalary !== undefined ? histSalary : emp.baseSalary;

  const dayRate = baseSalary / STANDARD_WORK_DAYS;
  const basePayByDays = Math.round(dayRate * totalDays);

  const empAdvances = advancesList.filter(
    (a) => a.month === monthKey && a.employeeId === emp.id && a.type === 'advance'
  );
  const totalAdvances = empAdvances.reduce((sum, a) => sum + a.amount, 0);

  const empPhotoFees = advancesList.filter(
    (a) => a.month === monthKey && a.employeeId === emp.id && a.type === 'photo_fee'
  );
  const totalPhotoFee = empPhotoFees.reduce((sum, a) => sum + a.amount, 0);

  const empReimbursements = expensesList.filter(
    (e) => e.month === monthKey && e.employeeId === emp.id && e.reimburse
  );
  const totalReimbursements = empReimbursements.reduce((sum, e) => sum + e.amount, 0);

  const netSalary = basePayByDays - totalAdvances - totalPhotoFee + totalReimbursements;

  return {
    baseSalary,
    dayRate,
    totalDays,
    basePayByDays,
    empAdvances,
    totalAdvances,
    empPhotoFees,
    totalPhotoFee,
    empReimbursements,
    totalReimbursements,
    netSalary,
    attendanceMap: monthAtt,
  };
};

