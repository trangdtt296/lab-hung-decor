/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind được xử lý qua postcss.config.mjs (chạy cho cả webpack lẫn Turbopack)

  // Trang chủ → tab Chấm công (redirect phía server, chạy cả khi chưa đăng nhập)
  redirects() {
    return [{ source: '/', destination: '/cham-cong', permanent: false }];
  },
};

export default nextConfig;
