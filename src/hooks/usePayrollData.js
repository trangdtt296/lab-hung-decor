'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { firebaseAuth, firebaseDb, isFirebaseConfigured } from '../lib/firebase';
import {
  STANDARD_WORK_DAYS,
  getCurrentMonthKey,
  getDaysInMonth,
  buildCalendarCells,
  formatMonthLabel,
  generateRandomSlug,
  parseMoneyInput,
  calculateEmployeeMonthPayroll,
  latestBaseSalary,
  isEmployeeInMonth,
} from '../lib/payroll';
import {
  saveAttendanceDoc,
  saveBatchAttendanceDoc,
  saveAdvanceDoc,
  deleteAdvanceDoc,
  saveExpenseDoc,
  deleteExpenseDoc,
  saveEmployeeDoc,
  updateEmployeeSlugDoc,
  updateEmployeeStatusDoc,
  updateEmployeeSalaryDoc,
  importLegacyDataDocs,
} from '../lib/firestoreService';
import { exportWorkshopExcel, exportEmployeeExcel, getExportMonthKeys } from '../lib/exportExcel';
import { useToast } from './useToast';

const NEXT_ATTENDANCE_VALUE = { 0: 1, 1: 0.5, 0.5: 0 };
const ADVANCE_TYPE_LABEL = { advance: 'Ứng lương', photo_fee: 'Tiền ảnh', other_deduction: 'Khoản trừ khác' };
const ATTENDANCE_LABEL = { 1: '1 công (+)', 0.5: '0.5 công (-)', 0: 'Nghỉ (•)' };

const COLLECTIONS = ['employees', 'attendance', 'advances', 'expenses'];

/** Lắng nghe 1 collection Firestore — luôn thay toàn bộ, kể cả khi collection trống */
const subscribeCollection = (name, onDocs, onError) =>
  onSnapshot(
    collection(firebaseDb, name),
    (snap) => onDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );

/** Giữ đúng thứ tự trên bảng lương (Firestore mặc định trả theo id chữ cái) */
const sortEmployees = (list) =>
  [...list].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));

/** { '2026-11': { empId: { 1: 1, 2: 0.5 } } } từ các document attendance/{empId}_{monthKey} */
const groupAttendanceDocs = (docs) => {
  const next = {};
  docs.forEach((data) => {
    if (!data.employeeId) return;
    const mKey = data.monthKey || `${data.year}-${String(data.month).padStart(2, '0')}`;
    next[mKey] = { ...next[mKey], [data.employeeId]: data.days || {} };
  });
  return next;
};

export function usePayrollData() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  // Firebase cần thời gian khôi phục phiên đăng nhập; tránh nháy màn hình login khi F5.
  // Chưa cấu hình Firebase thì không có gì để chờ (trang hiển thị lỗi cấu hình).
  const [isAuthReady, setIsAuthReady] = useState(!isFirebaseConfigured);
  const [loadedCollections, setLoadedCollections] = useState(() => new Set());

  const [employees, setEmployees] = useState([]);
  // Giá trị cố định cho prerender; đổi sang tháng hiện tại ngay khi chạy trên client
  const [selectedMonth, setSelectedMonth] = useState('2026-11');
  const [attendance, setAttendance] = useState({});
  const [advances, setAdvances] = useState([]);
  const [expenses, setExpenses] = useState([]);
  // Cờ tính năng trên Firestore: settings/app.legacyImportEnabled (bật/tắt trong Firebase Console)
  const [featureFlags, setFeatureFlags] = useState({});

  /** Nhân viên đang làm — dùng cho các ô chọn khi nhập liệu mới */
  const activeEmployees = useMemo(() => employees.filter((e) => e.active !== false), [employees]);

  const { toast, showToast } = useToast();
  const [copiedEmpId, setCopiedEmpId] = useState(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  useEffect(() => {
    // Cố ý set sau mount: tháng hiện tại phụ thuộc đồng hồ client, đọc lúc render sẽ lệch hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedMonth(getCurrentMonthKey());
  }, []);

  /** Ghi Firestore; báo lỗi rõ ràng thay vì im lặng để người dùng biết dữ liệu chưa lưu */
  const persist = useCallback(
    async (task, successMessage) => {
      try {
        await task();
        if (successMessage) showToast(successMessage);
        return true;
      } catch (err) {
        console.error(err);
        showToast('Không lưu được lên máy chủ. Kiểm tra kết nối mạng rồi thử lại.', 'error');
        return false;
      }
    },
    [showToast]
  );

  /* ------------------------------ Firebase realtime ------------------------------ */
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth) return undefined;
    return onAuthStateChanged(firebaseAuth, (user) => {
      setIsAdminAuthenticated(Boolean(user));
      setAdminEmail(user?.email || '');
      setIsAuthReady(true);
    });
  }, []);

  // Chỉ mở kết nối dữ liệu khi admin đã đăng nhập (Firestore Rules chặn người chưa đăng nhập).
  // Đăng xuất → đóng kết nối và xoá dữ liệu khỏi bộ nhớ trình duyệt.
  useEffect(() => {
    if (!isAdminAuthenticated || !firebaseDb) return undefined;

    const LABELS = { employees: 'nhân sự', attendance: 'chấm công', advances: 'ứng lương', expenses: 'chi tiêu' };
    const handlers = {
      // Giữ cả nhân viên đã nghỉ để bảng lương các tháng cũ vẫn đầy đủ
      employees: (docs) => setEmployees(sortEmployees(docs)),
      attendance: (docs) => setAttendance(groupAttendanceDocs(docs)),
      advances: setAdvances,
      expenses: setExpenses,
    };
    const markLoaded = (name) =>
      setLoadedCollections((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));

    const unsubs = COLLECTIONS.map((name) =>
        subscribeCollection(
          name,
          (docs) => {
            handlers[name](docs);
            markLoaded(name);
          },
          (err) => {
            console.error(err);
            markLoaded(name); // không treo màn hình tải, nhưng báo lỗi rõ ràng
            showToast(`Không tải được dữ liệu ${LABELS[name]}. Kiểm tra mạng hoặc quyền truy cập.`, 'error');
          }
        )
    );
    // Cờ tính năng: thiếu document / lỗi quyền → coi như tắt hết, không ảnh hưởng phần còn lại
    unsubs.push(
      onSnapshot(
        doc(firebaseDb, 'settings', 'app'),
        (snap) => setFeatureFlags(snap.exists() ? snap.data() : {}),
        () => setFeatureFlags({})
      )
    );
    return () => {
      unsubs.forEach((unsub) => unsub());
      setFeatureFlags({});
      setEmployees([]);
      setAttendance({});
      setAdvances([]);
      setExpenses([]);
      setLoadedCollections(new Set());
    };
  }, [isAdminAuthenticated, showToast]);

  const isDataReady = isFirebaseConfigured && loadedCollections.size === COLLECTIONS.length;

  /* ---------------------------------- Chấm công ---------------------------------- */

  /** Cập nhật 1 ngày công của 1 nhân viên trong tháng đang chọn (lạc quan) rồi lưu */
  const writeAttendanceDay = useCallback(
    (empId, day, value) => {
      const updatedEmpMap = { ...(attendance[selectedMonth]?.[empId] || {}), [day]: value };
      setAttendance((prev) => ({
        ...prev,
        [selectedMonth]: { ...(prev[selectedMonth] || {}), [empId]: updatedEmpMap },
      }));
      return persist(() => saveAttendanceDoc(empId, selectedMonth, updatedEmpMap));
    },
    [attendance, selectedMonth, persist]
  );

  const toggleAttendance = useCallback(
    (empId, day) => {
      const current = attendance[selectedMonth]?.[empId]?.[day] || 0;
      return writeAttendanceDay(empId, day, NEXT_ATTENDANCE_VALUE[current] ?? 0);
    },
    [attendance, selectedMonth, writeAttendanceDay]
  );

  const setAttendanceValue = useCallback(
    async (empId, day, value) => {
      const ok = await writeAttendanceDay(empId, day, value);
      if (ok) showToast(`Đã cập nhật ngày ${day}/${selectedMonth.split('-')[1]} thành ${ATTENDANCE_LABEL[value]}`);
    },
    [writeAttendanceDay, selectedMonth, showToast]
  );

  /** Chấm 1 công cho cả xưởng vào ngày `day` (mặc định hôm nay) */
  const quickMarkAllToday = useCallback(
    async (day = new Date().getDate()) => {
      const nextMonthMap = { ...(attendance[selectedMonth] || {}) };
      activeEmployees.forEach((emp) => {
        nextMonthMap[emp.id] = { ...(nextMonthMap[emp.id] || {}), [day]: 1 };
      });
      setAttendance((prev) => ({ ...prev, [selectedMonth]: nextMonthMap }));
      await persist(
        () => saveBatchAttendanceDoc(selectedMonth, nextMonthMap, activeEmployees),
        `Đã chấm 1 công ngày ${day}/${selectedMonth.split('-')[1]} cho cả xưởng`
      );
    },
    [attendance, activeEmployees, selectedMonth, persist]
  );

  /* ----------------------------------- Ứng lương ----------------------------------- */
  const addAdvance = useCallback(
    async ({ employeeId, date, type, amount, note }) => {
      const numericAmount = parseMoneyInput(amount);
      if (numericAmount <= 0) return;
      const entry = {
        id: `adv-${Date.now()}`,
        month: selectedMonth,
        employeeId,
        date,
        type,
        amount: numericAmount,
        note: note?.trim() || ADVANCE_TYPE_LABEL[type] || 'Khoản trừ',
      };
      setAdvances((prev) => [entry, ...prev]);
      await persist(() => saveAdvanceDoc(entry), 'Đã lưu khoản khấu trừ & cập nhật phiếu lương');
    },
    [selectedMonth, persist]
  );

  const deleteAdvance = useCallback(
    async (id) => {
      setAdvances((prev) => prev.filter((item) => item.id !== id));
      await persist(() => deleteAdvanceDoc(id), 'Đã xoá khoản mục');
    },
    [persist]
  );

  /* ----------------------------------- Chi tiêu ----------------------------------- */
  const addExpense = useCallback(
    async ({ date, employeeId, payerId, category, note, amount, reimburse }) => {
      const numericAmount = parseMoneyInput(amount);
      if (numericAmount <= 0) return;
      const entry = {
        id: `exp-${Date.now()}`,
        month: selectedMonth,
        date,
        employeeId,
        buyerId: employeeId,
        payerId, // người chi tiền — được hoàn vào lương nếu reimburse
        category,
        note: note?.trim() || category,
        amount: numericAmount,
        reimburse: employeeId === 'fund' ? false : Boolean(reimburse),
      };
      setExpenses((prev) => [entry, ...prev]);
      await persist(() => saveExpenseDoc(entry), 'Đã ghi nhận khoản chi tiêu');
    },
    [selectedMonth, persist]
  );

  const deleteExpense = useCallback(
    async (id) => {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      await persist(() => deleteExpenseDoc(id), 'Đã xoá khoản chi');
    },
    [persist]
  );

  /* ---------------------------------- Nhân viên ---------------------------------- */
  const addEmployee = useCallback(
    async ({ name, roleLabel, baseSalary }) => {
      if (!name?.trim()) return;
      const salary = parseMoneyInput(baseSalary);
      const created = {
        id: `emp-${Date.now()}`,
        name: name.trim(),
        roleLabel: roleLabel?.trim() || 'Nhân viên xưởng',
        baseSalary: salary,
        salaryByMonth: { [selectedMonth]: salary }, // lương có hiệu lực từ tháng đang xem
        order: Date.now(), // nhân viên mới xếp cuối bảng lương
        slug: generateRandomSlug(name),
        active: true,
      };
      setEmployees((prev) => [...prev, created]);
      await persist(() => saveEmployeeDoc(created), `Đã thêm ${created.name} & tạo link riêng`);
    },
    [persist, selectedMonth]
  );

  /** Sửa lương: có hiệu lực từ tháng đang chọn trở đi, các tháng trước giữ nguyên */
  const saveSalaryEdit = useCallback(
    async (empId, newSalary) => {
      const val = parseMoneyInput(newSalary);
      const emp = employees.find((e) => e.id === empId);
      if (val <= 0 || !emp) return;
      const salaryByMonth = { ...(emp.salaryByMonth || {}), [selectedMonth]: val };
      const current = latestBaseSalary(salaryByMonth, val);
      setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, salaryByMonth, baseSalary: current } : e)));
      await persist(
        () => updateEmployeeSalaryDoc(empId, selectedMonth, val, current),
        `Đã cập nhật lương ${emp.name} từ ${formatMonthLabel(selectedMonth)}`
      );
    },
    [employees, selectedMonth, persist]
  );

  /**
   * Cho nhân viên nghỉ từ tháng đang xem: không còn trong bảng chấm công từ tháng này trở đi
   * (trừ khi tháng đó đã có dữ liệu), dữ liệu & bảng lương các tháng cũ giữ nguyên.
   */
  const setEmployeeActive = useCallback(
    async (empId, active) => {
      const emp = employees.find((e) => e.id === empId);
      if (!emp) return;
      const inactiveFrom = active ? null : selectedMonth;
      setEmployees((prev) => prev.map((e) => (e.id === empId ? { ...e, active, inactiveFrom } : e)));
      await persist(
        () => updateEmployeeStatusDoc(empId, active, inactiveFrom),
        active ? `Đã khôi phục ${emp.name}` : `${emp.name} đã nghỉ từ ${formatMonthLabel(selectedMonth)}`
      );
    },
    [employees, selectedMonth, persist]
  );

  const regenerateSlug = useCallback(
    async (empId) => {
      const target = employees.find((e) => e.id === empId);
      const nextSlug = generateRandomSlug(target?.name || 'nv');
      setEmployees((prev) => prev.map((emp) => (emp.id === empId ? { ...emp, slug: nextSlug } : emp)));
      await persist(() => updateEmployeeSlugDoc(empId, nextSlug), 'Đã đổi link mới. Link cũ không còn dùng được.');
    },
    [employees, persist]
  );

  const copyEmployeeLink = useCallback(
    async (emp) => {
      const fullUrl = `${window.location.origin}/e/${emp.slug}`;
      try {
        await navigator.clipboard.writeText(fullUrl);
      } catch {
        showToast(`Không copy được, link: ${fullUrl}`, 'error');
        return;
      }
      setCopiedEmpId(emp.id);
      setTimeout(() => setCopiedEmpId((prev) => (prev === emp.id ? null : prev)), 2000);
      showToast(`Đã copy link của ${emp.name}`);
    },
    [showToast]
  );

  /* ---------------------------------- Xác thực ---------------------------------- */
  const loginAdmin = useCallback(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      if (!firebaseAuth) throw new Error('Chưa cấu hình Firebase.');
      try {
        await signInWithEmailAndPassword(firebaseAuth, cleanEmail, password);
      } catch (err) {
        const wrongCredential = ['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-email'];
        if (wrongCredential.includes(err?.code)) throw new Error('Email hoặc mật khẩu không đúng.');
        if (err?.code === 'auth/too-many-requests') throw new Error('Đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ít phút.');
        throw new Error('Không đăng nhập được. Kiểm tra kết nối mạng rồi thử lại.');
      }
      showToast('Đăng nhập Admin thành công');
    },
    [showToast]
  );

  const logoutAdmin = useCallback(async () => {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.warn(err);
    }
    showToast('Đã đăng xuất khỏi tài khoản Admin');
  }, [showToast]);

  /** Đổi mật khẩu Firebase Auth (cần xác thực lại bằng mật khẩu hiện tại) */
  const changeAdminPassword = useCallback(async (current, nextPw, confirmPw) => {
    const user = firebaseAuth?.currentUser;
    if (!user?.email) throw new Error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.');
    if (nextPw.length < 6) throw new Error('Mật khẩu mới cần ít nhất 6 ký tự.');
    if (nextPw !== confirmPw) throw new Error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));
    } catch {
      throw new Error('Mật khẩu hiện tại chưa chính xác.');
    }
    await updatePassword(user, nextPw);
  }, []);

  /* --------- Nhập dữ liệu cũ từ Excel (ẩn/hiện bằng cờ settings/app.legacyImportEnabled) --------- */
  const isLegacyImportEnabled = featureFlags.legacyImportEnabled === true;
  const isDatabaseEmpty =
    employees.length === 0 && advances.length === 0 && expenses.length === 0 && Object.keys(attendance).length === 0;

  const importLegacyData = useCallback(
    async (data) => {
      const count = await importLegacyDataDocs(data);
      showToast(`Đã nhập ${count} bản ghi lên Firebase`);
      return count;
    },
    [showToast]
  );

  /* --------------------------------- Xuất Excel --------------------------------- */
  const runExport = useCallback(
    async (task, errorMessage) => {
      setIsExportingExcel(true);
      try {
        const fileName = await task();
        showToast(`Đã tải xuống ${fileName}`);
      } catch (err) {
        console.error(err);
        showToast(errorMessage, 'error');
      } finally {
        setIsExportingExcel(false);
      }
    },
    [showToast]
  );

  const handleExportWorkshop = useCallback(
    (mode = 'single') =>
      runExport(
        () => exportWorkshopExcel(mode, selectedMonth, employees, attendance, advances, expenses),
        'Có lỗi khi xuất Excel xưởng, vui lòng thử lại!'
      ),
    [runExport, selectedMonth, employees, attendance, advances, expenses]
  );

  const handleExportEmployee = useCallback(
    (emp) =>
      runExport(
        () => exportEmployeeExcel(emp, selectedMonth, attendance, advances, expenses),
        'Có lỗi khi xuất Excel cá nhân, vui lòng thử lại!'
      ),
    [runExport, selectedMonth, attendance, advances, expenses]
  );

  /* ------------------------------ Dữ liệu phái sinh ------------------------------ */
  const currentMonthDays = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);
  const calendarCells = useMemo(() => buildCalendarCells(currentMonthDays), [currentMonthDays]);
  const selectedMonthDisplayLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);
  const exportMonthKeys = useMemo(
    () => getExportMonthKeys(selectedMonth, { attendance, advances, expenses }),
    [selectedMonth, attendance, advances, expenses]
  );

  const calculatePayroll = useCallback(
    (emp, mKey = selectedMonth) => calculateEmployeeMonthPayroll(emp, mKey, attendance, advances, expenses),
    [selectedMonth, attendance, advances, expenses]
  );

  /** Nhân viên có mặt trên bảng lương tháng đang xem (gồm người đã nghỉ nếu tháng đó còn dữ liệu) */
  const monthEmployees = useMemo(
    () => employees.filter((e) => isEmployeeInMonth(e, selectedMonth, { attendance, advances, expenses })),
    [employees, selectedMonth, attendance, advances, expenses]
  );

  const monthPayrollSummary = useMemo(
    () => monthEmployees.map((emp) => ({ employee: emp, ...calculatePayroll(emp) })),
    [monthEmployees, calculatePayroll]
  );

  const kpiStats = useMemo(() => {
    const sum = (list, pick) => list.reduce((s, x) => s + (pick(x) || 0), 0);
    const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
    return {
      // Giống phần tổng kết của bảng lương tổng: TỔNG CHI 1 THÁNG = còn phải trả + đã ứng
      totalNetPayroll: sum(monthPayrollSummary, (x) => x.netSalary),
      totalWorkDays: sum(monthPayrollSummary, (x) => x.totalDays),
      totalAdvances: sum(monthPayrollSummary, (x) => x.totalAdvances),
      totalMonthCost:
        sum(monthPayrollSummary, (x) => x.netSalary) + sum(monthPayrollSummary, (x) => x.totalAdvances),
      totalExpenses: sum(monthExpenses, (e) => e.amount),
      totalReimbursements: sum(monthExpenses.filter((e) => e.reimburse), (e) => e.amount),
      totalFuel: sum(monthExpenses.filter((e) => e.category === 'Đổ xăng'), (e) => e.amount),
    };
  }, [monthPayrollSummary, expenses, selectedMonth]);

  return {
    employees,
    activeEmployees,
    monthEmployees,
    selectedMonth,
    setSelectedMonth,
    selectedMonthDisplayLabel,
    attendance,
    advances,
    expenses,
    isAdminAuthenticated,
    isAuthReady,
    isDataReady,
    adminEmail,
    isFirebaseConfigured,
    toast,
    showToast,
    copiedEmpId,
    isExportingExcel,
    currentMonthDays,
    calendarCells,
    monthPayrollSummary,
    kpiStats,
    exportMonthKeys,
    STANDARD_WORK_DAYS,
    // Actions
    toggleAttendance,
    setAttendanceValue,
    quickMarkAllToday,
    addAdvance,
    deleteAdvance,
    addExpense,
    deleteExpense,
    addEmployee,
    saveSalaryEdit,
    setEmployeeActive,
    regenerateSlug,
    copyEmployeeLink,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    handleExportWorkshop,
    handleExportEmployee,
    calculatePayroll,
    isDatabaseEmpty,
    isLegacyImportEnabled,
    importLegacyData,
  };
}
