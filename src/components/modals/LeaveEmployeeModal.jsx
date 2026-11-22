'use client';

import React, { useState } from 'react';
import { UserMinus } from 'lucide-react';
import Modal from '../common/Modal';
import EmployeeAvatar from '../common/EmployeeAvatar';

/** Xác nhận cho nhân viên nghỉ việc: bỏ khỏi bảng chấm công từ tháng đang xem */
export default function LeaveEmployeeModal({ employee, monthLabel, onClose, onConfirm }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Cho nhân viên nghỉ việc?"
      icon={<UserMinus className="w-5 h-5" />}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-extrabold shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isSaving ? 'Đang lưu...' : 'Cho nghỉ việc'}
          </button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
          <EmployeeAvatar name={employee.name} size="sm" />
          <span className="text-sm font-extrabold text-slate-900">{employee.name}</span>
        </div>
        <ul className="text-xs text-slate-600 leading-relaxed space-y-1.5 list-disc pl-4">
          <li>
            {employee.name} sẽ <strong>không còn trong bảng chấm công</strong> từ <strong>{monthLabel}</strong> trở đi.
          </li>
          <li>Chấm công, ứng lương và bảng lương các tháng trước vẫn giữ nguyên.</li>
          <li>Link xem phiếu lương của {employee.name} sẽ ngừng hoạt động.</li>
          <li>
            Nếu {employee.name} đi làm lại, bấm <strong>Đi làm lại</strong> ở mục &quot;Nhân viên đã nghỉ&quot; cuối bảng chấm công.
          </li>
        </ul>
      </div>
    </Modal>
  );
}
