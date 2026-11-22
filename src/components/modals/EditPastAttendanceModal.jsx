'use client';

import React, { useState } from 'react';
import { Calendar, Check, Clock, Ban, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import EmployeeAvatar from '../common/EmployeeAvatar';

const STATUS_OPTIONS = [
  {
    value: 1,
    title: '1 công',
    hint: 'Đủ ngày (+)',
    Icon: Check,
    active: 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/30',
    iconActive: 'bg-emerald-600 text-white',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    value: 0.5,
    title: '0.5 công',
    hint: 'Nửa ngày (-)',
    Icon: Clock,
    active: 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/30',
    iconActive: 'bg-amber-500 text-white',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    value: 0,
    title: 'Nghỉ',
    hint: '0 công (•)',
    Icon: Ban,
    active: 'bg-rose-50 border-rose-500 text-rose-950 ring-2 ring-rose-500/30',
    iconActive: 'bg-rose-500 text-white',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
];

const optionOf = (value) => STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[2];

export default function EditPastAttendanceModal({ isOpen, onClose, target, onConfirm }) {
  if (!isOpen || !target) return null;
  // key: mỗi lần mở cho 1 ô khác thì state lựa chọn được khởi tạo lại
  return <EditPastAttendanceContent key={`${target.employee.id}-${target.dateStr}`} target={target} onClose={onClose} onConfirm={onConfirm} />;
}

function EditPastAttendanceContent({ target, onClose, onConfirm }) {
  const { employee, day, currentValue = 0, dateStr, weekday } = target;
  const [selected, setSelected] = useState(currentValue);
  const current = optionOf(currentValue);

  const handleSave = () => {
    onConfirm(employee.id, day, selected);
    onClose();
  };

  return (
    <Modal
      onClose={onClose}
      title="Sửa công ngày đã qua"
      subtitle="Xác nhận để tránh bấm nhầm dữ liệu cũ"
      icon={<Calendar className="w-5 h-5" />}
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold cursor-pointer"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={selected === currentValue}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            Cập nhật
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <EmployeeAvatar name={employee.name} size="sm" />
              <span className="text-sm font-extrabold text-slate-900 truncate">{employee.name}</span>
            </div>
            <div className="text-right text-xs font-bold text-slate-900 whitespace-nowrap">
              {weekday ? `${weekday}, ` : ''}
              {dateStr}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Hiện tại:</span>
            <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-extrabold ${current.badge}`}>
              {current.title}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">Tổng công và bảng lương sẽ được tính lại ngay sau khi cập nhật.</p>
        </div>

        <div role="radiogroup" aria-label="Trạng thái công mới" className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, title, hint, Icon, active, iconActive }) => {
            const isActive = selected === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setSelected(value)}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  isActive ? active : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? iconActive : 'bg-slate-100 text-slate-500'}`}>
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </span>
                <span className="text-xs font-extrabold">{title}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{hint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
