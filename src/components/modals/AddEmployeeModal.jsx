'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddEmployeeModal({ isOpen, onClose, onAddEmployee }) {
  const [form, setForm] = useState({
    name: '',
    roleLabel: 'Nhân viên xưởng',
    baseSalary: '6600000',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddEmployee(form);
    setForm({ name: '', roleLabel: 'Nhân viên xưởng', baseSalary: '6600000' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Thêm nhân sự & Tạo link riêng
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
              Tên nhân viên
            </label>
            <input
              type="text"
              placeholder="VD: Hùng, Nam..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Vị trí</label>
            <input
              type="text"
              value={form.roleLabel}
              onChange={(e) => setForm({ ...form, roleLabel: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lương cơ bản / tháng (VNĐ)
            </label>
            <input
              type="number"
              step="100000"
              value={form.baseSalary}
              onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md cursor-pointer"
          >
            Tạo nhân viên & Sinh link
          </button>
        </form>
      </div>
    </div>
  );
}

