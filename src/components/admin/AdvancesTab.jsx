'use client';

import React from 'react';
import { HandCoins, Trash2 } from 'lucide-react';
import { formatVND } from '../../lib/payroll';

export default function AdvancesTab({
  advances,
  employees,
  selectedMonth,
  totalAdvances,
  onOpenAddAdvance,
  onDeleteAdvance,
}) {
  const currentMonthAdvances = advances.filter((a) => a.month === selectedMonth);

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
            Ứng lương & Tiền ảnh
          </h2>
          <p className="text-xs text-slate-500 tabular-nums">
            Tổng ứng tháng này:{' '}
            <strong className="text-amber-700 whitespace-nowrap">
              {formatVND(totalAdvances)}
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAddAdvance}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
        >
          <HandCoins className="w-4 h-4 shrink-0" />
          <span>Thêm khoản</span>
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {currentMonthAdvances.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Chưa có khoản ứng lương hay tiền ảnh nào trong tháng này.
          </div>
        ) : (
          currentMonthAdvances.map((item) => {
            const emp = employees.find((e) => e.id === item.employeeId);
            return (
              <div
                key={item.id}
                className="w-full min-w-0 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${
                        item.type === 'advance'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.type === 'advance' ? 'Ứng lương' : 'Tiền ảnh'}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-slate-900 break-words">
                    {emp?.name}{' '}
                    <span className="text-xs font-normal text-slate-500">
                      • {item.date}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 break-words leading-relaxed">
                    {item.note}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-center">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                    -{formatVND(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteAdvance(item.id)}
                    title="Xóa khoản mục"
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

