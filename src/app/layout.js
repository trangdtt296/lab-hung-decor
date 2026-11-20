import "./globals.css";

export const metadata = {
  title: "Lab Hung Decor - Quản lý nhân sự & Bảng lương",
  description: "Hệ thống quản lý chấm công, ứng lương, chi tiêu và tính lương công chuẩn 30 ngày Lab Hung Decor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-100 font-sans">{children}</body>
    </html>
  );
}
