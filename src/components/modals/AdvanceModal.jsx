'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AdvanceModal({
  isOpen,
  onClose,
  employees,
  selectedMonth,
  onAddAdvance,
}) {
  const [, m] = (selectedMonth || '2026-08').split('-');
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || 'duong',
    date: `15/${m || '08'}`,
    type: 'advance',
    amount: '',
    note: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddAdvance(form);
    setForm((prev) => ({ ...prev, amount: '', note: '' }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Nhập Ứng lương / Tiền ảnh
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhân viên
            </label>
            <select
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
              >
                <option value="advance">Ứng lương</option>
                <option value="photo_fee">Tiền ảnh</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày</label>
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
              Số tiền (VNĐ)
            </label>
            <input
              type="number"
              step="1000"
              placeholder="VD: 1000000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-extrabold"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú</label>
            <input
              type="text"
              placeholder="VD: Ứng lương đợt 2..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md cursor-pointer"
          >
            Lưu & Cập nhật phiếu lương
          </button>
        </form>
      </div>
    </div>
  );
}

