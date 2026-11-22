import { CalendarCheck, HandCoins, ShoppingBag, Wallet } from 'lucide-react';

/** Mỗi tab admin là 1 trang riêng → F5 vẫn ở đúng tab, có thể gửi/bookmark link */
export const ADMIN_TABS = [
  { href: '/cham-cong', label: 'Chấm công', icon: CalendarCheck },
  { href: '/ung-luong', label: 'Ứng', icon: HandCoins },
  { href: '/chi-tieu', label: 'Chi', icon: ShoppingBag },
  { href: '/bang-luong', label: 'Lương', icon: Wallet },
];

