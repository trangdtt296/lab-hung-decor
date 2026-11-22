'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { formatVND } from '../../lib/payroll';
import ConfirmButton from '../common/ConfirmButton';

const TYPE_BADGE = {
  advance: { label: 'Ứng lương', className: 'bg-amber-100 text-amber-800' },
  photo_fee: { label: 'Tiền ảnh', className: 'bg-rose-100 text-rose-800' },
  other_deduction: { label: 'Khoản trừ khác', className: 'bg-slate-200 text-slate-800' },
};

export default function AdvancesTab({ advances, employees, selectedMonth, totalAdvances, onOpenAddAdvance, onDeleteAdvance }) {
  const monthAdvances = advances.filter((a) => a.month === selectedMonth);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Ứng lương & tiền ảnh</h2>
          <p className="text-xs text-slate-500 tabular-nums">
            Tổng ứng tháng này: <strong className="text-amber-700 whitespace-nowrap">{formatVND(totalAdvances)}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenAddAdvance}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          Thêm khoản ứng
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {monthAdvances.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            Chưa có khoản ứng lương hay tiền ảnh nào trong tháng này.
          </div>
        ) : (
          monthAdvances.map((item) => {
            const badge = TYPE_BADGE[item.type] || TYPE_BADGE.advance;
            const empName = employees.find((e) => e.id === item.employeeId)?.name || 'Nhân viên đã nghỉ';
            return (
              <div key={item.id} className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{empName}</span>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap ${badge.className}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{item.date}</span>
                  </div>
                  {item.note && <div className="text-xs text-slate-600 break-words leading-relaxed">{item.note}</div>}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                    -{formatVND(item.amount)}
                  </span>
                  <ConfirmButton
                    onConfirm={() => onDeleteAdvance(item.id)}
                    aria-label="Xoá khoản mục"
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
