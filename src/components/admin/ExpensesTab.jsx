'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Fuel, Package, Truck, Utensils, Receipt, Trash2 } from 'lucide-react';
import { formatVND } from '../../lib/payroll';
import { EXPENSE_CATEGORIES } from '../modals/ExpenseModal';
import ConfirmButton from '../common/ConfirmButton';

const CATEGORY_STYLE = {
  'Đổ xăng': { Icon: Fuel, className: 'bg-indigo-100 text-indigo-700' },
  'Vật tư xưởng': { Icon: Package, className: 'bg-emerald-100 text-emerald-700' },
  'Cước vận chuyển': { Icon: Truck, className: 'bg-amber-100 text-amber-700' },
  'Ăn uống': { Icon: Utensils, className: 'bg-rose-100 text-rose-700' },
};
const DEFAULT_STYLE = { Icon: Receipt, className: 'bg-slate-100 text-slate-700' };

export default function ExpensesTab({
  expenses,
  employees,
  selectedMonth,
  totalExpenses,
  totalReimbursements,
  totalFuel,
  onOpenAddExpense,
  onDeleteExpense,
}) {
  const [filter, setFilter] = useState('all');

  const monthExpenses = useMemo(() => expenses.filter((e) => e.month === selectedMonth), [expenses, selectedMonth]);
  const visible = filter === 'all' ? monthExpenses : monthExpenses.filter((e) => e.category === filter);
  const buyerName = (item) => {
    const id = item.buyerId || item.employeeId;
    if (id === 'fund') return 'Quỹ chung';
    return employees.find((e) => e.id === id)?.name || id;
  };

  const stats = [
    { label: 'Tổng chi', value: totalExpenses, color: 'text-slate-900' },
    { label: 'Hoàn ứng NV', value: totalReimbursements, color: 'text-sky-700' },
    { label: 'Đổ xăng', value: totalFuel, color: 'text-indigo-700' },
  ];
  const chips = [{ id: 'all', label: 'Tất cả' }, ...EXPENSE_CATEGORIES.map((c) => ({ id: c, label: c }))];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 min-w-0">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{label}</div>
            <div className={`text-xs sm:text-sm font-black mt-0.5 tabular-nums truncate ${color}`}>{formatVND(value)}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        {/* Mobile: chip cuộn ngang thay vì xuống nhiều dòng */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap min-w-0">
          {chips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setFilter(chip.id)}
              aria-pressed={filter === chip.id}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                filter === chip.id ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenAddExpense}
          aria-label="Thêm khoản chi"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span className="hidden sm:inline">Thêm khoản chi</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Chưa có khoản chi tiêu nào {filter === 'all' ? 'trong tháng này' : `thuộc "${filter}"`}.
          </div>
        ) : (
          visible.map((item) => {
            const { Icon, className } = CATEGORY_STYLE[item.category] || DEFAULT_STYLE;
            return (
              <div key={item.id} className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${className}`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 break-words leading-snug">{item.note}</div>
                  <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500 mt-0.5">
                    <span>{item.date}</span>
                    <span aria-hidden>•</span>
                    <span className="font-semibold text-slate-700">{buyerName(item)}</span>
                    {item.reimburse && (
                      <span className="px-1.5 py-px rounded-full bg-sky-100 text-sky-700 font-bold text-[10px]">Hoàn lương</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatVND(item.amount)}
                  </span>
                  <ConfirmButton
                    onConfirm={() => onDeleteExpense(item.id)}
                    aria-label="Xoá khoản chi"
                    className="h-9 min-w-9 px-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold"
                    confirmChildren="Xoá?"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </ConfirmButton>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
