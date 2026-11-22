'use client';

import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Modal from '../common/Modal';
import FormField, { DayOfMonthSelect, defaultDateForMonth, inputClass, primaryButtonClass } from '../common/FormField';

export const EXPENSE_CATEGORIES = ['Đổ xăng', 'Vật tư xưởng', 'Cước vận chuyển', 'Ăn uống', 'Khác'];

/** Mount khi mở (xem page.js) nên form luôn khởi tạo lại theo tháng đang chọn */
export default function ExpenseModal({ onClose, employees, selectedMonth, onAddExpense }) {
  const [form, setForm] = useState({
    date: defaultDateForMonth(selectedMonth),
    // Người chi mặc định = người đứng đầu danh sách nhân viên (thứ tự trên bảng lương)
    payerId: employees[0]?.id || '',
    buyerId: employees[0]?.id || '',
    category: EXPENSE_CATEGORIES[0],
    note: '',
    amount: '',
    reimburse: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  // Tiền hoàn chi được cộng vào lương người chi (giống mục "Chi Tiêu" trong bảng lương tổng)
  const payer = employees.find((e) => e.id === form.payerId);
  const isFund = form.buyerId === 'fund';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddExpense({ ...form, employeeId: form.buyerId });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Ghi nhận chi tiêu / đổ xăng" icon={<ShoppingBag className="w-5 h-5" />}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Danh mục">
            <select value={form.category} onChange={set('category')} className={inputClass}>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Ngày chi">
            <DayOfMonthSelect
              monthKey={selectedMonth}
              value={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Người chi tiền">
            <select value={form.payerId} onChange={set('payerId')} className={inputClass}>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Người mua">
            <select value={form.buyerId} onChange={set('buyerId')} className={inputClass}>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
              <option value="fund">Quỹ chung</option>
            </select>
          </FormField>
        </div>

        <FormField label="Số tiền (VNĐ)">
          <input
            type="number"
            inputMode="numeric"
            min="1000"
            step="1000"
            placeholder="VD: 150000"
            value={form.amount}
            onChange={set('amount')}
            className={`${inputClass} text-base font-extrabold`}
            required
            autoFocus
          />
        </FormField>

        <FormField label="Nội dung">
          <input
            type="text"
            placeholder="VD: Đổ xăng giao hàng, keo 502..."
            value={form.note}
            onChange={set('note')}
            className={inputClass}
          />
        </FormField>

        {!isFund && (
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 cursor-pointer">
            <input
              type="checkbox"
              checked={form.reimburse}
              onChange={(e) => setForm((prev) => ({ ...prev, reimburse: e.target.checked }))}
              className="w-5 h-5 accent-emerald-600"
            />
            <span className="text-xs font-bold text-sky-950">
              Hoàn vào lương cuối tháng cho người chi{payer ? ` (${payer.name})` : ''}
            </span>
          </label>
        )}

        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Đang lưu...' : 'Lưu khoản chi tiêu'}
        </button>
      </form>
    </Modal>
  );
}
