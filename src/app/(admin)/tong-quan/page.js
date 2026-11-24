'use client';

import React from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import DashboardTab from '../../../components/admin/DashboardTab';

export default function DashboardPage() {
  const data = usePayroll();

  return (
    <DashboardTab
      employees={data.employees}
      attendance={data.attendance}
      advances={data.advances}
      expenses={data.expenses}
      selectedMonth={data.selectedMonth}
      onSelectMonth={data.setSelectedMonth}
    />
  );
}
