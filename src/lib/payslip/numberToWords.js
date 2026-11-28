/**
 * Đọc số tiền thành chữ tiếng Việt (dòng "Bằng chữ" trên phiếu lương / hoá đơn).
 * VD: 4365000 → "Bốn triệu ba trăm sáu mươi lăm nghìn đồng"
 */
const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ'];

/** Đọc 1 nhóm 3 chữ số. `full` = không phải nhóm đầu tiên nên phải đọc đủ "không trăm", "linh" */
const readTriple = (n, full) => {
  const hundreds = Math.floor(n / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;
  const words = [];

  if (full || hundreds > 0) words.push(DIGITS[hundreds], 'trăm');

  if (tens === 0) {
    if (ones > 0) {
      if (full || hundreds > 0) words.push('linh');
      words.push(DIGITS[ones]);
    }
  } else if (tens === 1) {
    words.push('mười');
    if (ones === 5) words.push('lăm');
    else if (ones > 0) words.push(DIGITS[ones]);
  } else {
    words.push(DIGITS[tens], 'mươi');
    if (ones === 1) words.push('mốt');
    else if (ones === 4) words.push('tư');
    else if (ones === 5) words.push('lăm');
    else if (ones > 0) words.push(DIGITS[ones]);
  }
  return words.join(' ');
};

/** Đọc số nguyên không âm, tối đa 999 tỷ (thừa đủ cho phiếu lương) */
const readInteger = (n) => {
  if (n === 0) return DIGITS[0];
  if (n >= 1e12) return new Intl.NumberFormat('vi-VN').format(n);
  const groups = [];
  let rest = n;
  while (rest > 0) {
    groups.push(rest % 1000);
    rest = Math.floor(rest / 1000);
  }

  const parts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const value = groups[i];
    if (value === 0) continue;
    const isLeading = i === groups.length - 1;
    const unit = UNITS[i];
    parts.push(`${readTriple(value, !isLeading)}${unit ? ` ${unit}` : ''}`);
  }
  return parts.join(' ');
};

export const amountToVietnameseWords = (amount) => {
  const n = Math.round(Number(amount) || 0);
  const text = `${n < 0 ? 'âm ' : ''}${readInteger(Math.abs(n))} đồng`;
  return text.charAt(0).toUpperCase() + text.slice(1);
};
