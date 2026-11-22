import "./globals.css";
import InAppBrowserHelper from "../components/common/InAppBrowserHelper";

export const metadata = {
  title: "Lab Hung Decor - Quản lý nhân sự & Bảng lương",
  description: "Hệ thống quản lý chấm công, ứng lương, chi tiêu và tính lương công chuẩn 30 ngày Lab Hung Decor",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // cho phép dùng env(safe-area-inset-*) trên iPhone có tai thỏ
  themeColor: "#0f172a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full flex flex-col">
        <InAppBrowserHelper />
        {children}
      </body>
    </html>
  );
}
