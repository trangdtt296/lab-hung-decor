'use client';

/**
 * Nhập dữ liệu cũ từ file Excel "Bảng lương Lab Hung Decor" (Google Sheets → File → Download → .xlsx).
 * Ẩn/hiện bằng cờ Firestore settings/app.legacyImportEnabled (true = hiện) — không cần sửa code.
 */
import React, { useRef, useState } from 'react';
import { CheckCircle2, FileUp, Loader2, TriangleAlert, XCircle } from 'lucide-react';
import { FIRST_MONTH_KEY, formatMonthLabel, formatVND } from '../../lib/payroll';
import ConfirmButton from '../common/ConfirmButton';

const formatValue = (label, v) => (label.includes('tổng công') ? `${v} công` : formatVND(v));

export default function LegacyImportPanel({ isDatabaseEmpty, onImport }) {
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | reading | ready | importing | done | error
  const [message, setMessage] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const loaded = useRef(null); // { workbook, parseLegacyWorkbook }

  const parseMonths = (months) => {
    setSelectedMonths(months);
    if (!loaded.current) return;
    const sorted = [...months].sort();
    setResult(sorted.length ? loaded.current.parseLegacyWorkbook(loaded.current.workbook, sorted) : null);
  };
  const toggleMonth = (monthKey) =>
    parseMonths(selectedMonths.includes(monthKey) ? selectedMonths.filter((m) => m !== monthKey) : [...selectedMonths, monthKey]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setFileName(file.name);
    setStatus('reading');
    setResult(null);
    try {
      const [{ default: ExcelJS }, { parseLegacyWorkbook, detectMonthKeys }] = await Promise.all([
        import('exceljs'),
        import('../../lib/legacyImport'),
      ]);
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());
      loaded.current = { workbook, parseLegacyWorkbook };
      const months = detectMonthKeys(workbook);
      if (!months.length) throw new Error('Không thấy sheet "Tháng N" nào');
      setAvailableMonths(months);
      // Mặc định chọn các tháng từ khi hệ thống bắt đầu có dữ liệu
      parseMonths(months.filter((m) => m >= FIRST_MONTH_KEY));
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Không đọc được file. Hãy tải lại từ Google Sheets dạng .xlsx.');
    }
  };

  const handleImport = async () => {
    setStatus('importing');
    try {
      const count = await onImport(result);
      setStatus('done');
      setMessage(`Đã nhập ${count} bản ghi. Mở tab Lương để lấy link mới gửi nhân viên.`);
    } catch (err) {
      console.error(err);
      setStatus('ready');
      setMessage('Ghi lên Firebase thất bại. Kiểm tra kết nối / quyền admin rồi thử lại.');
    }
  };

  const failedChecks = result?.checks.filter((c) => !c.ok) || [];
  const errors = result?.issues.filter((i) => i.level === 'error') || [];
  const warnings = result?.issues.filter((i) => i.level === 'warning') || [];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-dashed border-amber-300 shadow-xs space-y-3.5">
      <div>
        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Nhập dữ liệu cũ từ Excel</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          File &quot;Bảng lương Lab Hung Decor&quot; (Google Sheets → File → Download → .xlsx), mỗi sheet &quot;Tháng N&quot; một tháng.
          App tự đối chiếu với số trên file trước khi cho nhập. Ẩn khung này: đặt <code>settings/app.legacyImportEnabled</code> = false.
        </p>
      </div>

      {!isDatabaseEmpty && status !== 'done' && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex gap-2">
          <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" />
          Firebase đang có dữ liệu. Hãy xoá 4 collection employees, attendance, advances, expenses trước khi nhập để tránh trùng.
        </div>
      )}

      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer">
        {status === 'reading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp className="w-4 h-4" />}
        {fileName ? 'Chọn file khác' : 'Chọn file .xlsx'}
        <input type="file" accept=".xlsx" className="hidden" onChange={handleFile} />
      </label>
      {fileName && <span className="ml-2 text-xs text-slate-500 break-all">{fileName}</span>}

      {message && (
        <p className={`text-xs font-semibold ${status === 'done' ? 'text-emerald-700' : 'text-rose-700'}`}>{message}</p>
      )}

      {availableMonths.length > 0 && status !== 'done' && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="text-xs font-bold text-slate-700 mb-1.5">Tháng cần nhập</legend>
          {availableMonths.map((m) => (
            <label key={m} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer">
              <input type="checkbox" checked={selectedMonths.includes(m)} onChange={() => toggleMonth(m)} className="accent-emerald-600" />
              {formatMonthLabel(m)}
            </label>
          ))}
        </fieldset>
      )}

      {result && status !== 'done' && (
        <div className="space-y-3">
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {result.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {result.ok
              ? `Khớp ${result.checks.length}/${result.checks.length} số liệu với file`
              : `${failedChecks.length + errors.length} chỗ chưa khớp — sửa trên Google Sheets rồi tải lại`}
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">
              {result.employees.length} nhân viên · {result.advances.length} khoản ứng/trừ · {result.expenses.length} khoản chi
            </div>
            {result.employees.map((e) => (
              <div key={e.id}>
                {e.order}. <strong>{e.name}</strong>
                {!e.active && <span className="text-amber-700"> (đã nghỉ)</span>} — lương:{' '}
                {Object.entries(e.salaryByMonth)
                  .map(([m, v]) => `T${Number(m.slice(5))} ${formatVND(v)}`)
                  .join(', ')}
              </div>
            ))}
          </div>

          {[...errors, ...failedChecks.map((c) => ({ msg: `${formatMonthLabel(c.monthKey)} – ${c.label}: app tính ${formatValue(c.label, c.actual)}, file ghi ${formatValue(c.label, c.expected)}` }))].map((x, i) => (
            <div key={`e${i}`} className="text-xs text-rose-700 flex gap-1.5">
              <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {x.msg}
            </div>
          ))}
          {warnings.map((w, i) => (
            <div key={`w${i}`} className="text-xs text-amber-700 flex gap-1.5">
              <TriangleAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w.msg}
            </div>
          ))}

          <details className="text-xs">
            <summary className="cursor-pointer font-bold text-slate-700">Xem chi tiết đối chiếu từng tháng</summary>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left">
                <tbody>
                  {result.checks.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1 pr-2 whitespace-nowrap text-slate-500">T{Number(c.monthKey.slice(5))}</td>
                      <td className="py-1 pr-2">{c.label}</td>
                      <td className="py-1 pr-2 text-right tabular-nums whitespace-nowrap">{formatValue(c.label, c.expected)}</td>
                      <td className="py-1">{c.ok ? '✅' : '❌'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <ConfirmButton
            onConfirm={handleImport}
            disabled={!result.ok || !isDatabaseEmpty || status === 'importing'}
            confirmChildren="Chạm lần nữa để ghi lên Firebase"
            confirmClassName="bg-amber-500 text-white hover:bg-amber-600"
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'importing' ? 'Đang ghi…' : 'Nhập lên Firebase'}
          </ConfirmButton>
        </div>
      )}
    </div>
  );
}
