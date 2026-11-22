/**
 * src/lib/legacyImport.js
 * Nhập dữ liệu cũ từ file Excel tải về từ Google Sheets "Bảng lương Lab Hung Decor"
 * (mỗi sheet "Tháng N" một tháng). Giao diện: LegacyImportPanel — ẩn/hiện bằng cờ
 * settings/app.legacyImportEnabled trên Firestore.
 *
 * Đọc từng sheet "Tháng N": bảng chấm công (trên), khối lương từng người (cột A–F),
 * BẢNG CHI TIÊU (cột H–R). Sau đó tính lại bằng đúng công thức của app và đối chiếu với
 * số trên file (tổng công, thực trả, TỔNG CHI 1 THÁNG, tổng ứng, tổng chi tiêu, đổ xăng).
 */
import { calculateEmployeeMonthPayroll, generateRandomSlug, latestBaseSalary } from './payroll';

const COL = { NAME: 1, DAY_START: 2, TOTAL_DAYS: 33, DATE: 3, VALUE: 4, B: 2, GROUP: 8, EXP_DATE: 10, NOTE: 12, AMOUNT: 16, FUEL_DATE: 20, FUEL_AMOUNT: 22 };

/* ------------------------------ Đọc ô ------------------------------ */

/** Giá trị hiển thị của ô (ô gộp → giá trị ô gốc; công thức → kết quả) */
const cellValue = (ws, row, col) => {
  const cell = ws.getCell(row, col);
  let v = cell.isMerged ? cell.master.value : cell.value;
  if (v && typeof v === 'object' && !(v instanceof Date)) {
    if ('result' in v) v = v.result;
    else if (v.richText) v = v.richText.map((t) => t.text).join('');
    else if ('text' in v) v = v.text;
  }
  if (typeof v === 'string') v = v.trim();
  return v === '' ? null : v ?? null;
};
const isMergeSlave = (ws, row, col) => {
  const cell = ws.getCell(row, col);
  return cell.isMerged && cell.master.address !== cell.address;
};
const toNumber = (v) => (typeof v === 'number' ? v : typeof v === 'string' && /^[\d.,\s]+$/.test(v) ? Number(v.replace(/[.,\s]/g, '')) : null);

/** Chuẩn hoá để so khớp nhãn: bỏ dấu, thường, gọn khoảng trắng */
export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Ngày trong tháng từ ô Excel. Google Sheets (locale Mỹ) hay hiểu "10/9" thành 9/10 (ngày 9 tháng 10),
 * nên với ô kiểu Date: nếu "ngày" trùng tháng của sheet thì ngày thật nằm ở phần "tháng".
 * @returns { day, warning? } | null
 */
const parseDay = (v, month) => {
  if (v == null) return null;
  if (v instanceof Date) {
    const d = v.getUTCDate();
    const m = v.getUTCMonth() + 1;
    if (d === month) return { day: m };
    if (m === month) return { day: d };
    return { day: d, warning: `ngày ${d}/${m} không thuộc tháng ${month}` };
  }
  const match = String(v).match(/^(\d{1,2})\s*\/\s*(\d{1,2})/);
  if (!match) return null;
  const day = Number(match[1]);
  const m = Number(match[2]);
  return m === month ? { day } : { day, warning: `ghi "${v}" (tháng ${m}), đã hiểu là ${day}/${month}` };
};
const ddmm = (day, month) => `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;

const guessCategory = (note) => {
  const n = normalize(note);
  if (n.includes('xang')) return 'Đổ xăng';
  if (n.startsWith('cuoc') || n.startsWith('ship')) return 'Cước vận chuyển';
  if (/\b(chao|my|com|banh mi|thuoc la|thuoc|nuoc)\b/.test(n)) return 'Ăn uống';
  return 'Vật tư xưởng';
};

/* --------------------------- Đọc 1 sheet tháng --------------------------- */

const findRow = (ws, col, predicate, from = 1) => {
  for (let r = from; r <= ws.rowCount; r++) if (predicate(cellValue(ws, r, col), r)) return r;
  return null;
};

const parseMonthSheet = (ws, year, month) => {
  const issues = [];
  const warn = (msg) => issues.push({ level: 'warning', msg: `T${month}: ${msg}` });
  const fail = (msg) => issues.push({ level: 'error', msg: `T${month}: ${msg}` });

  // 1. Bảng chấm công
  const headerRow = findRow(ws, COL.NAME, (v) => normalize(v) === 'ho va ten');
  if (!headerRow) {
    fail('không tìm thấy dòng "Họ và tên"');
    return { issues };
  }
  const daysInMonth = new Date(year, month, 0).getDate();
  const people = [];
  for (let r = headerRow + 1; r <= headerRow + 40; r++) {
    if (isMergeSlave(ws, r, COL.NAME)) continue;
    const name = cellValue(ws, r, COL.NAME);
    if (!name) {
      if (people.length) break;
      continue;
    }
    const days = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const mark = cellValue(ws, r, COL.DAY_START + d - 1);
      if (mark === '+') days[d] = 1;
      else if (mark === '-') days[d] = 0.5;
      else if (mark != null) warn(`${name} ngày ${d}: ký hiệu lạ "${mark}" (bỏ qua)`);
    }
    people.push({ name: String(name), key: normalize(name), days, expectedDays: toNumber(cellValue(ws, r, COL.TOTAL_DAYS)) });
  }
  const byKey = Object.fromEntries(people.map((p) => [p.key, p]));

  // 2. Khối lương từng người (cột A–F) + tổng kết
  const blocks = {};
  const summary = {};
  let current = null;
  // Khối lương bắt đầu ngay sau bảng chấm công
  for (let r = headerRow + people.length + 1; r <= ws.rowCount; r++) {
    const rawLabel = cellValue(ws, r, COL.NAME);
    const label = normalize(rawLabel);
    const value = toNumber(cellValue(ws, r, COL.VALUE));

    if (label.startsWith('tong chi 1 thang')) summary.totalMonthCost = toNumber(cellValue(ws, r, COL.B));
    else if (label.startsWith('tong luong ung')) summary.totalAdvances = toNumber(cellValue(ws, r, COL.B));
    else if (label.startsWith('tong chi con lai')) summary.remaining = toNumber(cellValue(ws, r, COL.B));
    if (label.startsWith('tong ')) {
      current = null;
      continue;
    }

    if (!isMergeSlave(ws, r, COL.NAME) && byKey[label]) {
      current = { salary: null, reimburse: 0, photo: 0, advances: [], others: [], expectedNet: null, expectedPayable: null };
      blocks[label] = current;
      continue;
    }
    if (!current || !label) continue;

    const isAdvanceRow = label.startsWith('ung luong');
    if (isAdvanceRow) {
      if (value) {
        const parsed = parseDay(cellValue(ws, r, COL.DATE), month);
        if (parsed?.warning) warn(`ứng lương: ${parsed.warning}`);
        current.advances.push({ date: parsed ? ddmm(parsed.day, month) : '', amount: value });
        if (!parsed) warn(`một khoản ứng ${value.toLocaleString('vi-VN')}đ không có ngày`);
      }
      continue;
    }
    if (label.startsWith('muc luong')) current.salary = value ?? 0;
    else if (label.startsWith('chi tieu')) current.reimburse = value ?? 0;
    else if (label.startsWith('tien anh')) current.photo = value ?? 0;
    else if (label.startsWith('luong thuc nhan')) current.expectedNet = value ?? 0;
    else if (label.startsWith('luong + chi tieu')) current.expectedPayable = value ?? 0;
    else if (value) current.others.push({ note: String(rawLabel).replace(/\s*\(VND\)\s*$/i, ''), amount: value });
  }

  // 3. BẢNG CHI TIÊU (cột H–R)
  const expenses = [];
  const expected = { groups: [], totalExpenses: null, totalFuel: null };
  const titleRow = findRow(ws, COL.GROUP, (v) => normalize(v) === 'bang chi tieu');
  if (titleRow) {
    let lastDate = null;
    let lastGroup = null;
    for (let r = titleRow + 2; r <= ws.rowCount; r++) {
      const group = cellValue(ws, r, COL.GROUP);
      const dateCell = cellValue(ws, r, COL.EXP_DATE);
      if (normalize(group) === 'tong') {
        expected.totalExpenses = toNumber(cellValue(ws, r, COL.AMOUNT));
        break;
      }
      if (normalize(dateCell) === 'tong') {
        expected.groups.push({ name: lastGroup, total: toNumber(cellValue(ws, r, COL.AMOUNT)) });
        continue;
      }
      if (group && normalize(group) !== normalize(lastGroup)) {
        lastGroup = String(group);
        lastDate = null;
      }
      const note = cellValue(ws, r, COL.NOTE);
      const amount = toNumber(cellValue(ws, r, COL.AMOUNT));
      if (!note && !amount) continue;
      if (!amount) {
        warn(`chi tiêu "${note}" không có số tiền (bỏ qua)`);
        continue;
      }
      const parsed = parseDay(dateCell, month) || lastDate;
      if (parsed?.warning && parsed !== lastDate) warn(`chi tiêu "${note}": ${parsed.warning}`);
      if (!parsed) warn(`chi tiêu "${note}" không có ngày`);
      lastDate = parsed;
      const buyer = byKey[normalize(lastGroup)];
      if (!buyer) fail(`chi tiêu "${note}": không nhận ra người mua "${lastGroup}"`);
      expenses.push({ buyerKey: buyer?.key, date: parsed ? ddmm(parsed.day, month) : '', note: String(note || ''), amount });
    }
  } else {
    warn('không thấy BẢNG CHI TIÊU');
  }
  const fuelTotalRow = findRow(ws, COL.FUEL_DATE, (v) => normalize(v) === 'tong');
  if (fuelTotalRow) expected.totalFuel = toNumber(cellValue(ws, fuelTotalRow, COL.FUEL_AMOUNT));

  people.forEach((p) => !blocks[p.key] && fail(`không thấy khối lương của ${p.name}`));
  return { people, blocks, summary, expenses, expected, issues };
};

/* ------------------------------ Tổng hợp ------------------------------ */

/**
 * Các tháng có trong file: đọc tiêu đề "BẢNG LƯƠNG THÁNG m/yyyy" ở ô A1 của từng sheet "Tháng N".
 * @returns ['2026-07', '2026-08', ...] tăng dần
 */
export const detectMonthKeys = (workbook) =>
  workbook.worksheets
    .map((ws) => {
      const sheetMonth = normalize(ws.name).match(/^thang (\d{1,2})$/)?.[1];
      const title = normalize(cellValue(ws, 1, 1)).match(/thang (\d{1,2})\s*\/\s*(\d{4})/);
      if (!sheetMonth || !title || Number(title[1]) !== Number(sheetMonth)) return null;
      return `${title[2]}-${String(title[1]).padStart(2, '0')}`;
    })
    .filter(Boolean)
    .sort();

/**
 * @param workbook ExcelJS.Workbook đã load
 * @param monthKeys ['2026-09', '2026-10', '2026-11']
 * @returns { employees, attendance, advances, expenses, checks, issues, ok }
 */
export const parseLegacyWorkbook = (workbook, monthKeys) => {
  const issues = [];
  const parsed = {};
  monthKeys.forEach((monthKey) => {
    const [year, month] = monthKey.split('-').map(Number);
    const ws = workbook.worksheets.find((w) => normalize(w.name) === `thang ${month}`);
    if (!ws) {
      issues.push({ level: 'error', msg: `Không có sheet "Tháng ${month}"` });
      return;
    }
    parsed[monthKey] = parseMonthSheet(ws, year, month);
    issues.push(...parsed[monthKey].issues);
  });

  // Nhân viên: theo thứ tự xuất hiện (tháng đầu trước), id = tên không dấu
  const empMap = new Map();
  Object.values(parsed).forEach((m) =>
    m.people?.forEach((p) => !empMap.has(p.key) && empMap.set(p.key, { name: p.name }))
  );
  const lastMonth = monthKeys[monthKeys.length - 1];
  const employees = [...empMap.entries()].map(([key, { name }], idx) => {
    const salaryByMonth = {};
    monthKeys.forEach((mk) => {
      const salary = parsed[mk]?.blocks?.[key]?.salary;
      if (salary !== undefined && salary !== null) salaryByMonth[mk] = salary;
    });
    const activeInLastMonth = Boolean(parsed[lastMonth]?.people?.some((p) => p.key === key));
    return {
      id: key.replace(/[^a-z0-9]/g, ''),
      key,
      name,
      roleLabel: 'Nhân viên xưởng',
      salaryByMonth,
      baseSalary: latestBaseSalary(salaryByMonth, 0),
      slug: generateRandomSlug(name),
      order: idx + 1,
      active: activeInLastMonth, // không có trong tháng cuối = đã nghỉ
    };
  });
  const idOf = Object.fromEntries(employees.map((e) => [e.key, e.id]));

  const attendance = {};
  const advances = [];
  const expenses = [];
  Object.entries(parsed).forEach(([monthKey, m]) => {
    const month = Number(monthKey.slice(5));
    attendance[monthKey] = {};
    m.people.forEach((p) => (attendance[monthKey][idOf[p.key]] = p.days));
    // Người chi = người có mục "Chi Tiêu" trong khối lương (tiền chi hộ được hoàn vào lương họ)
    const payerKeys = Object.entries(m.blocks).filter(([, b]) => b.reimburse > 0).map(([k]) => k);
    if (payerKeys.length > 1) issues.push({ level: 'error', msg: `T${month}: có nhiều người có mục "Chi Tiêu" (${payerKeys.join(', ')})` });
    const payerId = payerKeys[0] ? idOf[payerKeys[0]] : employees[0]?.id;
    let n = 0;
    const lastDay = new Date(Number(monthKey.slice(0, 4)), month, 0).getDate();
    Object.entries(m.blocks).forEach(([key, b]) => {
      const employeeId = idOf[key];
      b.advances.forEach((a) =>
        advances.push({ id: `import-${monthKey}-${++n}`, month: monthKey, employeeId, date: a.date, type: 'advance', amount: a.amount, note: 'Ứng lương' })
      );
      if (b.photo) {
        advances.push({ id: `import-${monthKey}-${++n}`, month: monthKey, employeeId, date: ddmm(lastDay, month), type: 'photo_fee', amount: b.photo, note: 'Tiền ảnh' });
      }
      b.others.forEach((o) =>
        advances.push({ id: `import-${monthKey}-${++n}`, month: monthKey, employeeId, date: ddmm(lastDay, month), type: 'other_deduction', amount: o.amount, note: o.note })
      );
    });
    m.expenses.forEach((x, i) =>
      expenses.push({
        id: `import-${monthKey}-exp-${String(i + 1).padStart(3, '0')}`,
        month: monthKey,
        date: x.date,
        note: x.note,
        amount: x.amount,
        category: guessCategory(x.note),
        employeeId: idOf[x.buyerKey],
        buyerId: idOf[x.buyerKey],
        payerId,
        reimburse: true,
      })
    );
  });

  // Đối chiếu: tính lại bằng code của app, so với số trên file
  const checks = [];
  const check = (monthKey, label, actual, expectedValue) => {
    if (expectedValue === null || expectedValue === undefined) return;
    checks.push({ monthKey, label, actual, expected: expectedValue, ok: Math.abs(actual - expectedValue) < 0.001 });
  };
  Object.entries(parsed).forEach(([monthKey, m]) => {
    let payableSum = 0;
    let advanceSum = 0;
    m.people.forEach((p) => {
      const emp = employees.find((e) => e.key === p.key);
      const calc = calculateEmployeeMonthPayroll(emp, monthKey, attendance, advances, expenses);
      const b = m.blocks[p.key] || {};
      payableSum += calc.netSalary;
      advanceSum += calc.totalAdvances;
      check(monthKey, `${p.name} – tổng công`, calc.totalDays, p.expectedDays);
      check(monthKey, `${p.name} – lương thực nhận`, calc.netWorkSalary, b.expectedNet);
      if (b.expectedPayable !== null && b.expectedPayable !== undefined) check(monthKey, `${p.name} – lương + chi tiêu`, calc.netSalary, b.expectedPayable);
      if (b.reimburse) check(monthKey, `${p.name} – chi tiêu được hoàn`, calc.totalReimbursements, b.reimburse);
    });
    const monthExp = expenses.filter((x) => x.month === monthKey);
    check(monthKey, 'Tổng lương ứng', advanceSum, m.summary.totalAdvances);
    check(monthKey, 'TỔNG CHI 1 THÁNG', payableSum + advanceSum, m.summary.totalMonthCost);
    check(monthKey, 'Tổng chi còn lại', payableSum, m.summary.remaining);
    check(monthKey, 'Tổng bảng chi tiêu', monthExp.reduce((s, x) => s + x.amount, 0), m.expected.totalExpenses);
    check(monthKey, 'Tổng đổ xăng', monthExp.filter((x) => x.category === 'Đổ xăng').reduce((s, x) => s + x.amount, 0), m.expected.totalFuel);
  });

  const ok = !issues.some((i) => i.level === 'error') && checks.every((c) => c.ok);
  return {
    employees: employees.map(({ key, ...e }) => e),
    attendance,
    advances,
    expenses,
    checks,
    issues,
    ok,
    monthKeys: Object.keys(parsed),
  };
};
