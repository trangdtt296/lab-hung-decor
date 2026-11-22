'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import ExpensesTab from '../../../components/admin/ExpensesTab';
import ExpenseModal from '../../../components/modals/ExpenseModal';

export default function ExpensesPage() {
  const data = usePayroll();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <ExpensesTab
        expenses={data.expenses}
        employees={data.employees}
        selectedMonth={data.selectedMonth}
        totalExpenses={data.kpiStats.totalExpenses}
        totalReimbursements={data.kpiStats.totalReimbursements}
        totalFuel={data.kpiStats.totalFuel}
        onOpenAddExpense={() => setIsAddOpen(true)}
        onDeleteExpense={data.deleteExpense}
      />
      {isAddOpen && (
        <ExpenseModal
          onClose={() => setIsAddOpen(false)}
          employees={data.activeEmployees}
          selectedMonth={data.selectedMonth}
          onAddExpense={data.addExpense}
        />
      )}
    </>
  );
}
