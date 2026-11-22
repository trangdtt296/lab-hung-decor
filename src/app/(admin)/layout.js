import { PayrollDataProvider } from '../../components/admin/PayrollDataContext';
import AdminShell from '../../components/admin/AdminShell';

/** Layout chung cho các trang admin — giữ kết nối dữ liệu khi chuyển giữa các tab */
export default function AdminLayout({ children }) {
  return (
    <PayrollDataProvider>
      <AdminShell>{children}</AdminShell>
    </PayrollDataProvider>
  );
}
