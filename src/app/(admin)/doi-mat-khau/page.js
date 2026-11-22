'use client';

import React from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import ChangePasswordForm from '../../../components/admin/ChangePasswordForm';

export default function ChangePasswordPage() {
  const data = usePayroll();
  return <ChangePasswordForm email={data.adminEmail} onChangePassword={data.changeAdminPassword} />;
}
