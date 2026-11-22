'use client';

import React, { useState } from 'react';
import { Building2, Cloud, KeyRound, LogOut, ShieldCheck, User } from 'lucide-react';

export default function SettingsTab({
  adminEmail,
  employeesCount,
  cloudSyncStatus,
  onChangePassword,
  onLogout,
}) {
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwFeedback, setPwFeedback] = useState(null);
  const [isSavingPw, setIsSavingPw] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwFeedback(null);
    setIsSavingPw(true);
    try {
      await onChangePassword(
        pwForm.currentPassword,
        pwForm.newPassword,
        pwForm.confirmPassword
      );
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwFeedback({
        type: 'success',
        text: 'Đã cập nhật mật khẩu thành công!',
      });
    } catch (err) {
      setPwFeedback({
        type: 'error',
        text: err.message || 'Không thể đổi mật khẩu.',
      });
    } finally {
      setIsSavingPw(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. THẺ THÔNG TIN TÀI KHOẢN ADMIN (KHÔNG HIỂN THỊ LƯƠNG CÔNG CHUẨN) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
              AD
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Tài khoản Admin
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 break-all">{adminEmail}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 font-semibold text-[11px]">Vai trò tài khoản</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">Admin quản trị</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-slate-400 font-semibold text-[11px]">Xưởng quản lý</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5 break-words">
                Lab Hung Decor
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LƯỚI 2 CỘT CÂN ĐỐI TRÊN DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 2. THÔNG TIN XƯỞNG & LƯU TRỮ */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Thông tin xưởng sản xuất
              </h3>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-slate-50">
                <span className="font-medium text-slate-600">Tên xưởng</span>
                <span className="font-extrabold text-slate-900 text-sm">Lab Hung Decor</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-slate-50">
                <span className="font-medium text-slate-600">Nhân sự quản lý</span>
                <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                  {employeesCount} nhân viên
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 py-2.5 px-3 rounded-xl bg-slate-50">
                <span className="font-medium text-slate-600">Chế độ vận hành</span>
                <span className="font-bold text-emerald-700">Online & Đồng bộ đám mây</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 text-slate-600">
              <Cloud className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Trạng thái lưu trữ:</span>
              <strong className="text-slate-900">{cloudSyncStatus}</strong>
            </div>
          </div>
        </div>

        {/* 3. ĐỔI MẬT KHẨU & ĐĂNG XUẤT */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                Đổi mật khẩu tài khoản Admin
              </h3>
            </div>

            {pwFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold border ${
                  pwFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {pwFeedback.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm({ ...pwForm, currentPassword: e.target.value })
                  }
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, newPassword: e.target.value })
                    }
                    placeholder="Nhập mật khẩu mới"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) =>
                      setPwForm({ ...pwForm, confirmPassword: e.target.value })
                    }
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSavingPw}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSavingPw ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Kết thúc phiên làm việc
              </h3>
              <p className="text-xs text-slate-500">
                Khóa màn hình quản trị và quay lại trang đăng nhập Admin.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

