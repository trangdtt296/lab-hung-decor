/**
 * src/lib/exportExcel.js
 * Xuất bảng lương ra .xlsx có định dạng (màu, viền, gộp ô, công thức) theo đúng mẫu Google Sheets
 * của Lab Hung Decor.
 *
 *  - Bảng lương cá nhân (gửi nhân viên): các tháng xếp chồng, mỗi tháng = tiêu đề + header đỏ +
 *    dòng chấm công + nhãn tím "Tiền ảnh | Ứng lương".
 *  - Bảng lương tổng (chỉ admin): mỗi tháng 1 sheet = bảng chấm công cả xưởng, bên dưới là
 *    khối lương từng người (trái), BẢNG CHI TIÊU (giữa), Bảng theo dõi đổ xăng (phải) và tổng kết.
 *
 * Phần dựng workbook (build*) tách riêng khỏi phần tải file (export*) để test được trên Node.
 */
import {
  getDaysInMonth,
  calculateEmployeeMonthPayroll,
  getMonthKeysWithData,
  parseMonthKey,
  toPlainAsciiName,
  attendanceMark,
  STANDARD_WORK_DAYS,
  NET_SALARY_ROUNDING,
} from './payroll';

/* --------------------------------- Bố cục --------------------------------- */

const MAX_DAYS = 31;
const COL = {
  NAME: 1, // A
  DAY_START: 2, // B..AF
  TOTAL_DAYS: 2 + MAX_DAYS, // AG
  SALARY: 3 + MAX_DAYS, // AH (chỉ bảng cá nhân)
  NET: 4 + MAX_DAYS, // AI (chỉ bảng cá nhân)
};

// Khu vực bên dưới bảng tổng — gộp các cột ngày hẹp (3.88) lại cho đủ rộng, giống file mẫu
const BLOCK = { LABEL: [1, 3], VALUE: [4, 6], ADV_LABEL: 1, ADV_DAY_TITLE: 2, ADV_DATE: 3 }; // A:F
const EXPENSE = { NAME: [8, 9], DATE: [10, 11], NOTE: [12, 15], AMOUNT: [16, 18] }; // H:R
const FUEL = { DATE: [20, 21], AMOUNT: [22, 24] }; // T:X
const NOTE_CHARS_PER_LINE = 18; // cột "Ghi chú" rộng ~4 cột ngày

const COLORS = {
  BLACK: 'FF000000',
  WHITE: 'FFFFFFFF',
  // Bảng chấm công (cả 2 file)
  HEADER: 'FFFF0000',
  NAME: 'FFF6B26B',
  LABEL_PURPLE: 'FF9900FF',
  // Khối lương từng người (bảng tổng)
  BLOCK_TITLE: 'FFBF9000',
  LABEL_BLUE: 'FF6D9EEB',
  PHOTO: 'FFFF9900',
  DATE_BLUE: 'FFA4C2F4',
  PAYABLE: 'FF5B0F00',
  // Bảng chi tiêu & đổ xăng
  EXPENSE_TITLE: 'FF93C47D',
  EXPENSE_HEAD: 'FF6FA8DC',
  FUEL_HEAD: 'FF9FC5E8',
  FUEL_TOTAL: 'FFF1C232',
  // Tổng kết
  SUM_TOTAL: 'FFD5A6BD',
  SUM_TOTAL_TEXT: 'FFFF0000',
  SUM_ADVANCE: 'FFFFFF00',
  SUM_ADVANCE_TEXT: 'FFFF00FF',
  SUM_REMAIN: 'FFE06666',
};
// Màu cột "Họ tên" của từng nhóm trong BẢNG CHI TIÊU (theo thứ tự nhân viên, lặp lại nếu nhiều hơn)
const GROUP_COLORS = ['FF8E7CC3', 'FFF1C232', 'FFCC0000', 'FF6AA84F', 'FFE69138', 'FF3D85C6', 'FFC27BA0', 'FF45818E'];

const FONT_NAME = 'Arial';
const MONEY_FMT = '#,##0';
const THIN = { style: 'thin', color: { argb: COLORS.BLACK } };
const BORDER_ALL = { top: THIN, left: THIN, bottom: THIN, right: THIN };
const ROUND_DIGITS = -Math.round(Math.log10(NET_SALARY_ROUNDING));
const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/* ------------------------------ Tiện ích ô -------------------------------- */

const colLetter = (col) => {
  let s = '';
  for (let n = col; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  }
  return s;
};
const ref = (col, row) => `${colLetter(col)}${row}`;
const formula = (expr, result) => ({ formula: expr, result });

/** Sắp xếp theo ngày 'DD/MM' tăng dần (giữ thứ tự nhập nếu trùng ngày) */
const dateKey = (date) => {
  const [d = 0, m = 0] = String(date || '').split('/').map(Number);
  return m * 100 + d;
};
const sortByDate = (items) => [...items].sort((a, b) => dateKey(a.date) - dateKey(b.date));
/** '05/09' → '5/9' (giống cách ghi ngày trong file mẫu) */
const shortDate = (date) => {
  if (!date) return null;
  const [d, m] = String(date).split('/');
  return m ? `${Number(d)}/${Number(m)}` : date;
};
const blankIfZero = (n) => (n ? n : null);

/**
 * Ghi giá trị + style vào 1 ô hoặc 1 vùng (tự gộp ô). Style áp cho mọi ô trong vùng
 * để viền hiển thị đủ ở cả Excel lẫn Google Sheets.
 * @param range [row, col] | [row, col, toRow, toCol]
 */
const put = (ws, [row, col, toRow = row, toCol = col], value, style = {}) => {
  const {
    fill, color = COLORS.BLACK, bold, size = 10, numFmt, align = 'center', valign = 'middle',
    wrap, rotate, border = true,
  } = style;
  for (let r = row; r <= toRow; r++) {
    for (let c = col; c <= toCol; c++) {
      const cell = ws.getCell(r, c);
      cell.font = { name: FONT_NAME, size, bold: Boolean(bold), color: { argb: color } };
      cell.alignment = { horizontal: align, vertical: valign, wrapText: Boolean(wrap), textRotation: rotate };
      if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
      if (numFmt) cell.numFmt = numFmt;
      if (border) cell.border = BORDER_ALL;
    }
  }
  if (toRow > row || toCol > col) ws.mergeCells(row, col, toRow, toCol);
  ws.getCell(row, col).value = value ?? null;
};
/** Ghi vào 1 cụm cột [from, to] trên 1 dòng */
const putCols = (ws, row, [from, to], value, style) => put(ws, [row, from, row, to], value, style);

const ensureRowHeight = (ws, row, height) => {
  const r = ws.getRow(row);
  if (!r.height || r.height < height) r.height = height;
};

const setupColumns = (ws, { nameWidth, extraCols }) => {
  ws.getColumn(COL.NAME).width = nameWidth;
  for (let c = COL.DAY_START; c < COL.DAY_START + MAX_DAYS; c++) ws.getColumn(c).width = 3.88;
  extraCols.forEach((c) => (ws.getColumn(c).width = 12.63));
  ws.properties.defaultRowHeight = 15.75;
  ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
};

/* ----------------------------- Bảng chấm công ----------------------------- */

/**
 * Tiêu đề + header đỏ (gộp 2 dòng) + mỗi nhân viên 1 dòng: tên (nền cam), ký hiệu +/- từng ngày,
 * "Tổng công" = SUMPRODUCT như file mẫu. `extraHeaders` là các cột thêm sau "Tổng công".
 * @returns { dataRows, nextRow }
 */
const writeAttendanceTable = (ws, startRow, monthKey, rows, { extraHeaders = [], writeExtra } = {}) => {
  const { year, month } = parseMonthKey(monthKey);
  const days = getDaysInMonth(monthKey);
  const lastCol = COL.TOTAL_DAYS + extraHeaders.length;

  put(ws, [startRow, 1, startRow + 1, lastCol], `BẢNG LƯƠNG THÁNG ${month}/${year}`, { size: 14, border: false });

  const headerRow = startRow + 2;
  const header = (col, text) => put(ws, [headerRow, col, headerRow + 1, col], text, { fill: COLORS.HEADER, wrap: true });
  header(COL.NAME, 'Họ và tên');
  for (let i = 0; i < MAX_DAYS; i++) {
    const d = days[i];
    header(COL.DAY_START + i, d ? `${d.day} ${d.weekday}` : '');
  }
  header(COL.TOTAL_DAYS, 'Tổng công ( ngày)');
  extraHeaders.forEach((text, i) => header(COL.TOTAL_DAYS + 1 + i, text));

  const firstDataRow = headerRow + 2;
  const dataRows = rows.map((item, idx) => {
    const r = firstDataRow + idx;
    put(ws, [r, COL.NAME], item.name, { fill: COLORS.NAME });
    for (let i = 0; i < MAX_DAYS; i++) {
      const d = days[i];
      put(ws, [r, COL.DAY_START + i], d ? attendanceMark(item.calc.attendanceMap[d.day]) || null : null);
    }
    const dayRange = `${ref(COL.DAY_START, r)}:${ref(COL.DAY_START + MAX_DAYS - 1, r)}`;
    put(ws, [r, COL.TOTAL_DAYS],
      formula(`SUMPRODUCT((${dayRange}="+")*1)+SUMPRODUCT((${dayRange}="-")*0.5)`, item.calc.totalDays));
    writeExtra?.(r, item);
    return r;
  });

  return { dataRows, nextRow: firstDataRow + rows.length };
};

/** ROUND((lương/30)*công − khấu trừ…, -3) */
const netExpr = (salaryRef, daysRef, minusRefs) =>
  `ROUND((${salaryRef}/${STANDARD_WORK_DAYS})*${daysRef}${minusRefs.map((x) => `-${x}`).join('')},${ROUND_DIGITS})`;

/* --------------------------- Bảng lương cá nhân --------------------------- */

export const buildEmployeeWorkbook = (ExcelJS, emp, monthKeys, attendance, advances, expenses) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Lab Hung Decor';
  const ws = wb.addWorksheet('Sheet1');
  setupColumns(ws, { nameWidth: 12.63, extraCols: [COL.TOTAL_DAYS, COL.SALARY, COL.NET] });

  let row = 1;
  monthKeys.forEach((monthKey) => {
    const calc = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
    const hasReimburse = calc.totalReimbursements > 0;
    const dataRow = row + 4;
    const labelRow = dataRow + 1;
    const valueRow = dataRow + 2;
    const photoRef = ref(COL.TOTAL_DAYS, valueRow);
    const advanceRef = ref(COL.SALARY, valueRow);
    const reimburseRef = ref(COL.NET, valueRow);

    writeAttendanceTable(ws, row, monthKey, [{ name: emp.name, calc }], {
      extraHeaders: ['Mức lương (VND)', 'Lương thực nhận (VND)'],
      writeExtra: (r) => {
        put(ws, [r, COL.SALARY], calc.baseSalary, { numFmt: MONEY_FMT });
        const net = netExpr(ref(COL.SALARY, r), ref(COL.TOTAL_DAYS, r), [advanceRef, photoRef]);
        put(ws, [r, COL.NET], formula(hasReimburse ? `${net}+${reimburseRef}` : net, calc.netSalary), { numFmt: MONEY_FMT });
      },
    });

    const label = { fill: COLORS.LABEL_PURPLE };
    put(ws, [labelRow, COL.TOTAL_DAYS], 'Tiền ảnh', label);
    put(ws, [labelRow, COL.SALARY], 'Ứng lương', label);
    put(ws, [valueRow, COL.TOTAL_DAYS], blankIfZero(calc.totalPhotoFee), { numFmt: MONEY_FMT });
    put(ws, [valueRow, COL.SALARY], blankIfZero(calc.totalAdvances), { numFmt: MONEY_FMT });
    if (hasReimburse) {
      put(ws, [labelRow, COL.NET], 'Chi tiêu', label);
      put(ws, [valueRow, COL.NET], calc.totalReimbursements, { numFmt: MONEY_FMT });
    }
    row = valueRow + 2;
  });

  return wb;
};

/* ---------------------------- Bảng lương tổng ----------------------------- */

const ADVANCE_MIN_ROWS = 3; // khối "Ứng lương" luôn có ít nhất 3 dòng ngày như mẫu
const EXPENSE_MIN_ROWS = 3;
const FUEL_MIN_ROWS = 8;

const valueRef = (row) => ref(BLOCK.VALUE[0], row);
const blockLabel = (ws, row, text, fill = COLORS.LABEL_BLUE) => putCols(ws, row, BLOCK.LABEL, text, { fill });
const blockValue = (ws, row, value, style = {}) => putCols(ws, row, BLOCK.VALUE, value, { numFmt: MONEY_FMT, ...style });
const payableStyle = { fill: COLORS.PAYABLE, color: COLORS.WHITE, bold: true, size: 12 };

/**
 * Khối lương 1 nhân viên (A:F):
 * TÊN (vàng đậm) → Mức lương → [Chi Tiêu] → [Ứng lương + cột Ngày] → [Tiền ảnh]
 * → Lương thực nhận → [Lương + Chi tiêu]. Số cuối cùng (thực trả) nền nâu đỏ.
 * @returns { nextRow, advanceRefs, payableRef }
 */
const writeEmployeeBlock = (ws, startRow, { emp, calc, tableRow }) => {
  let row = startRow;
  putCols(ws, row++, [BLOCK.LABEL[0], BLOCK.VALUE[1]], emp.name.toUpperCase(),
    { fill: COLORS.BLOCK_TITLE, color: COLORS.WHITE, bold: true, size: 11 });

  const salaryRow = row++;
  blockLabel(ws, salaryRow, 'Mức lương (VND)');
  blockValue(ws, salaryRow, blankIfZero(calc.baseSalary));

  const hasReimburse = calc.totalReimbursements > 0;
  let reimburseRow = null;
  if (hasReimburse) {
    reimburseRow = row++;
    blockLabel(ws, reimburseRow, 'Chi Tiêu (VND)');
    blockValue(ws, reimburseRow, calc.totalReimbursements);
  }

  const advanceRefs = [];
  const empAdvances = sortByDate(calc.empAdvances);
  if (empAdvances.length) {
    const count = Math.max(empAdvances.length, ADVANCE_MIN_ROWS);
    const first = row;
    const last = row + count - 1;
    put(ws, [first, BLOCK.ADV_LABEL, last, BLOCK.ADV_LABEL], 'Ứng lương (VND)', { fill: COLORS.LABEL_BLUE, wrap: true });
    put(ws, [first, BLOCK.ADV_DAY_TITLE, last, BLOCK.ADV_DAY_TITLE], 'Ngày', { fill: COLORS.DATE_BLUE, rotate: 90 });
    for (let i = 0; i < count; i++) {
      const adv = empAdvances[i];
      put(ws, [row, BLOCK.ADV_DATE], shortDate(adv?.date), { fill: COLORS.DATE_BLUE });
      blockValue(ws, row, adv?.amount ?? null);
      advanceRefs.push(valueRef(row));
      row++;
    }
  }

  let photoRow = null;
  if (calc.totalPhotoFee > 0) {
    photoRow = row++;
    blockLabel(ws, photoRow, 'Tiền ảnh (VND)', COLORS.PHOTO);
    blockValue(ws, photoRow, calc.totalPhotoFee);
  }

  const netRow = row++;
  const minus = [
    ...(advanceRefs.length ? [`SUM(${advanceRefs[0]}:${advanceRefs[advanceRefs.length - 1]})`] : []),
    ...(photoRow ? [valueRef(photoRow)] : []),
  ];
  blockLabel(ws, netRow, 'Lương thực nhận (VND)');
  blockValue(ws, netRow, formula(netExpr(valueRef(salaryRow), ref(COL.TOTAL_DAYS, tableRow), minus), calc.netWorkSalary),
    hasReimburse ? {} : payableStyle);

  let payableRef = valueRef(netRow);
  if (hasReimburse) {
    const totalRow = row++;
    blockLabel(ws, totalRow, 'Lương + Chi tiêu (VND)');
    blockValue(ws, totalRow, formula(`${valueRef(netRow)}+${valueRef(reimburseRow)}`, calc.netSalary), payableStyle);
    payableRef = valueRef(totalRow);
  }

  return { nextRow: row + 1, advanceRefs, payableRef };
};

/** TỔNG CHI 1 THÁNG = thực trả + đã ứng; Tổng chi còn lại = TỔNG CHI − ứng */
const writeSummary = (ws, startRow, payableRefs, advanceRefs, totals) => {
  const value = [2, BLOCK.VALUE[1]]; // B:F (ô gốc ở cột B)
  const valueAt = (r) => ref(value[0], r);
  const advExpr = advanceRefs.length ? `SUM(${advanceRefs.join(',')})` : '0';
  const rows = [
    {
      label: 'TỔNG CHI 1 THÁNG',
      labelStyle: { fill: COLORS.SUM_TOTAL, bold: true, size: 11 },
      value: formula(`SUM(${payableRefs.join(',')})+${advExpr}`, totals.payable + totals.advances),
      valueStyle: { color: COLORS.SUM_TOTAL_TEXT, bold: true, size: 18 },
    },
    {
      label: 'Tổng lương ứng',
      labelStyle: { fill: COLORS.SUM_ADVANCE, color: COLORS.SUM_ADVANCE_TEXT, bold: true },
      value: formula(advExpr, totals.advances),
      valueStyle: { bold: true, size: 12 },
    },
    {
      label: 'Tổng chi còn lại',
      labelStyle: { fill: COLORS.SUM_REMAIN, bold: true, size: 12 },
      value: formula(`${valueAt(startRow)}-${valueAt(startRow + 1)}`, totals.payable),
      valueStyle: { bold: true, size: 18 },
    },
  ];
  rows.forEach(({ label, labelStyle, value: v, valueStyle }, i) => {
    const r = startRow + i;
    ensureRowHeight(ws, r, 30);
    put(ws, [r, COL.NAME], label, { ...labelStyle, wrap: true });
    putCols(ws, r, value, v, { numFmt: MONEY_FMT, ...valueStyle });
  });
};

/** Tách khoảng trống dòng theo độ dài ghi chú (ô gộp không tự giãn dòng trong Excel) */
const noteRowHeight = (text) => 15.75 * Math.max(1, Math.ceil(String(text || '').length / NOTE_CHARS_PER_LINE));

/** BẢNG CHI TIÊU (H:R) nhóm theo người mua; ngày trùng liên tiếp được gộp ô như mẫu */
const writeExpenseTable = (ws, startRow, employees, monthExpenses) => {
  let row = startRow;
  putCols(ws, row++, [EXPENSE.NAME[0], EXPENSE.AMOUNT[1]], 'BẢNG CHI TIÊU', { fill: COLORS.EXPENSE_TITLE, bold: true });
  putCols(ws, row, EXPENSE.NAME, 'Họ tên', { bold: true });
  putCols(ws, row, EXPENSE.DATE, 'Ngày', { bold: true, fill: COLORS.EXPENSE_HEAD });
  putCols(ws, row, EXPENSE.NOTE, 'Ghi chú', { bold: true, fill: COLORS.EXPENSE_HEAD });
  putCols(ws, row++, EXPENSE.AMOUNT, 'VND', { bold: true, fill: COLORS.EXPENSE_HEAD });

  const knownIds = new Set(employees.map((e) => e.id));
  const sorted = sortByDate(monthExpenses);
  const groups = [
    ...employees.map((e) => ({ name: e.name, items: sorted.filter((x) => x.employeeId === e.id) })),
    { name: 'Quỹ chung', items: sorted.filter((x) => x.employeeId === 'fund') },
    { name: 'Khác', items: sorted.filter((x) => x.employeeId !== 'fund' && !knownIds.has(x.employeeId)) },
  ].filter((g) => g.items.length);

  const subtotalRefs = [];
  groups.forEach(({ name, items }, gIdx) => {
    const groupColor = GROUP_COLORS[gIdx % GROUP_COLORS.length];
    const first = row;
    const count = Math.max(items.length, EXPENSE_MIN_ROWS);

    for (let i = 0; i < count; i++) {
      const item = items[i];
      putCols(ws, row, EXPENSE.NOTE, item ? item.note || item.category : null, { wrap: true });
      putCols(ws, row, EXPENSE.AMOUNT, item?.amount ?? null, { numFmt: MONEY_FMT });
      if (item) ensureRowHeight(ws, row, noteRowHeight(item.note || item.category));
      row++;
    }
    // Cột ngày: gộp các dòng liên tiếp cùng ngày
    for (let i = 0; i < count; ) {
      let j = i;
      while (items[i] && items[j + 1] && items[j + 1].date === items[i].date) j++;
      put(ws, [first + i, EXPENSE.DATE[0], first + j, EXPENSE.DATE[1]], shortDate(items[i]?.date));
      i = j + 1;
    }

    const subtotalRow = row++;
    put(ws, [first, EXPENSE.NAME[0], subtotalRow, EXPENSE.NAME[1]], name.toUpperCase(),
      { fill: groupColor, bold: true, rotate: 90 });
    putCols(ws, subtotalRow, [EXPENSE.DATE[0], EXPENSE.NOTE[1]], 'Tổng', { fill: groupColor, bold: true });
    putCols(ws, subtotalRow, EXPENSE.AMOUNT,
      formula(`SUM(${ref(EXPENSE.AMOUNT[0], first)}:${ref(EXPENSE.AMOUNT[0], subtotalRow - 1)})`,
        items.reduce((s, x) => s + x.amount, 0)),
      { fill: groupColor, bold: true, numFmt: MONEY_FMT });
    subtotalRefs.push(ref(EXPENSE.AMOUNT[0], subtotalRow));
  });

  ensureRowHeight(ws, row, 21);
  const grandStyle = { fill: COLORS.EXPENSE_HEAD, bold: true, size: 12 };
  putCols(ws, row, [EXPENSE.NAME[0], EXPENSE.NOTE[1]], 'Tổng', grandStyle);
  putCols(ws, row, EXPENSE.AMOUNT,
    subtotalRefs.length ? formula(`SUM(${subtotalRefs.join(',')})`, monthExpenses.reduce((s, x) => s + x.amount, 0)) : 0,
    { ...grandStyle, numFmt: MONEY_FMT });
  return row + 1;
};

/** Bảng theo dõi đổ xăng (T:X) — mọi khoản danh mục "Đổ xăng" trong tháng */
const writeFuelTable = (ws, startRow, monthExpenses) => {
  let row = startRow;
  putCols(ws, row++, [FUEL.DATE[0], FUEL.AMOUNT[1]], 'Bảng theo dõi đổ xăng', { bold: true });
  putCols(ws, row, FUEL.DATE, 'Ngày', { fill: COLORS.FUEL_HEAD });
  putCols(ws, row++, FUEL.AMOUNT, 'VND', { fill: COLORS.FUEL_HEAD });

  const items = sortByDate(monthExpenses.filter((x) => x.category === 'Đổ xăng'));
  const first = row;
  const count = Math.max(items.length, FUEL_MIN_ROWS);
  for (let i = 0; i < count; i++) {
    putCols(ws, row, FUEL.DATE, shortDate(items[i]?.date));
    putCols(ws, row++, FUEL.AMOUNT, items[i]?.amount ?? null, { numFmt: MONEY_FMT });
  }
  const totalStyle = { fill: COLORS.FUEL_TOTAL, bold: true };
  putCols(ws, row, FUEL.DATE, 'Tổng', totalStyle);
  putCols(ws, row, FUEL.AMOUNT,
    formula(`SUM(${ref(FUEL.AMOUNT[0], first)}:${ref(FUEL.AMOUNT[0], row - 1)})`, items.reduce((s, x) => s + x.amount, 0)),
    { ...totalStyle, numFmt: MONEY_FMT });
  return row + 1;
};

const addWorkshopMonthSheet = (wb, monthKey, employees, attendance, advances, expenses) => {
  const { month } = parseMonthKey(monthKey);
  const ws = wb.addWorksheet(`Tháng ${month}`);
  setupColumns(ws, { nameWidth: 12.63, extraCols: [COL.TOTAL_DAYS] });

  const items = employees.map((emp) => ({
    emp,
    calc: calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses),
  }));
  const { dataRows, nextRow } = writeAttendanceTable(ws, 1, monthKey, items.map((x) => ({ name: x.emp.name, calc: x.calc })));
  const lowerStart = nextRow + 1;

  let row = lowerStart;
  const payableRefs = [];
  const advanceRefs = [];
  items.forEach((item, idx) => {
    const res = writeEmployeeBlock(ws, row, { ...item, tableRow: dataRows[idx] });
    payableRefs.push(res.payableRef);
    advanceRefs.push(...res.advanceRefs);
    row = res.nextRow;
  });
  writeSummary(ws, row, payableRefs, advanceRefs, {
    payable: items.reduce((s, x) => s + x.calc.netSalary, 0),
    advances: items.reduce((s, x) => s + x.calc.totalAdvances, 0),
  });

  const monthExpenses = expenses.filter((e) => e.month === monthKey);
  writeExpenseTable(ws, lowerStart, employees, monthExpenses);
  writeFuelTable(ws, lowerStart, monthExpenses);
};

export const buildWorkshopWorkbook = (ExcelJS, monthKeys, employees, attendance, advances, expenses) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Lab Hung Decor';
  monthKeys.forEach((mKey) => addWorkshopMonthSheet(wb, mKey, employees, attendance, advances, expenses));
  return wb;
};

/* ------------------------------- Tải file -------------------------------- */

const loadExcelJS = async () => (await import('exceljs')).default;

const downloadWorkbook = async (wb, fileName) => {
  const buffer = await wb.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: XLSX_MIME }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Các tháng sẽ xuất ở chế độ "tất cả": tháng có dữ liệu trong cùng năm, tới tháng đang chọn */
export const getExportMonthKeys = (selectedMonth, { attendance, advances, expenses }) =>
  getMonthKeysWithData({ attendance, advances, expenses }, selectedMonth, { sameYearOnly: true });

/** Xuất file Excel toàn xưởng (chỉ admin) — 1 tháng hoặc tất cả các tháng trong năm */
export const exportWorkshopExcel = async (mode, selectedMonth, employees, attendance, advances, expenses) => {
  const monthKeys = mode === 'all'
    ? getExportMonthKeys(selectedMonth, { attendance, advances, expenses })
    : [selectedMonth];
  const ExcelJS = await loadExcelJS();
  const wb = buildWorkshopWorkbook(ExcelJS, monthKeys, employees, attendance, advances, expenses);

  const { year, month } = parseMonthKey(selectedMonth);
  const fileName = mode === 'all'
    ? `Bang_Luong_Lab_Hung_Decor_${year}.xlsx`
    : `Bang_Luong_Lab_Hung_Decor_Thang_${month}_${year}.xlsx`;
  await downloadWorkbook(wb, fileName);
  return fileName;
};

/** Xuất bảng lương cá nhân: các tháng có dữ liệu của nhân viên trong năm, tới tháng đang chọn */
export const exportEmployeeExcel = async (emp, selectedMonth, attendance, advances, expenses) => {
  const own = (list) => list.filter((x) => x.employeeId === emp.id);
  const ownAttendance = Object.fromEntries(Object.entries(attendance).filter(([, byEmp]) => byEmp?.[emp.id]));
  const monthKeys = getMonthKeysWithData(
    { attendance: ownAttendance, advances: own(advances), expenses: [] },
    selectedMonth,
    { sameYearOnly: true }
  );

  const ExcelJS = await loadExcelJS();
  const wb = buildEmployeeWorkbook(ExcelJS, emp, monthKeys, attendance, advances, expenses);
  const fileName = `${toPlainAsciiName(emp.name)}_Bang_Luong_${parseMonthKey(selectedMonth).year}.xlsx`;
  await downloadWorkbook(wb, fileName);
  return fileName;
};
