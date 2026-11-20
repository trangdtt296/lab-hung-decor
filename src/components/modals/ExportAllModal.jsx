'use client';

import React from 'react';
import { X, FileSpreadsheet, Download } from 'lucide-react';

export default function ExportAllModal({
  isOpen,
  onClose,
  selectedMonthDisplayLabel,
  isExporting,
  onExportWorkshop,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Xuất Excel Bảng Lương Tổng
              </h3>
              <p className="text-[11px] text-slate-500">
                Định dạng chuẩn Lab Hung Decor (.xlsx) • Công chuẩn 30 ngày
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExportWorkshop('single')}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left flex items-center justify-between gap-3 transition-all disabled:opacity-60 cursor-pointer"
          >
            <div>
              <div className="text-sm font-extrabold text-slate-900">
                Xuất riêng {selectedMonthDisplayLabel}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                1 sheet gồm chấm công, tính lương từng người, bảng chi tiêu & đổ xăng
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-600 shrink-0" />
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExportWorkshop('all')}
            className="w-full p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-left flex items-center justify-between gap-3 transition-all disabled:opacity-60 cursor-pointer"
          >
            <div>
              <div className="text-sm font-extrabold text-emerald-950">
                Xuất toàn bộ các tháng (Tháng 8 → Tháng 11/2026)
              </div>
              <div className="text-xs text-emerald-800/80 mt-0.5">
                Gồm 4 tab sheet theo từng tháng từ Tháng 8 đến Tháng 11/2026
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-700 shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

