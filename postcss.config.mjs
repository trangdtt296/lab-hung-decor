// Tailwind CSS v4 qua PostCSS — dùng được cho cả `next build --webpack` (Vercel) và Turbopack (dev)
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
