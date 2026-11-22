'use client';

import React from 'react';
import { usePayroll } from '../../../components/admin/PayrollDataContext';
import LegacyImportPanel from '../../../components/admin/LegacyImportPanel';

/** Nhập dữ liệu cũ từ Excel — chỉ dùng được khi bật cờ settings/app.legacyImportEnabled trên Firestore */
export default function LegacyImportPage() {
  const data = usePayroll();

  if (!data.isLegacyImportEnabled) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-slate-200 text-center text-xs text-slate-500">
        Chức năng nhập dữ liệu đang tắt. Bật bằng cờ <code>settings/app.legacyImportEnabled = true</code> trên Firebase.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <LegacyImportPanel isDatabaseEmpty={data.isDatabaseEmpty} onImport={data.importLegacyData} />
    </div>
  );
}
