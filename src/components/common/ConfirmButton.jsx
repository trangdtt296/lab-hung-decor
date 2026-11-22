'use client';

import React, { useEffect, useState } from 'react';

const CONFIRM_TIMEOUT_MS = 3000;

/**
 * Nút cho thao tác khó hoàn tác (xoá, đổi link): chạm lần 1 chuyển sang trạng thái xác nhận,
 * chạm lần 2 trong 3 giây mới thực hiện. Tránh bấm nhầm trên điện thoại mà không cần popup.
 */
export default function ConfirmButton({
  onConfirm,
  children,
  confirmChildren = 'Chắc chắn?',
  className = '',
  confirmClassName = 'bg-rose-600 text-white hover:bg-rose-700',
  ...props
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), CONFIRM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = () => {
    if (armed) {
      setArmed(false);
      onConfirm();
    } else {
      setArmed(true);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onBlur={() => setArmed(false)}
      className={`${className} ${armed ? confirmClassName : ''} transition-colors cursor-pointer`}
      {...props}
    >
      {armed ? confirmChildren : children}
    </button>
  );
}
