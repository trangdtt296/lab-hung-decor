'use client';

import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';
import Modal from '../common/Modal';
import FormField, { PasswordInput } from '../common/FormField';

const EMPTY = { current: '', next: '', confirm: '' };

/** Popup đổi mật khẩu Firebase Auth của admin đang đăng nhập (mở từ menu tài khoản) */
export default function ChangePasswordModal({ email, onClose, onChangePassword, onSuccess }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onChangePassword(form.current, form.next, form.confirm);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Không thể đổi mật khẩu.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      title="Đổi mật khẩu"
      subtitle={email}
      icon={<KeyRound className="w-5 h-5" />}
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
            type="submit"
            form="change-password-form"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      }
    >
      <form id="change-password-form" onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div role="alert" className="p-3 rounded-xl text-xs font-semibold border bg-rose-50 border-rose-200 text-rose-800">
            {error}
          </div>
        )}
        <FormField label="Mật khẩu hiện tại">
          <PasswordInput
            autoComplete="current-password"
            placeholder="Nhập mật khẩu hiện tại"
            value={form.current}
            onChange={set('current')}
            required
            autoFocus
          />
        </FormField>
        <FormField label="Mật khẩu mới">
          <PasswordInput
            autoComplete="new-password"
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            value={form.next}
            onChange={set('next')}
            required
            minLength={6}
          />
        </FormField>
        <FormField label="Xác nhận mật khẩu mới">
          <PasswordInput
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
            value={form.confirm}
            onChange={set('confirm')}
            required
          />
        </FormField>
      </form>
    </Modal>
  );
}
