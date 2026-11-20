'use client';

import React, { useState } from 'react';
import { ShoppingBag, Fuel, Package, Truck, Utensils, Trash2 } from 'lucide-react';
import { formatVND } from '../../lib/payroll';

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
  const [expenseFilter, setExpenseFilter] = useState('all');

  const filteredExpenses = expenses
    .filter((e) => e.month === selectedMonth)
    .filter((e) => (expenseFilter === 'all' ? true : e.category === expenseFilter));

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between sm:block">
          <div className="text-[11px] font-semibold text-slate-500">Tổng chi</div>
          <div className="text-xs sm:text-sm font-black text-slate-900 sm:mt-0.5 tabular-nums whitespace-nowrap">
            {formatVND(totalExpenses)}
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between sm:block">
          <div className="text-[11px] font-semibold text-sky-700">Hoàn ứng NV</div>
          <div className="text-xs sm:text-sm font-black text-sky-700 sm:mt-0.5 tabular-nums whitespace-nowrap">
            {formatVND(totalReimbursements)}
          </div>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between sm:block">
          <div className="text-[11px] font-semibold text-indigo-700">Tiền đổ xăng</div>
          <div className="text-xs sm:text-sm font-black text-indigo-700 sm:mt-0.5 tabular-nums whitespace-nowrap">
            {formatVND(totalFuel)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Đổ xăng', label: 'Đổ xăng' },
            { id: 'Vật tư xưởng', label: 'Vật tư' },
            { id: 'Cước vận chuyển', label: 'Cước xe' },
          ].map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setExpenseFilter(chip.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                expenseFilter === chip.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
          <span>Khoản chi</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Chưa có khoản chi tiêu nào trong tháng này.
          </div>
        ) : (
          filteredExpenses.map((item) => {
            const emp = employees.find((e) => e.id === item.employeeId);
            return (
              <div
                key={item.id}
                className="w-full min-w-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <div
                    className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                      item.category === 'Đổ xăng'
                        ? 'bg-indigo-100 text-indigo-700'
                        : item.category === 'Vật tư xưởng'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.category === 'Cước vận chuyển'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.category === 'Đổ xăng' ? (
                      <Fuel className="w-4 h-4" />
                    ) : item.category === 'Vật tư xưởng' ? (
                      <Package className="w-4 h-4" />
                    ) : item.category === 'Cước vận chuyển' ? (
                      <Truck className="w-4 h-4" />
                    ) : (
                      <Utensils className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 break-words leading-snug">
                      {item.note}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        {item.employeeId === 'fund' ? 'Quỹ chung' : emp?.name}
                      </span>
                      <span>•</span>
                      <span className="text-slate-600">{item.category}</span>
                    </div>

                    {item.reimburse && (
                      <div className="pt-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 font-bold text-[10px] whitespace-nowrap">
                          Hoàn vào lương
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                    {formatVND(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteExpense(item.id)}
                    title="Xóa khoản chi"
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

