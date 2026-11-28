'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import AdvancesTab from '../../../components/admin/AdvancesTab';
import AdvanceModal from '../../../components/modals/AdvanceModal';
import { withReferencedEmployees } from '../../../lib/payroll';

export default function AdvancesPage() {
  const data = usePayroll();
  // null = đóng; { item: null } = thêm mới; { item } = sửa khoản đó
  const [modal, setModal] = useState(null);
  const editing = modal?.item;

  return (
    <>
      <AdvancesTab
        advances={data.advances}
        employees={data.employees}
        selectedMonth={data.selectedMonth}
        totalAdvances={data.kpiStats.totalAdvances}
        onOpenAddAdvance={() => setModal({ item: null })}
        onEditAdvance={(item) => setModal({ item })}
        onDeleteAdvance={data.deleteAdvance}
      />
      {modal && (
        <AdvanceModal
          key={editing?.id || 'new'}
          onClose={() => setModal(null)}
          // Sửa khoản cũ của người đã nghỉ: vẫn giữ được tên người đó trong ô chọn
          employees={editing ? withReferencedEmployees(data.activeEmployees, data.employees, [editing.employeeId]) : data.activeEmployees}
          selectedMonth={data.selectedMonth}
          item={editing}
          onSave={editing ? (form) => data.updateAdvance(editing.id, form) : data.addAdvance}
        />
      )}
    </>
  );
}
