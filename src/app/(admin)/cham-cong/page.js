'use client';

import React, { useState } from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import AttendanceTab from '../../../components/admin/AttendanceTab';
import AddEmployeeModal from '../../../components/modals/AddEmployeeModal';

export default function AttendancePage() {
  const data = usePayroll();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const inactiveEmployees = data.employees.filter((e) => e.active === false);

  return (
    <>
      <AttendanceTab
        monthPayrollSummary={data.monthPayrollSummary}
        currentMonthDays={data.currentMonthDays}
        calendarCells={data.calendarCells}
        selectedMonthDisplayLabel={data.selectedMonthDisplayLabel}
        selectedMonth={data.selectedMonth}
        inactiveEmployees={inactiveEmployees}
        onToggleAttendance={data.toggleAttendance}
        onSetAttendanceValue={data.setAttendanceValue}
        onQuickMarkAllToday={data.quickMarkAllToday}
        onOpenAddEmployee={() => setIsAddOpen(true)}
        onSetEmployeeActive={data.setEmployeeActive}
      />
      {isAddOpen && <AddEmployeeModal onClose={() => setIsAddOpen(false)} onAddEmployee={data.addEmployee} />}
    </>
  );
}
