import { CalendarCheck, LayoutDashboard, CircleDollarSign, HandCoins, ShoppingBag } from 'lucide-react';

/** Mỗi tab admin là 1 trang riêng → F5 vẫn ở đúng tab, có thể gửi/bookmark link */
export const ADMIN_TABS = [
  // Tổng quan xem theo cả năm nên không hiện thẻ số liệu của tháng
  { href: '/tong-quan', label: 'Tổng quan', icon: LayoutDashboard, hideMonthKpis: true },
  { href: '/cham-cong', label: 'Chấm công', icon: CalendarCheck },
  { href: '/ung-luong', label: 'Ứng', icon: HandCoins },
  { href: '/chi-tieu', label: 'Chi', icon: ShoppingBag },
  { href: '/bang-luong', label: 'Lương', icon: CircleDollarSign },
];

