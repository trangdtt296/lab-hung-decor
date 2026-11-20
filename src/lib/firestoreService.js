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

export const updateEmployeeSalaryDoc = async (empId, baseSalary) => {
  if (!isFirebaseConfigured || !firebaseDb) return;
  await updateDoc(doc(firebaseDb, 'employees', empId), {
    baseSalary,
    updatedAt: serverTimestamp(),
  });
};

export const seedSampleDataToFirestore = async (
  employees = [],
  attendance = {},
  advances = [],
  expenses = []
) => {
  if (!isFirebaseConfigured || !firebaseDb) {
    throw new Error('Chưa cấu hình Firebase');
  }

  const batch = writeBatch(firebaseDb);

  employees.forEach((emp) => {
    batch.set(doc(firebaseDb, 'employees', emp.id), {
      ...emp,
      updatedAt: serverTimestamp(),
    });
  });

  Object.entries(attendance).forEach(([mKey, empMap]) => {
    const [yrStr, moStr] = mKey.split('-');
    Object.entries(empMap || {}).forEach(([empId, daysMap]) => {
      batch.set(doc(firebaseDb, 'attendance', `${empId}_${mKey}`), {
        employeeId: empId,
        monthKey: mKey,
        year: Number(yrStr),
        month: Number(moStr),
        days: daysMap,
        updatedAt: serverTimestamp(),
      });
    });
  });

  advances.forEach((adv) => {
    batch.set(doc(firebaseDb, 'advances', adv.id), {
      ...adv,
      updatedAt: serverTimestamp(),
    });
  });

  expenses.forEach((exp) => {
    batch.set(doc(firebaseDb, 'expenses', exp.id), {
      ...exp,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
};

