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

