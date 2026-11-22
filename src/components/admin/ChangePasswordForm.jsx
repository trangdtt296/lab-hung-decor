'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import FormField, { inputClass, primaryButtonClass } from '../common/FormField';

const EMPTY = { current: '', next: '', confirm: '' };

/** Đổi mật khẩu Firebase Auth của admin đang đăng nhập */
export default function ChangePasswordForm({ email, onChangePassword }) {
  const [form, setForm] = useState(EMPTY);
  const [show, setShow] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);
    try {
      await onChangePassword(form.current, form.next, form.confirm);
      setForm(EMPTY);
      setFeedback({ type: 'success', text: 'Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Không thể đổi mật khẩu.' });
    } finally {
      setIsSaving(false);
    }
  };

  const type = show ? 'text' : 'password';

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-slate-900">Đổi mật khẩu</h2>
          <p className="text-xs text-slate-500 truncate">{email}</p>
        </div>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          className={`p-3 rounded-xl text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <FormField label="Mật khẩu hiện tại">
          <input type={type} autoComplete="current-password" value={form.current} onChange={set('current')} className={inputClass} required />
        </FormField>
        <FormField label="Mật khẩu mới" hint="Tối thiểu 6 ký tự">
          <input type={type} autoComplete="new-password" value={form.next} onChange={set('next')} className={inputClass} required minLength={6} />
        </FormField>
        <FormField label="Nhập lại mật khẩu mới">
          <input type={type} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={inputClass} required />
        </FormField>
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} className="accent-emerald-600" />
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          Hiện mật khẩu
        </label>
        <button type="submit" disabled={isSaving} className={primaryButtonClass}>
          {isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>
    </div>
  );
}
