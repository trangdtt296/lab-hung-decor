'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import AttendanceTab from '../../../components/admin/AttendanceTab';
import AddEmployeeModal from '../../../components/modals/AddEmployeeModal';

export default function AttendancePage() {
  const data = usePayroll();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <>
      <AttendanceTab
        monthPayrollSummary={data.monthPayrollSummary}
        currentMonthDays={data.currentMonthDays}
        calendarCells={data.calendarCells}
        selectedMonthDisplayLabel={data.selectedMonthDisplayLabel}
        selectedMonth={data.selectedMonth}
        onToggleAttendance={data.toggleAttendance}
        onSetAttendanceValue={data.setAttendanceValue}
        onQuickMarkAllToday={data.quickMarkAllToday}
        onOpenAddEmployee={() => setIsAddOpen(true)}
        onMarkEmployeeLeft={data.markEmployeeLeft}
      />
      {isAddOpen && <AddEmployeeModal onClose={() => setIsAddOpen(false)} onAddEmployee={data.addEmployee} />}
    </>
  );
}
