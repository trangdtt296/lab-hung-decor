'use client';

import React from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import { useAdminUi } from '../../../components/admin/AdminShell';
import PayrollTab from '../../../components/admin/PayrollTab';

export default function PayrollPage() {
  const data = usePayroll();
  const { openExportModal } = useAdminUi();

  return (
    <PayrollTab
      monthPayrollSummary={data.monthPayrollSummary}
      totalNetPayroll={data.kpiStats.totalNetPayroll}
      selectedMonthDisplayLabel={data.selectedMonthDisplayLabel}
      standardWorkDays={data.STANDARD_WORK_DAYS}
      copiedEmpId={data.copiedEmpId}
      isExportingExcel={data.isExportingExcel}
      onOpenExportAllModal={openExportModal}
      onCopyLink={data.copyEmployeeLink}
      onExportEmployeeExcel={data.handleExportEmployee}
      onRegenerateSlug={data.regenerateSlug}
      onSaveSalaryEdit={data.saveSalaryEdit}
    />
  );
}
