'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Fuel, Package, Truck, Utensils, Receipt, Trash2, Pencil, Users, X, Landmark } from 'lucide-react';
import { formatVND } from '../../lib/payroll';
import { EXPENSE_CATEGORIES } from '../modals/ExpenseModal';
import ConfirmButton from '../common/ConfirmButton';
import EmployeeAvatar from '../common/EmployeeAvatar';

export const CATEGORY_STYLE = {
  'Đổ xăng': { Icon: Fuel, className: 'bg-indigo-100 text-indigo-700' },
  'Vật tư xưởng': { Icon: Package, className: 'bg-emerald-100 text-emerald-700' },
  'Cước vận chuyển': { Icon: Truck, className: 'bg-amber-100 text-amber-700' },
  'Ăn uống': { Icon: Utensils, className: 'bg-rose-100 text-rose-700' },
};
export const DEFAULT_CATEGORY_STYLE = { Icon: Receipt, className: 'bg-slate-100 text-slate-700' };

/** Người mua của 1 khoản chi ('fund' = Quỹ chung) */
const buyerIdOf = (item) => item.buyerId || item.employeeId || 'unknown';

/**
 * Tổng chi theo từng người mua (sắp xếp giảm dần). Bấm 1 người để chỉ xem các khoản người đó mua.
 * Tính trên danh mục đang lọc, VD chọn "Đổ xăng" → biết mỗi người đổ xăng hết bao nhiêu.
 */
function BuyerSummary({ rows, total, activeBuyer, onSelect, filterLabel }) {
  if (rows.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-3.5">
      <div className="flex items-center justify-between gap-2 mb-2 min-h-7">
        <h2 className="flex items-center gap-1.5 text-xs font-extrabold text-slate-900 min-w-0">
          <Users className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">
            Chi theo người mua
            {filterLabel && <span className="font-semibold text-slate-400"> · {filterLabel}</span>}
          </span>
        </h2>
        {activeBuyer && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-600 cursor-pointer shrink-0"
          >
            <X className="w-3 h-3" />
            Bỏ lọc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
        {rows.map((row) => {
          const isActive = activeBuyer === row.id;
          const share = total > 0 ? Math.round((row.amount / total) * 100) : 0;
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onSelect(isActive ? null : row.id)}
              aria-pressed={isActive}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl border text-left transition-colors cursor-pointer ${
                isActive
                  ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/15'
                  : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100'
              } ${activeBuyer && !isActive ? 'opacity-60' : ''}`}
            >
              {row.id === 'fund' ? (
                <span className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Landmark className="w-4 h-4" />
                </span>
              ) : (
                <EmployeeAvatar name={row.name} size="sm" />
              )}
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">{row.name}</span>
                  <span className="text-xs font-black text-slate-900 tabular-nums whitespace-nowrap">{formatVND(row.amount)}</span>
                </span>
                <span className="mt-1 flex items-center gap-2">
                  <span className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${share}%` }} />
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 tabular-nums whitespace-nowrap">
                    {row.count} khoản · {share}%
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ExpensesTab({
  expenses,
  employees,
  selectedMonth,
  totalExpenses,
  totalReimbursements,
  totalFuel,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
}) {
  const [filter, setFilter] = useState('all');
  const [buyerFilter, setBuyerFilter] = useState(null);

  const monthExpenses = useMemo(() => expenses.filter((e) => e.month === selectedMonth), [expenses, selectedMonth]);
  const byCategory = useMemo(
    () => (filter === 'all' ? monthExpenses : monthExpenses.filter((e) => e.category === filter)),
    [monthExpenses, filter]
  );
  const nameOf = (id) => (id === 'fund' ? 'Quỹ chung' : employees.find((e) => e.id === id)?.name || 'Nhân viên đã nghỉ');
  const buyerName = (item) => nameOf(buyerIdOf(item));

  const buyerRows = useMemo(() => {
    const map = new Map();
    byCategory.forEach((item) => {
      const id = buyerIdOf(item);
      const row = map.get(id) || { id, amount: 0, count: 0 };
      row.amount += Number(item.amount) || 0;
      row.count += 1;
      map.set(id, row);
    });
    return [...map.values()]
      .map((row) => ({
        ...row,
        name: row.id === 'fund' ? 'Quỹ chung' : employees.find((e) => e.id === row.id)?.name || 'Nhân viên đã nghỉ',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [byCategory, employees]);
  const categoryTotal = buyerRows.reduce((sum, r) => sum + r.amount, 0);

  // Người đang lọc không còn khoản nào (đổi tháng / danh mục) thì coi như bỏ lọc
  const activeBuyer = buyerRows.some((r) => r.id === buyerFilter) ? buyerFilter : null;
  const visible = activeBuyer ? byCategory.filter((e) => buyerIdOf(e) === activeBuyer) : byCategory;

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

      <BuyerSummary
        rows={buyerRows}
        total={categoryTotal}
        activeBuyer={activeBuyer}
        onSelect={setBuyerFilter}
        filterLabel={filter === 'all' ? '' : filter}
      />

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
            const { Icon, className } = CATEGORY_STYLE[item.category] || DEFAULT_CATEGORY_STYLE;
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

                <div className="flex items-center gap-0.5 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap mr-1">
                    {formatVND(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditExpense(item)}
                    aria-label="Sửa khoản chi"
                    title="Sửa"
                    className="h-9 w-9 rounded-xl text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 inline-flex items-center justify-center cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
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
