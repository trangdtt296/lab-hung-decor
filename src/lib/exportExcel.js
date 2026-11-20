/**
 * src/lib/exportExcel.js
 * Hàm xuất bảng lương xưởng và bảng lương nhân viên sang định dạng Excel (.xlsx) chuẩn SheetJS
 */
import * as XLSX from 'xlsx';
import {
  getDaysInMonth,
  calculateEmployeeMonthPayroll,
  toPlainAsciiName,
  CHRONOLOGICAL_MONTH_KEYS,
} from './payroll';

/**
 * Tạo mảng 2 chiều (Array of Arrays) cho sheet bảng lương xưởng 1 tháng
 */
export const buildWorkshopMonthSheetAOA = (
  monthKey,
  employees = [],
  attendance = {},
  advances = [],
  expenses = []
) => {
  const [yr, mo] = monthKey.split('-');
  const monthNum = Number(mo);
  const days = getDaysInMonth(monthKey);
  const staffList = employees;

  const maxRows = 120;
  const grid = Array.from({ length: maxRows }, () => Array(days.length + 5).fill(''));

  grid[0][0] = `BẢNG LƯƠNG THÁNG ${monthNum}/${yr} (CÔNG CHUẨN 30 NGÀY)`;

  grid[1][0] = 'Họ và tên';
  days.forEach((d, idx) => {
    grid[1][idx + 1] = `${d.day} ${d.weekday}`;
  });
  const totalColIdx = days.length + 1;
  grid[1][totalColIdx] = 'Tổng công (ngày)';

  staffList.forEach((emp, sIdx) => {
    const r = 2 + sIdx;
    const calc = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
    grid[r][0] = emp.name;
    days.forEach((d, dIdx) => {
      const val = calc.attendanceMap[d.day] || 0;
      grid[r][dIdx + 1] = val === 1 ? '+' : val === 0.5 ? '-' : '';
    });
    grid[r][totalColIdx] = calc.totalDays;
  });

  const startLowerRow = 2 + staffList.length + 2;

  let leftRow = startLowerRow;
  let sumMonthlyActualPaid = 0;
  let sumMonthlyAdvances = 0;

  staffList.forEach((emp) => {
    const calc = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
    const salaryBeforeDeductions = calc.basePayByDays;
    const netSalaryOnlyWork = calc.basePayByDays - calc.totalAdvances - calc.totalPhotoFee;
    const salaryPlusReimbursement = calc.netSalary;

    sumMonthlyActualPaid += salaryPlusReimbursement;
    sumMonthlyAdvances += calc.totalAdvances;

    grid[leftRow][0] = emp.name.toUpperCase();
    grid[leftRow][1] = 'Mức lương CB (VND)';
    grid[leftRow][2] = calc.baseSalary;
    leftRow++;

    grid[leftRow][1] = 'Lương 1 ngày (CB/30)';
    grid[leftRow][2] = Math.round(calc.dayRate);
    leftRow++;

    grid[leftRow][1] = 'Lương theo công (VND)';
    grid[leftRow][2] = salaryBeforeDeductions;
    leftRow++;

    if (calc.totalReimbursements > 0) {
      grid[leftRow][1] = 'Chi Tiêu hoàn lại (VND)';
      grid[leftRow][2] = calc.totalReimbursements;
      leftRow++;
    }

    if (calc.totalAdvances > 0 || calc.empAdvances.length > 0) {
      grid[leftRow][1] = 'Ứng lương (VND)';
      grid[leftRow][2] = calc.totalAdvances;
      leftRow++;
      calc.empAdvances.forEach((adv) => {
        grid[leftRow][1] = `  • ${adv.date} (${adv.note})`;
        grid[leftRow][2] = adv.amount;
        leftRow++;
      });
    }

    if (calc.totalPhotoFee > 0) {
      grid[leftRow][1] = 'Tiền ảnh (VND)';
      grid[leftRow][2] = calc.totalPhotoFee;
      leftRow++;
    }

    grid[leftRow][1] = 'Lương thực nhận (VND)';
    grid[leftRow][2] = netSalaryOnlyWork;
    leftRow++;

    if (calc.totalReimbursements > 0) {
      grid[leftRow][1] = 'Lương + Chi tiêu (VND)';
      grid[leftRow][2] = salaryPlusReimbursement;
      leftRow++;
    }

    leftRow++;
  });

  grid[leftRow][0] = 'TỔNG CHI 1 THÁNG';
  grid[leftRow][2] = sumMonthlyActualPaid;
  leftRow++;

  grid[leftRow][0] = 'Tổng lương ứng';
  grid[leftRow][2] = sumMonthlyAdvances;
  leftRow++;

  grid[leftRow][0] = 'Tổng chi còn lại';
  grid[leftRow][2] = sumMonthlyActualPaid - sumMonthlyAdvances;
  leftRow++;

  const expColStart = 4;
  let midRow = startLowerRow;
  grid[midRow][expColStart] = 'BẢNG CHI TIÊU';
  midRow++;

  grid[midRow][expColStart] = 'Họ tên';
  grid[midRow][expColStart + 1] = 'Ngày';
  grid[midRow][expColStart + 2] = 'Ghi chú';
  grid[midRow][expColStart + 3] = 'VND';
  midRow++;

  const monthExps = expenses.filter((e) => e.month === monthKey);
  const spenderGroups = [
    ...staffList.map((s) => ({ id: s.id, name: s.name })),
    { id: 'fund', name: 'Quỹ chung' },
  ];

  let grandTotalExpense = 0;
  spenderGroups.forEach((grp) => {
    const grpItems = monthExps.filter((e) => e.employeeId === grp.id);
    if (grpItems.length === 0) return;

    let grpSubtotal = 0;
    grpItems.forEach((item, idx) => {
      grid[midRow][expColStart] = idx === 0 ? grp.name : '';
      grid[midRow][expColStart + 1] = item.date;
      grid[midRow][expColStart + 2] = item.note;
      grid[midRow][expColStart + 3] = item.amount;
      grpSubtotal += item.amount;
      grandTotalExpense += item.amount;
      midRow++;
    });

    grid[midRow][expColStart + 2] = `Tổng (${grp.name})`;
    grid[midRow][expColStart + 3] = grpSubtotal;
    midRow++;
  });

  grid[midRow][expColStart + 2] = 'Tổng';
  grid[midRow][expColStart + 3] = grandTotalExpense;
  midRow++;

  const fuelColStart = 9;
  let rightRow = startLowerRow;
  grid[rightRow][fuelColStart] = 'Bảng theo dõi đổ xăng';
  rightRow++;

  grid[rightRow][fuelColStart] = 'Ngày';
  grid[rightRow][fuelColStart + 1] = 'VND';
  rightRow++;

  const fuelItems = monthExps.filter((e) => e.category === 'Đổ xăng');
  let totalFuelAmount = 0;
  fuelItems.forEach((f) => {
    grid[rightRow][fuelColStart] = f.date;
    grid[rightRow][fuelColStart + 1] = f.amount;
    totalFuelAmount += f.amount;
    rightRow++;
  });

  grid[rightRow][fuelColStart] = 'Tổng';
  grid[rightRow][fuelColStart + 1] = totalFuelAmount;
  rightRow++;

  const usedRows = Math.max(leftRow, midRow, rightRow) + 2;
  return grid.slice(0, usedRows);
};

/**
 * Xuất file Excel toàn xưởng (1 tháng hoặc tất cả các tháng)
 */
export const exportWorkshopExcel = async (
  mode = 'single',
  selectedMonth,
  employees = [],
  attendance = {},
  advances = [],
  expenses = []
) => {
  const wb = XLSX.utils.book_new();
  const targetMonths = mode === 'all' ? CHRONOLOGICAL_MONTH_KEYS : [selectedMonth];

  targetMonths.forEach((mKey) => {
    const [, mo] = mKey.split('-');
    const aoa = buildWorkshopMonthSheetAOA(mKey, employees, attendance, advances, expenses);
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    const daysCount = getDaysInMonth(mKey).length;
    const cols = [{ wch: 22 }];
    for (let i = 0; i < daysCount; i++) {
      cols.push({ wch: 6.5 });
    }
    cols.push({ wch: 16 });
    ws['!cols'] = cols;

    const sheetTitle = `Tháng ${Number(mo)}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  });

  const fileName =
    mode === 'all'
      ? 'Bang_Luong_Lab_Hung_Decor_2026.xlsx'
      : `Bang_Luong_Lab_Hung_Decor_T${Number(selectedMonth.split('-')[1])}_${selectedMonth.split('-')[0]}.xlsx`;

  XLSX.writeFile(wb, fileName);
  return fileName;
};

/**
 * Xuất file Excel cá nhân của 1 nhân viên
 */
export const exportEmployeeExcel = async (
  emp,
  selectedMonth,
  attendance = {},
  advances = [],
  expenses = []
) => {
  const wb = XLSX.utils.book_new();
  const aoa = [];

  const monthsToStack = [...CHRONOLOGICAL_MONTH_KEYS];
  if (!monthsToStack.includes(selectedMonth)) {
    monthsToStack.push(selectedMonth);
  }

  monthsToStack.forEach((mKey) => {
    const [yr, mo] = mKey.split('-');
    const monthNum = Number(mo);
    const days = getDaysInMonth(mKey);
    const calc = calculateEmployeeMonthPayroll(emp, mKey, attendance, advances, expenses);

    aoa.push([`BẢNG LƯƠNG THÁNG ${monthNum}/${yr}`]);

    const headerRow = ['Họ và tên'];
    days.forEach((d) => headerRow.push(`${d.day} ${d.weekday}`));
    headerRow.push(
      'Tổng công (ngày)',
      'Mức lương CB (VND)',
      'Lương theo công (VND)',
      'Lương thực nhận (VND)'
    );
    aoa.push(headerRow);

    const dataRow = [emp.name];
    days.forEach((d) => {
      const val = calc.attendanceMap[d.day] || 0;
      dataRow.push(val === 1 ? '+' : val === 0.5 ? '-' : '');
    });
    dataRow.push(calc.totalDays, calc.baseSalary, calc.basePayByDays, calc.netSalary);
    aoa.push(dataRow);

    const subHeaderRow = ['Tiền ảnh', 'Ứng lương'];
    const subValueRow = [
      calc.totalPhotoFee > 0 ? calc.totalPhotoFee : '',
      calc.totalAdvances > 0 ? calc.totalAdvances : '',
    ];

    if (calc.totalReimbursements > 0) {
      subHeaderRow.push('Hoàn chi tiêu');
      subValueRow.push(calc.totalReimbursements);
    }

    aoa.push(subHeaderRow);
    aoa.push(subValueRow);

    aoa.push([]);
    aoa.push([]);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  const cols = [{ wch: 16 }];
  for (let i = 0; i < 31; i++) {
    cols.push({ wch: 6.5 });
  }
  cols.push({ wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 22 });
  ws['!cols'] = cols;

  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const fileName = `Bang_Luong_${toPlainAsciiName(emp.name)}.xlsx`;
  XLSX.writeFile(wb, fileName);
  return fileName;
};

