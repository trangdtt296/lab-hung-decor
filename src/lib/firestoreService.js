/**
 * src/lib/firestoreService.js
 * Chứa toàn bộ các hàm đọc/ghi dữ liệu Firestore cho 4 collections:
 * employees, attendance, advances, expenses
 */
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  FieldPath,
} from 'firebase/firestore';
import { firebaseDb, isFirebaseConfigured } from './firebase';

export const saveAttendanceDoc = async (empId, monthKey, daysMap) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  const [yrStr, moStr] = monthKey.split('-');
  await setDoc(
    doc(firebaseDb, 'attendance', `${empId}_${monthKey}`),
    {
      employeeId: empId,
      monthKey,
      year: Number(yrStr),
      month: Number(moStr),
      days: daysMap,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const saveBatchAttendanceDoc = async (monthKey, monthMap, employees) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  const [yrStr, moStr] = monthKey.split('-');
  const batch = writeBatch(firebaseDb);
  employees.forEach((emp) => {
    batch.set(
      doc(firebaseDb, 'attendance', `${emp.id}_${monthKey}`),
      {
        employeeId: emp.id,
        monthKey,
        year: Number(yrStr),
        month: Number(moStr),
        days: monthMap[emp.id] || {},
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });
  await batch.commit();
};

export const saveAdvanceDoc = async (advanceItem) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await setDoc(doc(firebaseDb, 'advances', advanceItem.id), {
    ...advanceItem,
    createdAt: serverTimestamp(),
  });
};

export const deleteAdvanceDoc = async (id) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await deleteDoc(doc(firebaseDb, 'advances', id));
};

export const saveExpenseDoc = async (expenseItem) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await setDoc(doc(firebaseDb, 'expenses', expenseItem.id), {
    ...expenseItem,
    createdAt: serverTimestamp(),
  });
};

export const deleteExpenseDoc = async (id) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await deleteDoc(doc(firebaseDb, 'expenses', id));
};

export const saveEmployeeDoc = async (emp) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await setDoc(doc(firebaseDb, 'employees', emp.id), {
    ...emp,
    createdAt: serverTimestamp(),
  });
};

/** Đánh dấu nhân viên nghỉ việc từ tháng inactiveFrom (dữ liệu cũ giữ nguyên) */
export const updateEmployeeStatusDoc = async (empId, active, inactiveFrom = null) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await updateDoc(doc(firebaseDb, 'employees', empId), {
    active,
    inactiveFrom: active ? null : inactiveFrom,
    updatedAt: serverTimestamp(),
  });
};

export const updateEmployeeSlugDoc = async (empId, slug) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await updateDoc(doc(firebaseDb, 'employees', empId), {
    slug,
    updatedAt: serverTimestamp(),
  });
};

/**
 * Ghi mốc lương có hiệu lực từ `monthKey` (salaryByMonth.<monthKey>) và lương hiện hành.
 * Dùng FieldPath vì key tháng có dấu '-'.
 */
export const updateEmployeeSalaryDoc = async (empId, monthKey, salary, currentBaseSalary) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await updateDoc(
    doc(firebaseDb, 'employees', empId),
    new FieldPath('salaryByMonth', monthKey),
    salary,
    'baseSalary',
    currentBaseSalary,
    'updatedAt',
    serverTimestamp()
  );
};


/**
 * Ghi dữ liệu cũ đọc từ file Excel (xem legacyImport.js). Chỉ dùng qua popup LegacyImportModal,
 * popup này ẩn/hiện bằng cờ settings/app.legacyImportEnabled trên Firestore.
 * Chia nhiều batch vì Firestore giới hạn 500 thao tác / batch.
 */
export const importLegacyDataDocs = async ({ employees, attendance, advances, expenses }) => {
  if (!isFirebaseConfigured || !firebaseDb) throw new Error('Chưa cấu hình Firebase');
  const now = serverTimestamp();
  const ops = [
    ...employees.map((e) => ['employees', e.id, { ...e, createdAt: now }]),
    ...Object.entries(attendance).flatMap(([monthKey, byEmp]) => {
      const [year, month] = monthKey.split('-').map(Number);
      return Object.entries(byEmp).map(([empId, days]) => [
        'attendance',
        `${empId}_${monthKey}`,
        { employeeId: empId, monthKey, year, month, days, updatedAt: now },
      ]);
    }),
    ...advances.map((a) => ['advances', a.id, { ...a, createdAt: now }]),
    ...expenses.map((x) => ['expenses', x.id, { ...x, createdAt: now }]),
  ];
  for (let i = 0; i < ops.length; i += 450) {
    const batch = writeBatch(firebaseDb);
    ops.slice(i, i + 450).forEach(([col, id, data]) => batch.set(doc(firebaseDb, col, id), data));
    await batch.commit();
  }
  return ops.length;
};
