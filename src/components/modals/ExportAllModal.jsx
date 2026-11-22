'use client';

import React from 'react';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatMonthLabel } from '../../lib/payroll';

export default function ExportAllModal({ onClose, selectedMonthDisplayLabel, exportMonthKeys, isExporting, onExportWorkshop }) {
  const first = exportMonthKeys[0];
  const last = exportMonthKeys[exportMonthKeys.length - 1];
  const rangeLabel = first === last ? formatMonthLabel(last) : `${formatMonthLabel(first)} → ${formatMonthLabel(last)}`;

  const optionClass =
    'w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition disabled:opacity-60 cursor-pointer';
  const Icon = isExporting ? Loader2 : Download;

  return (
    <Modal
      onClose={onClose}
      title="Xuất Excel bảng lương tổng"
      subtitle="Chỉ admin • Định dạng màu theo mẫu Lab Hung Decor"
      icon={<FileSpreadsheet className="w-5 h-5" />}
    >
      <div className="space-y-2.5">
        <button
          type="button"
          disabled={isExporting}
          onClick={() => onExportWorkshop('single')}
          className={`${optionClass} border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50`}
        >
          <div>
            <div className="text-sm font-extrabold text-slate-900">Chỉ {selectedMonthDisplayLabel}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              Bảng chấm công, chi tiết lương từng người, bảng chi tiêu & đổ xăng
            </div>
          </div>
          <Icon className={`w-4 h-4 text-emerald-600 shrink-0 ${isExporting ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          disabled={isExporting}
          onClick={() => onExportWorkshop('all')}
          className={`${optionClass} border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70`}
        >
          <div>
            <div className="text-sm font-extrabold text-emerald-950">Tất cả các tháng ({rangeLabel})</div>
            <div className="text-xs text-emerald-800/80 mt-0.5">
              {exportMonthKeys.length} sheet, mỗi tháng 1 sheet
            </div>
          </div>
          <Icon className={`w-4 h-4 text-emerald-700 shrink-0 ${isExporting ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </Modal>
  );
}
