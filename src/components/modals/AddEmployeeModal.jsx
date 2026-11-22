'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from '../common/Modal';
import FormField, { inputClass, primaryButtonClass } from '../common/FormField';

const DEFAULT_SALARY = '6600000';

/** Mount khi mở (xem page.js) nên form luôn trống mỗi lần mở */
export default function AddEmployeeModal({ onClose, onAddEmployee }) {
  const [form, setForm] = useState({ name: '', roleLabel: 'Nhân viên xưởng', baseSalary: DEFAULT_SALARY });
  const [isSaving, setIsSaving] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddEmployee(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Thêm nhân sự & tạo link riêng" icon={<UserPlus className="w-5 h-5" />}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField label="Tên nhân viên">
          <input
            type="text"
            placeholder="VD: Hùng, Nam..."
            value={form.name}
            onChange={set('name')}
            className={inputClass}
            required
            autoFocus
          />
        </FormField>
        <FormField label="Vị trí / công việc">
          <input type="text" value={form.roleLabel} onChange={set('roleLabel')} className={inputClass} />
        </FormField>
        <FormField label="Lương cơ bản / tháng (VNĐ)" hint="Lương 1 ngày = lương cơ bản ÷ 30">
          <input
            type="number"
            inputMode="numeric"
            min="0"
            step="100000"
            value={form.baseSalary}
            onChange={set('baseSalary')}
            className={`${inputClass} font-extrabold`}
            required
          />
        </FormField>
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Đang tạo...' : 'Tạo nhân viên & sinh link'}
        </button>
      </form>
    </Modal>
  );
}
