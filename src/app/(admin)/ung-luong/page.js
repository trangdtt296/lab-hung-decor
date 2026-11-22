'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import AdvancesTab from '../../../components/admin/AdvancesTab';
import AdvanceModal from '../../../components/modals/AdvanceModal';

export default function AdvancesPage() {
  const data = usePayroll();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <AdvancesTab
        advances={data.advances}
        employees={data.employees}
        selectedMonth={data.selectedMonth}
        totalAdvances={data.kpiStats.totalAdvances}
        onOpenAddAdvance={() => setIsAddOpen(true)}
        onDeleteAdvance={data.deleteAdvance}
      />
      {isAddOpen && (
        <AdvanceModal
          onClose={() => setIsAddOpen(false)}
          employees={data.activeEmployees}
          selectedMonth={data.selectedMonth}
          onAddAdvance={data.addAdvance}
        />
      )}
    </>
  );
}
