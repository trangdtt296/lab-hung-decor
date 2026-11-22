import React, { useId } from 'react';

/**
 * Avatar admin (SVG): nền gradient xanh ngọc, hình người cách điệu, huy hiệu khiên vàng
 * ở góc thể hiện quyền quản trị. Sắc nét ở mọi kích thước, không phụ thuộc ảnh ngoài.
 */
export default function AdminAvatar({ size = 28, className = '' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Admin"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#10b981" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id={`badge-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <clipPath id={`clip-${id}`}>
          <rect width="40" height="40" rx="11" />
        </clipPath>
      </defs>

      <g clipPath={`url(#clip-${id})`}>
        <rect width="40" height="40" fill={`url(#bg-${id})`} />
        {/* Ánh sáng chéo nhẹ */}
        <path d="M0 0 H40 V14 Q20 22 0 12 Z" fill="#ffffff" opacity="0.08" />
        {/* Vai & áo */}
        <path d="M6 42 C6 31 12.5 26.5 20 26.5 C27.5 26.5 34 31 34 42 Z" fill="#ecfdf5" />
        {/* Cổ áo chữ V */}
        <path d="M16.5 27.2 L20 31.5 L23.5 27.2 Z" fill="#0f766e" opacity="0.55" />
        {/* Đầu */}
        <circle cx="20" cy="17" r="7" fill="#ecfdf5" />
        {/* Tóc */}
        <path d="M13 16.5 C13 11.5 16.2 9.5 20 9.5 C23.8 9.5 27 11.5 27 16.5 C25 13.8 22.5 13.2 20 13.2 C17.5 13.2 15 13.8 13 16.5 Z" fill="#134e4a" />
      </g>

      {/* Huy hiệu khiên admin */}
      <g transform="translate(25 24)">
        <path d="M7.5 0.8 L13.4 3 V7.6 C13.4 11.3 10.9 13.9 7.5 15.2 C4.1 13.9 1.6 11.3 1.6 7.6 V3 Z" fill={`url(#badge-${id})`} stroke="#ffffff" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M4.9 7.9 L6.8 9.8 L10.2 6.2" fill="none" stroke="#78350f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
