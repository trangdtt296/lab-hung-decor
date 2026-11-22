'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 3200;

/** Thông báo ngắn tự ẩn: showToast(message, 'success' | 'error') */
export function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(timer.current);
    setToast({ message, type, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { toast, showToast };
}
