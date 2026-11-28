/**
 * Mẫu phiếu lương PDF (A4) cho 1 nhân viên / 1 tháng — vẽ bằng @react-pdf/renderer.
 * Chỉ được import động khi bấm "Xuất phiếu lương" (xem exportPayslipPdf.js) để không làm nặng trang.
 *
 * Bố cục: dải tiêu đề thương hiệu → thông tin nhân viên & kỳ lương → 4 ô chỉ số →
 * bảng chấm công → bảng THU NHẬP / KHẤU TRỪ → tổng kết + THỰC NHẬN (bằng số & bằng chữ).
 */
import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

export const PDF_FONT = 'BeVietnamPro';

const C = {
  ink: '#0f172a',
  text: '#334155',
  muted: '#64748b',
  faint: '#94a3b8',
  line: '#e2e8f0',
  soft: '#f8fafc',
  brand: '#047857',
  brandSoft: '#ecfdf5',
  brandLine: '#a7f3d0',
  dark: '#0f172a',
  darkAccent: '#064e3b',
  minus: '#b91c1c',
  minusSoft: '#fef2f2',
  plusSoft: '#f0fdf4',
  sunday: '#e11d48',
};

const s = StyleSheet.create({
  page: { fontFamily: PDF_FONT, fontSize: 9, color: C.text, paddingBottom: 46, backgroundColor: '#ffffff' },

  /* Dải tiêu đề */
  header: {
    backgroundColor: C.dark,
    paddingHorizontal: 36,
    paddingTop: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 42, height: 42, borderRadius: 12, marginRight: 12 },
  brandName: { color: '#ffffff', fontSize: 17, fontWeight: 800, letterSpacing: 0.3 },
  titleBox: { alignItems: 'flex-end' },
  title: { color: '#ffffff', fontSize: 22, fontWeight: 800, letterSpacing: 2 },
  titleSub: { color: '#cbd5e1', fontSize: 9, marginTop: 3 },
  accentBar: { height: 4, backgroundColor: '#10b981' },

  body: { paddingHorizontal: 36, paddingTop: 12 },

  /* Dòng mã phiếu */
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaLabel: { color: C.faint, fontSize: 8 },
  metaValue: { color: C.ink, fontSize: 8.5, fontWeight: 600, marginLeft: 4 },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 7.5,
    fontWeight: 700,
    marginLeft: 4,
  },

  /* Thông tin nhân viên */
  infoCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    marginBottom: 10,
  },
  infoCol: { flex: 1, paddingVertical: 7, paddingHorizontal: 12 },
  infoColDivider: { borderLeftWidth: 1, borderLeftColor: C.line },
  sectionLabel: { fontSize: 7, fontWeight: 700, color: C.faint, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 5 },
  empName: { fontSize: 14, fontWeight: 800, color: C.ink },
  empRole: { fontSize: 8.5, color: C.muted, marginTop: 2 },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 },
  infoKey: { color: C.muted, fontSize: 8.5 },
  infoVal: { color: C.ink, fontSize: 8.5, fontWeight: 600 },

  /* 4 ô chỉ số */
  kpiRow: { flexDirection: 'row', marginBottom: 12 },
  kpi: {
    flex: 1,
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  kpiLast: { marginRight: 0, backgroundColor: C.brandSoft, borderColor: C.brandLine },
  kpiLabel: { fontSize: 7.5, color: C.muted },
  kpiValue: { fontSize: 12, fontWeight: 800, color: C.ink, marginTop: 3 },
  kpiHint: { fontSize: 7, color: C.faint, marginTop: 1 },

  /* Bảng chi tiết */
  table: { borderWidth: 1, borderColor: C.line, borderRadius: 10, overflow: 'hidden' },
  thead: { flexDirection: 'row', backgroundColor: C.ink, paddingVertical: 6, paddingHorizontal: 10 },
  th: { color: '#ffffff', fontSize: 7.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase' },
  groupRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, paddingHorizontal: 10 },
  groupTitle: { fontSize: 8.5, fontWeight: 800, letterSpacing: 0.4 },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'flex-start',
  },
  colNo: { width: 22, color: C.faint },
  colDesc: { flex: 1, paddingRight: 8 },
  colDate: { width: 52, textAlign: 'center', color: C.muted },
  colAmount: { width: 92, textAlign: 'right', fontWeight: 700, color: C.ink },
  desc: { color: C.ink, fontWeight: 600 },
  descSub: { color: C.muted, fontSize: 7.5, marginTop: 1.5 },
  emptyRow: { paddingVertical: 6, paddingHorizontal: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9', color: C.faint, fontSize: 8 },

  /* Tổng kết */
  summaryWrap: { flexDirection: 'row', marginTop: 8 },
  wordsBox: { flex: 1, marginRight: 14, justifyContent: 'flex-end' },
  totals: { width: 236 },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 4 },
  totalKey: { color: C.muted },
  totalVal: { color: C.ink, fontWeight: 700 },
  netBox: {
    marginTop: 4,
    backgroundColor: C.brand,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netKey: { color: '#d1fae5', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' },
  netVal: { color: '#ffffff', fontSize: 16, fontWeight: 800 },
  words: {
    backgroundColor: C.soft,
    borderLeftWidth: 3,
    borderLeftColor: '#10b981',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  wordsLabel: { fontSize: 7, fontWeight: 700, color: C.faint, letterSpacing: 1, textTransform: 'uppercase' },
  wordsText: { fontSize: 9, color: C.ink, fontWeight: 600, marginTop: 3, lineHeight: 1.4 },
  note: { fontSize: 7.5, color: C.faint, marginTop: 6, lineHeight: 1.4 },

  /* Chấm công */
  attTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 },
  attTitle: { fontSize: 9.5, fontWeight: 800, color: C.ink },
  legend: { flexDirection: 'row', alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  legendDot: { width: 9, height: 9, borderRadius: 1.5, borderWidth: 0.75, marginRight: 3 },
  legendText: { fontSize: 7, color: C.muted },
  attGrid: { borderLeftWidth: 1, borderTopWidth: 1, borderColor: C.line },
  attRow: { flexDirection: 'row' },
  attCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    paddingVertical: 3,
  },
  attDay: { fontSize: 7.5, fontWeight: 700, color: C.ink },
  attWeekday: { fontSize: 6, color: C.faint },
  attMark: { marginTop: 2, width: 12, height: 12, borderRadius: 2, borderWidth: 0.75, alignItems: 'center', justifyContent: 'center' },
  attMarkText: { fontSize: 7, fontWeight: 800 },

  /* Chân trang */
  footer: {
    position: 'absolute',
    left: 36,
    right: 36,
    bottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 7,
  },
  footerText: { fontSize: 7, color: C.faint },
});

const vnd = new Intl.NumberFormat('vi-VN');
const money = (n) => `${vnd.format(Math.round(Number(n) || 0))}đ`;
const signed = (n, sign) => `${sign}${money(Math.abs(n))}`;

const STATUS_STYLE = {
  'Đã chốt': { backgroundColor: '#dcfce7', color: '#166534' },
  'Đang chạy': { backgroundColor: '#fef3c7', color: '#92400e' },
  'Chưa tới': { backgroundColor: '#e2e8f0', color: '#334155' },
};

const ATT_PER_ROW = 16; // 31 ngày → 2 hàng

/** Ngày nghỉ / chưa chấm */
const OFF_MARK = { text: '', backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: C.faint };

const MARKS = {
  1: { text: '+', backgroundColor: '#d1fae5', borderColor: '#34d399', color: '#047857' },
  0.5: { text: '-', backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#b45309' },
};

function Kpi({ label, value, hint, last }) {
  return (
    <View style={[s.kpi, last && s.kpiLast]}>
      <Text style={s.kpiLabel}>{label}</Text>
      <Text style={[s.kpiValue, last && { color: C.brand }]}>{value}</Text>
      {hint ? <Text style={s.kpiHint}>{hint}</Text> : null}
    </View>
  );
}

function LineGroup({ title, total, tone, lines, startNo, emptyText }) {
  const isPlus = tone === 'plus';
  return (
    <View>
      <View style={[s.groupRow, { backgroundColor: isPlus ? C.plusSoft : C.minusSoft }]} wrap={false}>
        <Text style={[s.groupTitle, { color: isPlus ? C.brand : C.minus }]}>{title}</Text>
        <Text style={[s.groupTitle, { color: isPlus ? C.brand : C.minus }]}>{signed(total, isPlus ? '+' : '−')}</Text>
      </View>
      {lines.length === 0 ? (
        <Text style={s.emptyRow}>{emptyText}</Text>
      ) : (
        lines.map((line, i) => (
          <View key={line.key} style={s.row} wrap={false}>
            <Text style={s.colNo}>{startNo + i}</Text>
            <View style={s.colDesc}>
              <Text style={s.desc}>{line.title}</Text>
              {line.sub ? <Text style={s.descSub}>{line.sub}</Text> : null}
            </View>
            <Text style={s.colDate}>{line.date || '—'}</Text>
            <Text style={[s.colAmount, { color: isPlus ? C.ink : C.minus }]}>{signed(line.amount, isPlus ? '+' : '−')}</Text>
          </View>
        ))
      )}
    </View>
  );
}

/**
 * @param data kết quả của buildPayslipData (exportPayslipPdf.js)
 * @param logoSrc URL / data URI logo (bỏ trống thì không vẽ logo)
 */
export default function PayslipDocument({ data, logoSrc }) {
  const {
    employee,
    monthLabel,
    periodLabel,
    slipNo,
    issuedAt,
    status,
    baseSalary,
    dayRate,
    totalDays,
    daysInMonth,
    standardWorkDays,
    earnings,
    deductions,
    totalEarnings,
    totalDeductions,
    rounding,
    netSalary,
    netInWords,
    attendanceDays,
  } = data;

  return (
    <Document title={`Phiếu lương ${employee.name} - ${monthLabel}`} author="Lab Hung Decor" subject="Phiếu lương" creator="Lab Hung Decor">
      <Page size="A4" style={s.page}>
        {/* Dải tiêu đề */}
        <View style={s.header}>
          <View style={s.brandRow}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image của react-pdf, không phải thẻ <img> */}
            {logoSrc ? <Image src={logoSrc} style={s.logo} /> : null}
            <View>
              <Text style={s.brandName}>HÙNG DECOR</Text>
            </View>
          </View>
          <View style={s.titleBox}>
            <Text style={s.title}>PHIẾU LƯƠNG</Text>
            <Text style={s.titleSub}>Kỳ lương {monthLabel}</Text>
          </View>
        </View>
        <View style={s.accentBar} />

        <View style={s.body}>
          {/* Mã phiếu, ngày lập, trạng thái */}
          <View style={s.metaRow}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Số phiếu:</Text>
              <Text style={s.metaValue}>{slipNo}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Ngày lập:</Text>
              <Text style={s.metaValue}>{issuedAt}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Trạng thái:</Text>
              <Text style={[s.statusPill, STATUS_STYLE[status] || STATUS_STYLE['Chưa tới']]}>{status}</Text>
            </View>
          </View>

          {/* Thông tin nhân viên & kỳ lương */}
          <View style={s.infoCard}>
            <View style={s.infoCol}>
              <Text style={s.sectionLabel}>Nhân viên</Text>
              <Text style={s.empName}>{employee.name}</Text>
              {employee.roleLabel ? <Text style={s.empRole}>{employee.roleLabel}</Text> : null}
            </View>
            <View style={[s.infoCol, s.infoColDivider]}>
              <Text style={s.sectionLabel}>Kỳ lương</Text>
              <View style={s.infoLine}>
                <Text style={s.infoKey}>Thời gian</Text>
                <Text style={s.infoVal}>{periodLabel}</Text>
              </View>
              <View style={s.infoLine}>
                <Text style={s.infoKey}>Công chuẩn</Text>
                <Text style={s.infoVal}>{standardWorkDays} ngày</Text>
              </View>
              <View style={s.infoLine}>
                <Text style={s.infoKey}>Lương cơ bản</Text>
                <Text style={s.infoVal}>{money(baseSalary)}</Text>
              </View>
            </View>
          </View>

          {/* Chỉ số chính */}
          <View style={s.kpiRow}>
            <Kpi label="Ngày công" value={`${totalDays} công`} hint={`Tháng có ${daysInMonth} ngày`} />
            <Kpi label="Đơn giá 1 công" value={money(dayRate)} hint={`Lương CB ÷ ${standardWorkDays}`} />
            <Kpi label="Tổng khấu trừ" value={money(totalDeductions)} hint="Chi tiết ở mục B" />
            <Kpi label="Thực nhận" value={money(netSalary)} hint="Đã làm tròn đến nghìn" last />
          </View>

          {/* Bảng chấm công */}
          <View wrap={false} style={{ marginBottom: 12 }}>
            <View style={s.attTitleRow}>
              <Text style={s.attTitle}>Bảng chấm công {monthLabel}</Text>
              <View style={s.legend}>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: MARKS[1].backgroundColor, borderColor: MARKS[1].borderColor }]} />
                  <Text style={s.legendText}>+ 1 công</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: MARKS[0.5].backgroundColor, borderColor: MARKS[0.5].borderColor }]} />
                  <Text style={s.legendText}>- nửa công</Text>
                </View>
                <View style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: OFF_MARK.backgroundColor, borderColor: OFF_MARK.borderColor }]} />
                  <Text style={s.legendText}>Nghỉ</Text>
                </View>
              </View>
            </View>
            <View style={s.attGrid}>
              {[attendanceDays.slice(0, ATT_PER_ROW), attendanceDays.slice(ATT_PER_ROW)].map((rowDays, rowIndex) => (
                <View key={rowIndex} style={s.attRow}>
                  {Array.from({ length: ATT_PER_ROW }, (_, i) => {
                    const d = rowDays[i];
                    // Ô trống cuối hàng 2 để các cột thẳng hàng với hàng 1
                    if (!d) return <View key={`empty-${i}`} style={[s.attCell, { backgroundColor: C.soft }]} />;
                    const mark = MARKS[d.value] || OFF_MARK;
                    return (
                      <View key={d.day} style={[s.attCell, d.isSunday && { backgroundColor: '#fff1f2' }]}>
                        <Text style={[s.attDay, d.isSunday && { color: C.sunday }]}>{d.day}</Text>
                        <Text style={[s.attWeekday, d.isSunday && { color: C.sunday }]}>{d.weekday}</Text>
                        <View style={[s.attMark, { backgroundColor: mark.backgroundColor, borderColor: mark.borderColor }]}>
                          <Text style={[s.attMarkText, { color: mark.color }]}>{mark.text}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Bảng chi tiết */}
          <View style={s.table}>
            <View style={s.thead}>
              <Text style={[s.colNo, s.th]}>#</Text>
              <Text style={[s.colDesc, s.th]}>Nội dung</Text>
              <Text style={[s.colDate, s.th]}>Ngày</Text>
              <Text style={[s.colAmount, s.th]}>Số tiền</Text>
            </View>
            <LineGroup
              title="A. THU NHẬP"
              total={totalEarnings}
              tone="plus"
              lines={earnings}
              startNo={1}
              emptyText="Không có khoản thu nhập."
            />
            <LineGroup
              title="B. KHẤU TRỪ"
              total={totalDeductions}
              tone="minus"
              lines={deductions}
              startNo={earnings.length + 1}
              emptyText="Không có khoản khấu trừ trong tháng."
            />
          </View>

          {/* Tổng kết */}
          <View style={s.summaryWrap} wrap={false}>
            <View style={s.wordsBox}>
              <View style={s.words}>
                <Text style={s.wordsLabel}>Số tiền bằng chữ</Text>
                <Text style={s.wordsText}>{netInWords}.</Text>
              </View>
              <Text style={s.note}>
                Thực nhận = Lương theo ngày công − Khấu trừ (làm tròn đến nghìn đồng) + Hoàn chi đã chi hộ xưởng.
              </Text>
            </View>
            <View style={s.totals}>
              <View style={s.totalLine}>
                <Text style={s.totalKey}>Tổng thu nhập (A)</Text>
                <Text style={s.totalVal}>{money(totalEarnings)}</Text>
              </View>
              <View style={s.totalLine}>
                <Text style={s.totalKey}>Tổng khấu trừ (B)</Text>
                <Text style={[s.totalVal, { color: C.minus }]}>{signed(totalDeductions, '−')}</Text>
              </View>
              {rounding !== 0 ? (
                <View style={s.totalLine}>
                  <Text style={s.totalKey}>Làm tròn</Text>
                  <Text style={s.totalVal}>{signed(rounding, rounding > 0 ? '+' : '−')}</Text>
                </View>
              ) : null}
              <View style={s.netBox}>
                <Text style={s.netKey}>Thực nhận</Text>
                <Text style={s.netVal}>{money(netSalary)}</Text>
              </View>
            </View>
          </View>

        </View>

        {/* Chân trang */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Phiếu lương tạo tự động từ hệ thống Lab Hung Decor · Thắc mắc vui lòng báo lại quản lý.</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Trang ${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
