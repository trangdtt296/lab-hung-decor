'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { DEMO_ADMIN_EMAIL } from '../../lib/payroll';

export default function AdminLoginScreen({
  activeDemoPassword,
  onLogin,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFillDemo = () => {
    setEmail(DEMO_ADMIN_EMAIL);
    setPassword(activeDemoPassword);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setErrorMsg(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-5 sm:p-7 space-y-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
            LH
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cổng quản trị Admin</span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              Đăng nhập Lab Hung Decor
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Xác thực tài khoản Admin để chấm công, nhập ứng/chi và xuất bảng lương.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-login-email"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Email Admin
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-login-email"
                type="email"
                autoComplete="email"
                placeholder={DEMO_ADMIN_EMAIL}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-login-password"
                className="block text-xs font-bold text-slate-700"
              >
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Điền nhanh tài khoản demo</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 absolute right-2 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Thông tin tài khoản demo:</div>
            <div className="break-all">
              Email: <span className="font-bold text-slate-900">{DEMO_ADMIN_EMAIL}</span>
            </div>
            <div>
              Mật khẩu: <span className="font-bold text-slate-900">{activeDemoPassword}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-md transition-all disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập Admin'}
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-400">
          Nhân viên xem bảng chấm công & lương cá nhân qua link riêng do Admin gửi.
        </div>
      </div>
    </div>
  );
}

