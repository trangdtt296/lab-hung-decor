'use client';

import { useEffect, useState } from 'react';
import { getTodayInfo } from '../lib/payroll';

/**
 * { year, month, day } của hôm nay. Trả về null ở lần render đầu (SSR/prerender)
 * để tránh lệch hydration, sau đó cập nhật trên client và tự đổi khi qua nửa đêm.
 */
export function useTodayInfo() {
  const [today, setToday] = useState(null);

  useEffect(() => {
    const update = () =>
      setToday((prev) => {
        const next = getTodayInfo();
        const unchanged = prev && prev.day === next.day && prev.month === next.month && prev.year === next.year;
        return unchanged ? prev : next;
      });
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, []);

  return today;
}
