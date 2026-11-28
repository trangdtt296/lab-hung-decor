'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import ExpensesTab from '../../../components/admin/ExpensesTab';
import ExpenseModal from '../../../components/modals/ExpenseModal';
import { withReferencedEmployees } from '../../../lib/payroll';

export default function ExpensesPage() {
  const data = usePayroll();
  // null = đóng; { item: null } = thêm mới; { item } = sửa khoản đó
  const [modal, setModal] = useState(null);
  const editing = modal?.item;

  return (
    <>
      <ExpensesTab
        expenses={data.expenses}
        employees={data.employees}
        selectedMonth={data.selectedMonth}
        totalExpenses={data.kpiStats.totalExpenses}
        totalReimbursements={data.kpiStats.totalReimbursements}
        totalFuel={data.kpiStats.totalFuel}
        onOpenAddExpense={() => setModal({ item: null })}
        onEditExpense={(item) => setModal({ item })}
        onDeleteExpense={data.deleteExpense}
      />
      {modal && (
        <ExpenseModal
          key={editing?.id || 'new'}
          onClose={() => setModal(null)}
          // Sửa khoản cũ của người đã nghỉ: vẫn giữ được tên người đó trong ô chọn
          employees={
            editing
              ? withReferencedEmployees(data.activeEmployees, data.employees, [editing.payerId, editing.buyerId, editing.employeeId])
              : data.activeEmployees
          }
          selectedMonth={data.selectedMonth}
          item={editing}
          onSave={editing ? (form) => data.updateExpense(editing.id, form) : data.addExpense}
        />
      )}
    </>
  );
}
