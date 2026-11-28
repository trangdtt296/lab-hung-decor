'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { AlertTriangle, Download, ExternalLink, FileSpreadsheet, FileText, Share2, X } from 'lucide-react';
import Modal from './Modal';
import {
  getInAppName,
  isAndroid,
  isInAppBrowser,
  isIOS,
  openInChrome,
  subscribeOfferedFile,
  triggerBlobDownload,
} from '../../lib/inAppBrowser';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const DISMISS_KEY = 'inAppBannerDismissed';

const noopSubscribe = () => () => {};
/** Chỉ nhận diện ở client (server luôn trả false) để không lệch hydrate */
const useIsInAppBrowser = () => useSyncExternalStore(noopSubscribe, isInAppBrowser, () => false);

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
};

/** Hướng dẫn mở bằng trình duyệt thật — dùng chung cho thanh cảnh báo và hộp lưu file */
function OpenExternallyAction({ compact = false }) {
  if (isAndroid()) {
    return (
      <button
        type="button"
        onClick={openInChrome}
        className={`inline-flex items-center justify-center gap-1.5 rounded-xl font-bold cursor-pointer bg-slate-900 text-white hover:bg-slate-800 ${
          compact ? 'px-3 py-1.5 text-xs' : 'w-full px-4 py-3 text-sm'
        }`}
      >
        <ExternalLink className="w-4 h-4" /> Mở bằng Chrome
      </button>
    );
  }
  return (
    <span className={compact ? 'text-xs' : 'text-sm text-slate-600'}>
      Bấm <b>⋯</b> (góc trên) → <b>{isIOS() ? 'Mở bằng Safari' : 'Mở bằng trình duyệt'}</b>
    </span>
  );
}

/**
 * Hỗ trợ khi trang được mở trong trình duyệt nhúng của Zalo/Facebook/Messenger...:
 * 1. Thanh cảnh báo ở đầu trang + nút mở bằng Chrome (Android) / hướng dẫn mở Safari (iPhone)
 * 2. Hộp "Lưu / Chia sẻ file" khi xuất Excel / phiếu lương PDF — người dùng bấm nút để mở bảng chia sẻ của máy
 */
export default function InAppBrowserHelper() {
  const inApp = useIsInAppBrowser();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [offered, setOffered] = useState(null); // { blob, fileName }
  const [shareFailed, setShareFailed] = useState(false);

  useEffect(
    () =>
      subscribeOfferedFile((f) => {
        setShareFailed(false);
        setOffered(f);
      }),
    []
  );

  const dismissBanner = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* bỏ qua: không lưu được thì lần sau hiện lại */
    }
  };

  const isPdf = /\.pdf$/i.test(offered?.fileName || '');
  const file = offered ? new File([offered.blob], offered.fileName, { type: offered.blob.type || XLSX_MIME }) : null;
  const canShare = !!file && typeof navigator !== 'undefined' && !!navigator.canShare?.({ files: [file] });

  const handleShare = async () => {
    try {
      await navigator.share({ files: [file], title: offered.fileName });
      setOffered(null);
    } catch (err) {
      if (err?.name !== 'AbortError') setShareFailed(true); // AbortError = người dùng tự đóng bảng chia sẻ
    }
  };

  return (
    <>
      {inApp && !dismissed && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))]">
          <div className="max-w-7xl mx-auto flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
            <div className="flex-1 min-w-0 text-xs leading-relaxed">
              <p>
                Đang mở trong <b>{getInAppName()}</b> — có thể không tải được file Excel / PDF.
              </p>
              <div className="mt-1.5">
                <OpenExternallyAction compact />
              </div>
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              aria-label="Ẩn thông báo"
              className="p-1 rounded-full hover:bg-amber-100 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!offered}
        onClose={() => setOffered(null)}
        title={isPdf ? 'Phiếu lương PDF đã sẵn sàng' : 'File Excel đã sẵn sàng'}
        subtitle={offered?.fileName}
        icon={isPdf ? <FileText className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
      >
        <div className="space-y-3">
          {canShare && (
            <>
              <button
                type="button"
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 cursor-pointer"
              >
                <Share2 className="w-4 h-4" /> Lưu / Chia sẻ file
              </button>
              <p className="text-xs text-slate-500 text-center">
                Chọn <b>{isIOS() ? 'Lưu vào Tệp' : 'Lưu'}</b> để lưu về máy, hoặc gửi thẳng qua Zalo / mở bằng {isPdf ? 'ứng dụng xem PDF' : 'Excel'}.
              </p>
            </>
          )}

          {(!canShare || shareFailed) && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 space-y-2.5">
              <p className="text-sm text-amber-900">
                {shareFailed
                  ? 'Không mở được bảng chia sẻ.'
                  : `Trình duyệt trong ${getInAppName()} không hỗ trợ lưu file.`}{' '}
                Hãy mở trang bằng trình duyệt rồi xuất lại:
              </p>
              <OpenExternallyAction />
            </div>
          )}

          <button
            type="button"
            onClick={() => triggerBlobDownload(offered.blob, offered.fileName)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Thử tải trực tiếp
          </button>
        </div>
      </Modal>
    </>
  );
}
