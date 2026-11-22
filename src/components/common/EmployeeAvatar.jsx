'use client';

import React, { useState } from 'react';

/**
 * Hàm hash tên nhân viên thành chỉ số 0..7 để luôn gắn cố định
 * một mẫu chibi avatar độc đáo cho từng người.
 */
function getAvatarIndex(name = '') {
  const str = String(name || '').trim().toLowerCase();
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 8;
}

/**
 * 8 mẫu Chibi Avatar được thiết kế vector SVG sắc nét, tươi sáng,
 * mang phong cách anime chibi dễ thương với má hồng, mắt lấp lánh và biểu cảm sinh động.
 */
function ChibiSvg({ index, name }) {
  switch (index) {
    case 0:
      // Mẫu 0: Tóc ngắn mái ngố bob cut, kẹp nơ hoa vàng, má hồng, miệng cười mèo (Hồng Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#fce7f3" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#f472b6" />
          <path d="M 36 54 L 40 59 L 44 54 Z" fill="#ffffff" />
          {/* Tóc sau */}
          <path d="M 18 36 C 18 52 23 54 26 54 C 28 54 27 45 27 36 Z" fill="#451a03" />
          <path d="M 62 36 C 62 52 57 54 54 54 C 52 54 53 45 53 36 Z" fill="#451a03" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.65" />
          <ellipse cx="51" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.65" />
          {/* Tóc trước & Mái */}
          <path d="M 19 36 C 19 22 30 18 40 18 C 50 18 61 22 61 36 C 61 36 55 31 48 31 C 42 31 40 33 38 33 C 35 33 30 30 19 36 Z" fill="#451a03" />
          {/* Kẹp tóc ngôi sao */}
          <polygon points="25,23 26.5,26 30,26 27,28 28.5,31 25,29 21.5,31 23,28 20,26 23.5,26" fill="#facc15" />
          {/* Mắt to tròn lấp lánh */}
          <ellipse cx="32" cy="37" rx="3.2" ry="4.2" fill="#1e1b4b" />
          <circle cx="31" cy="35.5" r="1.3" fill="#ffffff" />
          <circle cx="33.5" cy="38.5" r="0.7" fill="#ffffff" />
          <ellipse cx="48" cy="37" rx="3.2" ry="4.2" fill="#1e1b4b" />
          <circle cx="47" cy="35.5" r="1.3" fill="#ffffff" />
          <circle cx="49.5" cy="38.5" r="0.7" fill="#ffffff" />
          {/* Miệng cười mèo :3 */}
          <path d="M 37 46 Q 39 48 40 46 Q 41 48 43 46" stroke="#9f1239" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 1:
      // Mẫu 1: Tóc gai nhọn cá tính, nháy mắt tinh nghịch, áo hoodie ngọc bích (Xanh Ngọc Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#dcfce7" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#10b981" />
          <path d="M 35 55 L 40 60 L 45 55 Z" fill="#047857" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="43" rx="3.8" ry="2" fill="#fb7185" opacity="0.6" />
          <ellipse cx="51" cy="43" rx="3.8" ry="2" fill="#fb7185" opacity="0.6" />
          {/* Tóc tỉa spiky */}
          <path d="M 18 36 C 17 25 23 18 30 18 L 34 13 L 38 18 L 44 13 L 47 18 L 53 14 L 56 20 C 62 25 62 36 61 38 C 58 31 52 30 48 33 C 43 28 36 29 31 33 C 27 30 22 32 18 36 Z" fill="#1e293b" />
          {/* Mắt: Trái nháy mắt ^ , Phải tròn long lanh */}
          <path d="M 29 38 Q 32 34 35 38" stroke="#0f172a" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="48" cy="37" rx="3.2" ry="4.2" fill="#0f172a" />
          <circle cx="47" cy="35.5" r="1.3" fill="#ffffff" />
          <circle cx="49.5" cy="38.5" r="0.7" fill="#ffffff" />
          {/* Miệng cười hớn hở */}
          <path d="M 37 44 Q 40 51 43 44 Z" fill="#e11d48" />
        </svg>
      );

    case 2:
      // Mẫu 2: Tóc gợn sóng hạt dẻ, đeo kính tròn tri thức cực xinh, áo xanh dương (Xanh Da Trời Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#e0f2fe" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#0284c7" />
          <path d="M 36 55 L 40 60 L 44 55 Z" fill="#bae6fd" />
          {/* Tóc sau uốn lượn */}
          <path d="M 18 36 C 17 22 28 17 40 17 C 52 17 63 22 62 36 C 62 48 59 52 57 52 C 55 52 55 45 55 36 C 50 31 45 32 40 32 C 34 32 29 30 25 36 C 25 45 25 52 23 52 C 21 52 18 48 18 36 Z" fill="#78350f" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="44" rx="3.5" ry="2" fill="#fb7185" opacity="0.65" />
          <ellipse cx="51" cy="44" rx="3.5" ry="2" fill="#fb7185" opacity="0.65" />
          {/* Tóc mái trước */}
          <path d="M 20 35 C 25 28 35 28 40 31 C 45 28 55 28 60 35 C 57 30 52 29 48 31 C 43 27 36 28 31 31 C 26 29 23 31 20 35 Z" fill="#78350f" />
          {/* Mắt cười sau kính */}
          <path d="M 29 37 Q 32 34 35 37" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 45 37 Q 48 34 51 37" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />
          {/* Gọng kính tròn thời thượng */}
          <circle cx="32" cy="37" r="6" stroke="#0369a1" strokeWidth="1.8" fill="rgba(255,255,255,0.4)" />
          <circle cx="48" cy="37" r="6" stroke="#0369a1" strokeWidth="1.8" fill="rgba(255,255,255,0.4)" />
          <line x1="38" y1="37" x2="42" y2="37" stroke="#0369a1" strokeWidth="1.8" />
          {/* Miệng mỉm cười duyên dáng */}
          <path d="M 38 46 Q 40 49 42 46" stroke="#0369a1" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 3:
      // Mẫu 3: Búi tóc củ tỏi 2 bên (Space Buns) thắt nơ đỏ, mắt to tròn tím biếc (Tím Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#f3e8ff" />
          {/* Hai búi tóc củ tỏi */}
          <circle cx="21" cy="20" r="7.5" fill="#312e81" />
          <circle cx="59" cy="20" r="7.5" fill="#312e81" />
          <circle cx="23" cy="24" r="3" fill="#f43f5e" />
          <circle cx="57" cy="24" r="3" fill="#f43f5e" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#9333ea" />
          <path d="M 36 55 L 40 60 L 44 55 Z" fill="#e9d5ff" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.7" />
          <ellipse cx="51" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.7" />
          {/* Tóc mái trước */}
          <path d="M 19 35 C 19 22 28 18 40 18 C 52 18 61 22 61 35 C 57 30 52 30 48 33 C 43 30 37 30 32 33 C 27 30 23 31 19 35 Z" fill="#312e81" />
          {/* Mắt to anime tím */}
          <ellipse cx="32" cy="37" rx="3.3" ry="4.3" fill="#312e81" />
          <circle cx="31" cy="35" r="1.4" fill="#ffffff" />
          <circle cx="33.5" cy="38.5" r="0.7" fill="#ffffff" />
          <ellipse cx="48" cy="37" rx="3.3" ry="4.3" fill="#312e81" />
          <circle cx="47" cy="35" r="1.4" fill="#ffffff" />
          <circle cx="49.5" cy="38.5" r="0.7" fill="#ffffff" />
          {/* Miệng chúm chím */}
          <ellipse cx="40" cy="46" rx="2" ry="2.5" fill="#f43f5e" />
        </svg>
      );

    case 4:
      // Mẫu 4: Đội mũ lưỡi trai ngược năng động, nụ cười rạng rỡ khoe răng (Vàng Hổ Phách Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#fef3c7" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#d97706" />
          <path d="M 36 55 L 40 60 L 44 55 Z" fill="#fde68a" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Mũ lưỡi trai ngược */}
          <ellipse cx="40" cy="27" rx="20" ry="12" fill="#ea580c" />
          <path d="M 24 29 Q 40 23 56 29 L 54 33 Q 40 27 26 33 Z" fill="#c2410c" />
          <circle cx="40" cy="15" r="2.5" fill="#c2410c" />
          {/* Lọn tóc hai bên tai */}
          <path d="M 21 35 C 20 41 23 44 25 44" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          <path d="M 59 35 C 60 41 57 44 55 44" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
          {/* Má hồng */}
          <ellipse cx="29" cy="44" rx="3.8" ry="2" fill="#fb7185" opacity="0.65" />
          <ellipse cx="51" cy="44" rx="3.8" ry="2" fill="#fb7185" opacity="0.65" />
          {/* Mắt cười tít ^ ^ */}
          <path d="M 29 37 Q 32 33 35 37" stroke="#1f2937" strokeWidth="2.3" strokeLinecap="round" />
          <path d="M 45 37 Q 48 33 51 37" stroke="#1f2937" strokeWidth="2.3" strokeLinecap="round" />
          {/* Miệng cười tươi khoe răng trắng */}
          <path d="M 36 43 Q 40 50 44 43 Z" fill="#b91c1c" />
          <path d="M 37.5 43 Q 40 46 42.5 43 Z" fill="#ffffff" />
        </svg>
      );

    case 5:
      // Mẫu 5: Tóc xoăn ngắn sành điệu, kẹp tóc ngôi sao, mắt lấp lánh (Xanh Mòng Két Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#ccfbf1" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#0d9488" />
          <path d="M 36 55 L 40 60 L 44 55 Z" fill="#99f6e4" />
          {/* Tóc sau */}
          <path d="M 18 36 C 17 21 28 17 40 17 C 52 17 63 21 62 36 C 63 48 59 52 57 52 C 55 45 54 36 50 32 C 45 29 35 29 30 32 C 26 36 25 45 23 52 C 21 52 17 48 18 36 Z" fill="#374151" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="43" rx="3.8" ry="2" fill="#fb7185" opacity="0.65" />
          <ellipse cx="51" cy="43" rx="3.8" ry="2" fill="#fb7185" opacity="0.65" />
          {/* Kẹp ngôi sao xanh */}
          <polygon points="56,26 57.2,28.5 60,28.5 57.8,30.2 58.7,32.7 56,31 53.3,32.7 54.2,30.2 52,28.5 54.8,28.5" fill="#facc15" />
          {/* Mắt to tròn */}
          <ellipse cx="32" cy="37" rx="3.2" ry="4.2" fill="#0f172a" />
          <circle cx="31" cy="35.5" r="1.3" fill="#ffffff" />
          <ellipse cx="48" cy="37" rx="3.2" ry="4.2" fill="#0f172a" />
          <circle cx="47" cy="35.5" r="1.3" fill="#ffffff" />
          {/* Miệng mỉm cười nhẹ */}
          <path d="M 37 45 Q 40 48 43 45" stroke="#0d9488" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    case 6:
      // Mẫu 6: Áo hoodie trùm đầu tai gấu siêu cấp đáng yêu (Cam Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#ffedd5" />
          {/* Tai gấu trên mũ */}
          <circle cx="23" cy="21" r="7" fill="#ea580c" />
          <circle cx="23" cy="21" r="3.5" fill="#fed7aa" />
          <circle cx="57" cy="21" r="7" fill="#ea580c" />
          <circle cx="57" cy="21" r="3.5" fill="#fed7aa" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#ea580c" />
          {/* Mũ trùm đầu bao quanh mặt */}
          <path d="M 19 38 C 19 23 28 19 40 19 C 52 19 61 23 61 38 C 61 53 52 57 40 57 C 28 57 19 53 19 38 Z" fill="#ea580c" />
          {/* Khuôn mặt lọt thỏm trong mũ */}
          <ellipse cx="40" cy="40" rx="16" ry="14" fill="#fde2d2" />
          {/* Chỏm tóc nhỏ ló ra */}
          <path d="M 38 29 Q 40 26 42 29" stroke="#78350f" strokeWidth="2.2" strokeLinecap="round" />
          {/* Má hồng chúm chím */}
          <ellipse cx="30" cy="44" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
          <ellipse cx="50" cy="44" rx="3.5" ry="2" fill="#fb7185" opacity="0.7" />
          {/* Mắt tròn ngây thơ */}
          <circle cx="33" cy="39" r="2.8" fill="#1e293b" />
          <circle cx="32" cy="38" r="1.1" fill="#ffffff" />
          <circle cx="47" cy="39" r="2.8" fill="#1e293b" />
          <circle cx="46" cy="38" r="1.1" fill="#ffffff" />
          {/* Miệng mèo ngơ ngác :3 */}
          <path d="M 37 45 Q 39 47 40 45 Q 41 47 43 45" stroke="#9a3412" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );

    case 7:
    default:
      // Mẫu 7: Tóc đuôi ngựa lệch buộc nơ ngọc lam, mắt nháy lông mi cong vút (Hồng Đào Pastel)
      return (
        <svg viewBox="0 0 80 80" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="80" height="80" rx="20" fill="#ffe4e6" />
          {/* Đuôi ngựa vểnh bên phải */}
          <ellipse cx="58" cy="23" rx="7" ry="10" transform="rotate(30 58 23)" fill="#292524" />
          <circle cx="53" cy="26" r="3.8" fill="#14b8a6" />
          {/* Thân áo */}
          <path d="M 22 75 C 22 61 32 57 40 57 C 48 57 58 61 58 75 Z" fill="#e11d48" />
          <path d="M 36 55 L 40 60 L 44 55 Z" fill="#fecdd3" />
          {/* Đầu & Tai */}
          <circle cx="21" cy="39" r="4" fill="#fde2d2" />
          <circle cx="59" cy="39" r="4" fill="#fde2d2" />
          <circle cx="40" cy="38" r="19" fill="#fde2d2" />
          {/* Má hồng */}
          <ellipse cx="29" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.65" />
          <ellipse cx="51" cy="43" rx="4" ry="2.2" fill="#fb7185" opacity="0.65" />
          {/* Tóc mái chéo điệu đà */}
          <path d="M 19 35 C 19 22 28 17 40 17 C 52 17 61 22 61 35 C 57 29 48 29 42 32 C 36 29 28 30 20 35 Z" fill="#292524" />
          {/* Mắt cười có lông mi xinh xắn */}
          <path d="M 28 37 Q 32 33 36 37" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="36" y1="36" x2="38.5" y2="34" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M 44 37 Q 48 33 52 37" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="52" y1="36" x2="54.5" y2="34" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
          {/* Miệng cười hớn hở */}
          <path d="M 37 44 Q 40 50 43 44 Z" fill="#e11d48" />
        </svg>
      );
  }
}

export default function EmployeeAvatar({
  name = '',
  size = 'md',
  className = '',
  showBorder = true,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg text-[10px]',
    sm: 'w-8 h-8 rounded-xl text-xs',
    md: 'w-10 h-10 rounded-2xl text-sm',
    lg: 'w-12 h-12 rounded-2xl text-base',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const avatarIndex = getAvatarIndex(name);

  // URL ảnh chibi từ DiceBear Adventurer API
  const dicebearUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
    name || 'nv'
  )}&radius=30`;

  return (
    <div
      className={`relative shrink-0 overflow-hidden select-none flex items-center justify-center shadow-xs transition-transform duration-150 ${
        showBorder ? 'border border-slate-200/80 ring-1 ring-black/5' : ''
      } ${currentSizeClass} ${className}`}
      title={name || 'Nhân viên'}
    >
      {/* 1. Mẫu Chibi SVG tích hợp sẵn (Hiển thị tức thì 0ms, sắc nét, hoạt động 100% offline) */}
      <div
        className={`w-full h-full flex items-center justify-center transition-opacity duration-200 ${
          imgLoaded && !imgError ? 'opacity-0 absolute inset-0' : 'opacity-100'
        }`}
      >
        <ChibiSvg index={avatarIndex} name={name} />
      </div>

      {/* 2. Ảnh Chibi từ DiceBear (nếu có kết nối mạng sẽ tải và hiển thị mượt mà) */}
      {!imgError && (
        <img
          src={dicebearUrl}
          alt={name || 'Avatar'}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            imgLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        />
      )}
    </div>
  );
}
