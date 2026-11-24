'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { formatMonthLabel } from '../../lib/payroll';

/**
 * Hộp chọn phạm vi xuất Excel: chỉ tháng đang chọn ('single') hoặc tất cả các tháng có dữ liệu trong năm ('all').
 * Dùng cho bảng lương tổng (admin) và phiếu lương cá nhân (trang nhân viên) — chỉ khác tiêu đề & mô tả.
 */
export default function ExportAllModal({
  onClose,
  selectedMonthDisplayLabel,
  exportMonthKeys,
  isExporting,
  onExport,
  title = 'Xuất Excel bảng lương tổng',
  subtitle = 'Chỉ admin • Định dạng màu theo mẫu Lab Hung Decor',
  singleDescription = 'Bảng chấm công, chi tiết lương từng người, bảng chi tiêu & đổ xăng',
  allDescription = (count) => `${count} sheet, mỗi tháng 1 sheet`,
}) {
  const first = exportMonthKeys[0];
  const last = exportMonthKeys[exportMonthKeys.length - 1];
  const rangeLabel = first === last ? formatMonthLabel(last) : `${formatMonthLabel(first)} → ${formatMonthLabel(last)}`;

  // Lựa chọn vừa bấm — chỉ lựa chọn này hiện vòng xoay, lựa chọn còn lại chỉ bị khoá
  const [pendingMode, setPendingMode] = useState(null);
  const handleExport = async (mode) => {
    setPendingMode(mode);
    try {
      await onExport(mode);
    } finally {
      setPendingMode(null);
    }
  };
  const iconFor = (mode, colorClass) => {
    const spinning = isExporting && pendingMode === mode;
    const Icon = spinning ? Loader2 : Download;
    return <Icon className={`w-4 h-4 shrink-0 ${colorClass} ${spinning ? 'animate-spin' : ''}`} />;
  };

  const optionClass =
    'w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition disabled:opacity-60 cursor-pointer';

  return (
    <Modal onClose={onClose} title={title} subtitle={subtitle} icon={<FileSpreadsheet className="w-5 h-5" />}>
      <div className="space-y-2.5">
        <button
          type="button"
          disabled={isExporting}
          onClick={() => handleExport('single')}
          className={`${optionClass} border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50`}
        >
          <div>
            <div className="text-sm font-extrabold text-slate-900">Chỉ {selectedMonthDisplayLabel}</div>
            <div className="text-xs text-slate-500 mt-0.5">{singleDescription}</div>
          </div>
          {iconFor('single', 'text-emerald-600')}
        </button>

        <button
          type="button"
          disabled={isExporting}
          onClick={() => handleExport('all')}
          className={`${optionClass} border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70`}
        >
          <div>
            <div className="text-sm font-extrabold text-emerald-950">Tất cả các tháng ({rangeLabel})</div>
            <div className="text-xs text-emerald-800/80 mt-0.5">{allDescription(exportMonthKeys.length)}</div>
          </div>
          {iconFor('all', 'text-emerald-700')}
        </button>
      </div>
    </Modal>
  );
}
