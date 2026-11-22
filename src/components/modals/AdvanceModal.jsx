'use client';

import React, { useState } from 'react';
import { HandCoins } from 'lucide-react';
import Modal from '../common/Modal';
import FormField, { DayOfMonthSelect, defaultDateForMonth, inputClass, primaryButtonClass } from '../common/FormField';

/** Mount khi mở (xem page.js) nên form luôn khởi tạo lại theo tháng đang chọn */
export default function AdvanceModal({ onClose, employees, selectedMonth, onAddAdvance }) {
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || '',
    date: defaultDateForMonth(selectedMonth),
    type: 'advance',
    amount: '',
    note: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddAdvance(form);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Nhập ứng lương / tiền ảnh" icon={<HandCoins className="w-5 h-5" />}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField label="Nhân viên">
          <select value={form.employeeId} onChange={set('employeeId')} className={inputClass}>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Loại">
            <select value={form.type} onChange={set('type')} className={inputClass}>
              <option value="advance">Ứng lương</option>
              <option value="photo_fee">Tiền ảnh</option>
              <option value="other_deduction">Khoản trừ khác</option>
            </select>
          </FormField>
          <FormField label="Ngày">
            <DayOfMonthSelect
              monthKey={selectedMonth}
              value={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
            />
          </FormField>
        </div>

        <FormField label="Số tiền (VNĐ)">
          <input
            type="number"
            inputMode="numeric"
            min="1000"
            step="1000"
            placeholder="VD: 1000000"
            value={form.amount}
            onChange={set('amount')}
            className={`${inputClass} text-base font-extrabold`}
            required
            autoFocus
          />
        </FormField>

        <FormField label="Ghi chú">
          <input
            type="text"
            placeholder="VD: Ứng lương đợt 2..."
            value={form.note}
            onChange={set('note')}
            className={inputClass}
          />
        </FormField>

        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Đang lưu...' : 'Lưu & cập nhật phiếu lương'}
        </button>
      </form>
    </Modal>
  );
}
