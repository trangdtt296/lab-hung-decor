'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';
import { firebaseAuth, firebaseDb, isFirebaseConfigured } from '../lib/firebase';
import {
  INITIAL_EMPLOYEES,
  INITIAL_ATTENDANCE,
  INITIAL_ADVANCES,
  INITIAL_EXPENSES,
  STANDARD_WORK_DAYS,
  DEMO_ADMIN_EMAIL,
  DEFAULT_DEMO_PASSWORD,
  AVAILABLE_MONTHS,
  getDaysInMonth,
  generateRandomSlug,
  calculateEmployeeMonthPayroll,
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
  updateEmployeeSalaryDoc,
  seedSampleDataToFirestore,
} from '../lib/firestoreService';
import { exportWorkshopExcel, exportEmployeeExcel } from '../lib/exportExcel';

export function usePayrollData() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState(DEFAULT_DEMO_PASSWORD);
  const [cloudSyncStatus, setCloudSyncStatus] = useState(
    isFirebaseConfigured ? 'Đã kết nối Firebase' : 'Chế độ xem trước (Dữ liệu mẫu)'
  );

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [advances, setAdvances] = useState(INITIAL_ADVANCES);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [toast, setToast] = useState(null);
  const [copiedEmpId, setCopiedEmpId] = useState(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  }, []);

  // Lắng nghe Firebase realtime
  useEffect(() => {
    if (!isFirebaseConfigured || !firebaseAuth || !firebaseDb) {
      return undefined;
    }

    const unsubAuth = onAuthStateChanged(firebaseAuth, (user) => {
      setIsAdminAuthenticated(Boolean(user));
    });

    const unsubEmployees = onSnapshot(
      collection(firebaseDb, 'employees'),
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.active !== false);
        if (list.length > 0) setEmployees(list);
      },
      () => setCloudSyncStatus('Lỗi kết nối nhân sự Firestore')
    );

    const unsubAttendance = onSnapshot(
      collection(firebaseDb, 'attendance'),
      (snap) => {
        if (snap.empty) return;
        const nextAtt = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const mKey = data.monthKey || `${data.year}-${String(data.month).padStart(2, '0')}`;
          if (!nextAtt[mKey]) nextAtt[mKey] = {};
          if (data.employeeId) nextAtt[mKey][data.employeeId] = data.days || {};
        });
        setAttendance((prev) => ({ ...prev, ...nextAtt }));
      },
      () => {}
    );

    const unsubAdvances = onSnapshot(
      collection(firebaseDb, 'advances'),
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setAdvances(list);
      },
      () => {}
    );

    const unsubExpenses = onSnapshot(
      collection(firebaseDb, 'expenses'),
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setExpenses(list);
      },
      () => {}
    );

    return () => {
      unsubAuth();
      unsubEmployees();
      unsubAttendance();
      unsubAdvances();
      unsubExpenses();
    };
  }, []);

  // Thao tác chấm công
  const toggleAttendance = useCallback(
    async (empId, day) => {
      const currentMonthData = attendance[selectedMonth] || {};
      const currentEmpData = currentMonthData[empId] || {};
      const currentVal = currentEmpData[day] || 0;
      const nextVal = currentVal === 0 ? 1 : currentVal === 1 ? 0.5 : 0;
      const updatedEmpMap = { ...currentEmpData, [day]: nextVal };

      setAttendance((prev) => ({
        ...prev,
        [selectedMonth]: {
          ...(prev[selectedMonth] || {}),
          [empId]: updatedEmpMap,
        },
      }));

      try {
        await saveAttendanceDoc(empId, selectedMonth, updatedEmpMap);
      } catch (err) {
        console.warn('Lỗi lưu chấm công:', err);
      }
    },
    [attendance, selectedMonth]
  );

  const quickMarkSingleEmployee = useCallback(
    async (emp) => {
      const days = getDaysInMonth(selectedMonth);
      const targetDay = days.length;
      const updatedEmpMap = {
        ...(attendance[selectedMonth]?.[emp.id] || {}),
        [targetDay]: 1,
      };

      setAttendance((prev) => ({
        ...prev,
        [selectedMonth]: {
          ...(prev[selectedMonth] || {}),
          [emp.id]: updatedEmpMap,
        },
      }));

      try {
        await saveAttendanceDoc(emp.id, selectedMonth, updatedEmpMap);
      } catch (err) {
        console.warn(err);
      }

      showToast(`Đã chấm +1 công ngày ${targetDay}/${selectedMonth.split('-')[1]} cho ${emp.name}`);
    },
    [attendance, selectedMonth, showToast]
  );

  const quickMarkAllToday = useCallback(async () => {
    const days = getDaysInMonth(selectedMonth);
    const targetDay = days.length;
    const nextMonthMap = { ...(attendance[selectedMonth] || {}) };
    employees.forEach((emp) => {
      nextMonthMap[emp.id] = {
        ...(nextMonthMap[emp.id] || {}),
        [targetDay]: 1,
      };
    });

    setAttendance((prev) => ({
      ...prev,
      [selectedMonth]: nextMonthMap,
    }));

    try {
      await saveBatchAttendanceDoc(selectedMonth, nextMonthMap, employees);
    } catch (err) {
      console.warn(err);
    }

    showToast(`Đã chấm đủ 1 công ngày ${targetDay}/${selectedMonth.split('-')[1]} cho cả xưởng!`);
  }, [attendance, employees, selectedMonth, showToast]);

  // Thao tác ứng lương
  const addAdvance = useCallback(
    async ({ employeeId, date, type, amount, note }) => {
      const numericAmount = Number(String(amount).replace(/\D/g, ''));
      if (!numericAmount || numericAmount <= 0) return;

      const docId = 'adv-' + Date.now();
      const newEntry = {
        id: docId,
        month: selectedMonth,
        employeeId,
        date: date || '15/08',
        type,
        amount: numericAmount,
        note: note?.trim() || (type === 'advance' ? 'Ứng lương' : 'Tiền ảnh'),
      };

      setAdvances((prev) => [newEntry, ...prev]);

      try {
        await saveAdvanceDoc(newEntry);
      } catch (err) {
        console.warn(err);
      }

      showToast('Đã lưu khoản khấu trừ & đồng bộ phiếu lương!');
    },
    [selectedMonth, showToast]
  );

  const deleteAdvance = useCallback(
    async (id) => {
      setAdvances((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteAdvanceDoc(id);
      } catch (err) {
        console.warn(err);
      }
      showToast('Đã xóa khoản mục');
    },
    [showToast]
  );

  // Thao tác chi tiêu
  const addExpense = useCallback(
    async ({ date, employeeId, category, note, amount, reimburse }) => {
      const numericAmount = Number(String(amount).replace(/\D/g, ''));
      if (!numericAmount || numericAmount <= 0) return;

      const docId = 'exp-' + Date.now();
      const newExp = {
        id: docId,
        month: selectedMonth,
        date: date || '15/08',
        employeeId,
        category,
        note: note?.trim() || category,
        amount: numericAmount,
        reimburse: employeeId === 'fund' ? false : reimburse,
      };

      setExpenses((prev) => [newExp, ...prev]);

      try {
        await saveExpenseDoc(newExp);
      } catch (err) {
        console.warn(err);
      }

      showToast('Đã ghi nhận khoản chi tiêu!');
    },
    [selectedMonth, showToast]
  );

  const deleteExpense = useCallback(
    async (id) => {
      setExpenses((prev) => prev.filter((item) => item.id !== id));
      try {
        await deleteExpenseDoc(id);
      } catch (err) {
        console.warn(err);
      }
      showToast('Đã xóa khoản chi');
    },
    [showToast]
  );

  // Thao tác nhân viên
  const addEmployee = useCallback(
    async ({ name, roleLabel, baseSalary }) => {
      if (!name?.trim()) return;
      const salaryNum = Number(String(baseSalary).replace(/\D/g, '')) || 6600000;
      const empId = 'emp-' + Date.now();
      const created = {
        id: empId,
        name: name.trim(),
        roleLabel: roleLabel?.trim() || 'Nhân viên xưởng',
        baseSalary: salaryNum,
        slug: generateRandomSlug(name),
        active: true,
      };

      setEmployees((prev) => [...prev, created]);

      try {
        await saveEmployeeDoc(created);
      } catch (err) {
        console.warn(err);
      }

      showToast(`Đã thêm ${created.name} & tạo link riêng!`);
    },
    [showToast]
  );

  const saveSalaryEdit = useCallback(
    async (empId, newSalary) => {
      const val = Number(String(newSalary).replace(/\D/g, ''));
      if (val > 0) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === empId ? { ...emp, baseSalary: val } : emp))
        );
        try {
          await updateEmployeeSalaryDoc(empId, val);
        } catch (err) {
          console.warn(err);
        }
        showToast('Đã cập nhật mức lương cơ bản!');
      }
    },
    [showToast]
  );

  const regenerateSlug = useCallback(
    async (empId) => {
      const empTarget = employees.find((e) => e.id === empId);
      const nextSlug = generateRandomSlug(empTarget?.name || 'nv');

      setEmployees((prev) =>
        prev.map((emp) => (emp.id === empId ? { ...emp, slug: nextSlug } : emp))
      );

      try {
        await updateEmployeeSlugDoc(empId, nextSlug);
      } catch (err) {
        console.warn(err);
      }

      showToast('Đã đổi mã link mới! Link cũ đã vô hiệu hóa.');
    },
    [employees, showToast]
  );

  const copyEmployeeLink = useCallback(
    (emp) => {
      const origin =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://labhungdecor.app';
      const fullUrl = `${origin}/e/${emp.slug}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(fullUrl).catch(() => {});
      }
      setCopiedEmpId(emp.id);
      setTimeout(() => {
        setCopiedEmpId((prev) => (prev === emp.id ? null : prev));
      }, 2000);
      showToast(`Đã copy link của ${emp.name}`);
    },
    [showToast]
  );

  // Xác thực Admin
  const loginAdmin = useCallback(
    async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      if (!cleanEmail || !cleanPassword) {
        throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      }

      if (isFirebaseConfigured && firebaseAuth) {
        await signInWithEmailAndPassword(firebaseAuth, cleanEmail, cleanPassword);
        setIsAdminAuthenticated(true);
        showToast('Đăng nhập Admin thành công qua Firebase!');
        return;
      }

      if (cleanEmail === DEMO_ADMIN_EMAIL.toLowerCase() && cleanPassword === adminPassword) {
        setIsAdminAuthenticated(true);
        showToast('Đăng nhập Admin thành công!');
      } else {
        throw new Error(
          `Email hoặc mật khẩu không đúng. Tài khoản demo: ${DEMO_ADMIN_EMAIL} / ${adminPassword}`
        );
      }
    },
    [adminPassword, showToast]
  );

  const logoutAdmin = useCallback(async () => {
    if (isFirebaseConfigured && firebaseAuth) {
      try {
        await signOut(firebaseAuth);
      } catch (err) {
        console.warn(err);
      }
    }
    setIsAdminAuthenticated(false);
    showToast('Đã đăng xuất khỏi tài khoản Admin');
  }, [showToast]);

  const changeAdminPassword = useCallback((current, nextPw, confirmPw) => {
    if (current !== adminPassword) {
      throw new Error('Mật khẩu hiện tại chưa chính xác.');
    }
    if (nextPw.length < 4) {
      throw new Error('Mật khẩu mới cần ít nhất 4 ký tự.');
    }
    if (nextPw !== confirmPw) {
      throw new Error('Mật khẩu xác nhận không khớp với mật khẩu mới.');
    }
    setAdminPassword(nextPw);
  }, [adminPassword]);

  const seedSampleData = useCallback(async () => {
    try {
      await seedSampleDataToFirestore(employees, attendance, advances, expenses);
      showToast('Đã đẩy dữ liệu mẫu lên Firestore thành công!');
    } catch {
      showToast('Không thể đẩy dữ liệu mẫu. Hãy kiểm tra quyền ghi Firestore.');
    }
  }, [employees, attendance, advances, expenses, showToast]);

  // Xuất file Excel
  const handleExportWorkshop = useCallback(
    async (mode = 'single') => {
      setIsExportingExcel(true);
      try {
        const fileName = await exportWorkshopExcel(
          mode,
          selectedMonth,
          employees,
          attendance,
          advances,
          expenses
        );
        showToast(`Đã tải xuống file ${fileName}`);
      } catch (err) {
        console.error(err);
        showToast('Có lỗi khi xuất Excel xưởng, vui lòng thử lại!');
      } finally {
        setIsExportingExcel(false);
      }
    },
    [selectedMonth, employees, attendance, advances, expenses, showToast]
  );

  const handleExportEmployee = useCallback(
    async (emp) => {
      setIsExportingExcel(true);
      try {
        const fileName = await exportEmployeeExcel(
          emp,
          selectedMonth,
          attendance,
          advances,
          expenses
        );
        showToast(`Đã tải xuống bảng lương Excel của ${emp.name}`);
      } catch (err) {
        console.error(err);
        showToast('Có lỗi khi xuất Excel cá nhân, vui lòng thử lại!');
      } finally {
        setIsExportingExcel(false);
      }
    },
    [selectedMonth, attendance, advances, expenses, showToast]
  );

  // Tính toán dữ liệu phái sinh
  const currentMonthDays = useMemo(() => getDaysInMonth(selectedMonth), [selectedMonth]);

  const calendarCells = useMemo(() => {
    const firstDayOffset = currentMonthDays[0]?.mondayBasedIndex || 0;
    const cells = [];
    for (let i = 0; i < firstDayOffset; i++) {
      cells.push(null);
    }
    currentMonthDays.forEach((d) => cells.push(d));
    return cells;
  }, [currentMonthDays]);

  const monthPayrollSummary = useMemo(() => {
    return employees.map((emp) => ({
      employee: emp,
      ...calculateEmployeeMonthPayroll(emp, selectedMonth, attendance, advances, expenses),
    }));
  }, [employees, selectedMonth, attendance, advances, expenses]);

  const kpiStats = useMemo(() => {
    const totalNetPayroll = monthPayrollSummary.reduce((sum, item) => sum + item.netSalary, 0);
    const totalWorkDays = monthPayrollSummary.reduce((sum, item) => sum + item.totalDays, 0);
    const totalAdvances = monthPayrollSummary.reduce((sum, item) => sum + item.totalAdvances, 0);
    const monthExpenses = expenses.filter((e) => e.month === selectedMonth);
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalReimbursements = monthExpenses
      .filter((e) => e.reimburse)
      .reduce((sum, e) => sum + e.amount, 0);
    const totalFuel = monthExpenses
      .filter((e) => e.category === 'Đổ xăng')
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      totalNetPayroll,
      totalWorkDays,
      totalAdvances,
      totalExpenses,
      totalReimbursements,
      totalFuel,
    };
  }, [monthPayrollSummary, expenses, selectedMonth]);

  const selectedMonthDisplayLabel = useMemo(() => {
    const [yr, mo] = selectedMonth.split('-');
    const foundMonth = AVAILABLE_MONTHS.find((m) => m.value === mo);
    return `${foundMonth ? foundMonth.label : `Tháng ${Number(mo)}`}/${yr}`;
  }, [selectedMonth]);

  return {
    employees,
    selectedMonth,
    setSelectedMonth,
    selectedMonthDisplayLabel,
    attendance,
    advances,
    expenses,
    isAdminAuthenticated,
    adminPassword,
    cloudSyncStatus,
    isFirebaseConfigured,
    toast,
    showToast,
    copiedEmpId,
    isExportingExcel,
    currentMonthDays,
    calendarCells,
    monthPayrollSummary,
    kpiStats,
    STANDARD_WORK_DAYS,
    DEMO_ADMIN_EMAIL,
    // Actions
    toggleAttendance,
    quickMarkSingleEmployee,
    quickMarkAllToday,
    addAdvance,
    deleteAdvance,
    addExpense,
    deleteExpense,
    addEmployee,
    saveSalaryEdit,
    regenerateSlug,
    copyEmployeeLink,
    loginAdmin,
    logoutAdmin,
    changeAdminPassword,
    seedSampleData,
    handleExportWorkshop,
    handleExportEmployee,
    calculatePayroll: (emp, mKey = selectedMonth) =>
      calculateEmployeeMonthPayroll(emp, mKey, attendance, advances, expenses),
  };
}

