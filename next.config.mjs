/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  // Tailwind được xử lý qua postcss.config.mjs (chạy cho cả webpack lẫn Turbopack)
};

export default nextConfig;
