import { PayrollDataProvider } from '../../components/admin/PayrollDataContext';
import AdminShell from '../../components/admin/AdminShell';

/**
 * Bỏ kiểm tra "instant navigation" của Next cho các trang admin: đăng nhập Firebase chỉ biết được
 * trên trình duyệt nên lúc prerender AdminShell chưa vẽ trang con (Next báo "dropped from rendering").
 * Chuyển tab vẫn tức thì vì dữ liệu nằm sẵn ở layout này.
 * Xem node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md
 */
export const instant = false;

/** Layout chung cho các trang admin — giữ kết nối dữ liệu khi chuyển giữa các tab */
export default function AdminLayout({ children }) {
  return (
    <PayrollDataProvider>
      <AdminShell>{children}</AdminShell>
    </PayrollDataProvider>
  );
}
