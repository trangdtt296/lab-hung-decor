import React from 'react';

/**
 * Icon tài liệu PDF: tờ giấy trắng viền đỏ, gấp góc + nhãn "PDF" đỏ chữ trắng to, đọc rõ trên cả
 * nút nền xanh lẫn nền sáng. Nên dùng cỡ w-5 h-5 (20px) trở lên để chữ PDF dễ đọc.
 */
export default function PdfFileIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      {/* Tờ giấy gấp góc */}
      <path
        d="M5 1.5h10l5.5 5.5v14.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2.5a1 1 0 0 1 1-1z"
        fill="#ffffff"
        stroke="#dc2626"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M15 1.5V7h5.5" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Nhãn PDF tràn ngang tờ giấy cho chữ to nhất có thể */}
      <rect x="0.5" y="10" width="23" height="9.5" rx="2" fill="#dc2626" />
      <text
        x="12"
        y="17.8"
        textAnchor="middle"
        fontSize="8.8"
        fontWeight="900"
        fontFamily="'Arial Black', Arial, Helvetica, sans-serif"
        fill="#ffffff"
      >
        PDF
      </text>
    </svg>
  );
}
