/**
 * Hỗ trợ trình duyệt nhúng trong app (Zalo, Facebook, Messenger, Instagram, Line, Android WebView...).
 * Các trình duyệt này thường không tải được file blob, nên:
 * - Hiện thanh cảnh báo + nút mở bằng Chrome/Safari (InAppBrowserHelper)
 * - File xuất ra được "giữ lại" để người dùng bấm nút chia sẻ bằng một cú chạm mới
 *   (Web Share API bắt buộc phải gọi ngay sau thao tác chạm của người dùng)
 */

const getUA = () => (typeof navigator === 'undefined' ? '' : navigator.userAgent || '');

export const isInAppBrowser = () => /Zalo|FBAN|FBAV|FB_IAB|FBIOS|Messenger|Instagram|Line\/|; wv\)/i.test(getUA());

export const isAndroid = () => /Android/i.test(getUA());

export const isIOS = () => /iPhone|iPad|iPod/i.test(getUA());

/** Tên app đang nhúng trang (để hiện thông báo dễ hiểu) */
export const getInAppName = () => {
  const ua = getUA();
  if (/Zalo/i.test(ua)) return 'Zalo';
  if (/Messenger/i.test(ua)) return 'Messenger';
  if (/Instagram/i.test(ua)) return 'Instagram';
  if (/FBAN|FBAV|FB_IAB|FBIOS/i.test(ua)) return 'Facebook';
  if (/Line\//i.test(ua)) return 'Line';
  return 'ứng dụng';
};

/** Mở trang hiện tại bằng Chrome (chỉ Android) qua intent URL */
export const openInChrome = () => {
  const { host, pathname, search, hash } = window.location;
  window.location.href = `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`;
};

/** Tải file theo kiểu thông thường (thẻ <a download>) */
export const triggerBlobDownload = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* ----------------------- File đang chờ người dùng lưu ----------------------- */

const listeners = new Set();

/** Đưa file cho InAppBrowserHelper hiện hộp "Lưu / Chia sẻ file" */
export const offerFile = (blob, fileName) => {
  listeners.forEach((fn) => fn({ blob, fileName }));
};

export const subscribeOfferedFile = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
