'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function ExpenseModal({
  isOpen,
  onClose,
  employees,
  selectedMonth,
  onAddExpense,
}) {
  const [, m] = (selectedMonth || '2026-08').split('-');
  const [form, setForm] = useState({
    date: `15/${m || '08'}`,
    employeeId: employees[0]?.id || 'thuy',
    category: 'Đổ xăng',
    note: '',
    amount: '',
    reimburse: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddExpense(form);
    setForm((prev) => ({ ...prev, amount: '', note: '' }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Ghi nhận Chi tiêu / Đổ xăng
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Danh mục
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <option value="Đổ xăng">Đổ xăng</option>
                <option value="Vật tư xưởng">Vật tư xưởng</option>
                <option value="Cước vận chuyển">Cước vận chuyển</option>
                <option value="Ăn uống">Ăn uống</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày chi
              </label>
              <input
                type="text"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Người chi
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => {
                const val = e.target.value;
                setForm({
                  ...form,
                  employeeId: val,
                  reimburse: val === 'fund' ? false : true,
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
              <option value="fund">Quỹ chung xưởng</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              step="1000"
              placeholder="VD: 150000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-extrabold"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung</label>
            <input
              type="text"
              placeholder="VD: Đổ xăng giao hàng, Keo 502..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          {form.employeeId !== 'fund' && (
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.reimburse}
                onChange={(e) => setForm({ ...form, reimburse: e.target.checked })}
                className="w-4 h-4 accent-emerald-600"
              />
              <span className="text-xs font-bold text-sky-950">
                Hoàn vào lương cuối tháng
              </span>
            </label>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md cursor-pointer"
          >
            Lưu khoản chi tiêu
          </button>
        </form>
      </div>
    </div>
  );
}

