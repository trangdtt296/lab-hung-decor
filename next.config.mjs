/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind được xử lý qua postcss.config.mjs (chạy cho cả webpack lẫn Turbopack)

  // Chỉ kiểm tra "instant navigation" ở trang nào tự khai báo `export const instant`.
  // Mặc định Next kiểm tra mọi trang và báo "dropped from rendering" cho các trang admin, vì
  // đăng nhập Firebase chỉ biết được trên trình duyệt nên lúc prerender AdminShell chưa vẽ trang con.
  // Các trang là client component nên không tự khai báo `instant = false` được.
  // Xem node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md
  experimental: {
    instantInsights: {
      validationLevel: 'manual-warning',
    },
  },

  // Trang chủ → tab Chấm công (redirect phía server, chạy cả khi chưa đăng nhập)
  redirects() {
    return [{ source: '/', destination: '/cham-cong', permanent: false }];
  },
};

export default nextConfig;
