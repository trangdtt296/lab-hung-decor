/**
 * GET /api/payslip/{slug}
 * Phiếu lương cho trang nhân viên (/e/{slug}) — không cần đăng nhập, nhưng CHỈ trả về dữ liệu
 * của đúng nhân viên sở hữu link: thông tin cơ bản, chấm công, ứng/tiền ảnh của người đó và
 * các khoản chi người đó đã chi hộ (được hoàn vào lương). Không lộ lương/dữ liệu người khác.
 */
import { getAdminDb } from '../../../../lib/firebaseAdmin';

const SLUG_PATTERN = /^[a-z0-9-]{4,64}$/;
const NO_STORE = { 'Cache-Control': 'private, no-store' };

const json = (body, status = 200) => Response.json(body, { status, headers: NO_STORE });

/** Chỉ giữ các trường cần cho tính lương / hiển thị (bỏ timestamp, id người khác…) */
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

export async function GET(request, { params }) {
  const { token = '' } = await params;
  const slug = token.toLowerCase();
  if (!SLUG_PATTERN.test(slug)) return json({ error: 'not_found' }, 404);

  let db;
  try {
    db = getAdminDb();
  } catch (err) {
    console.error(err);
    return json({ error: 'server_not_configured' }, 500);
  }

  try {
    const empSnap = await db.collection('employees').where('slug', '==', slug).limit(1).get();
    const empDoc = empSnap.docs[0];
    if (!empDoc || empDoc.get('active') === false) return json({ error: 'not_found' }, 404);
    const empId = empDoc.id;

    const [attendanceSnap, advancesSnap, expensesSnap] = await Promise.all([
      db.collection('attendance').where('employeeId', '==', empId).get(),
      db.collection('advances').where('employeeId', '==', empId).get(),
      db.collection('expenses').where('payerId', '==', empId).where('reimburse', '==', true).get(),
    ]);

    const attendance = {};
    attendanceSnap.docs.forEach((d) => {
      const data = d.data();
      const monthKey = data.monthKey || `${data.year}-${String(data.month).padStart(2, '0')}`;
      attendance[monthKey] = { [empId]: data.days || {} };
    });

    return json({
      employee: { id: empId, ...pick(empDoc.data(), ['name', 'roleLabel', 'baseSalary', 'salaryByMonth', 'slug']) },
      attendance,
      advances: advancesSnap.docs.map((d) => ({
        id: d.id,
        ...pick(d.data(), ['month', 'employeeId', 'date', 'type', 'amount', 'note']),
      })),
      expenses: expensesSnap.docs.map((d) => ({
        id: d.id,
        ...pick(d.data(), ['month', 'date', 'category', 'note', 'amount', 'reimburse', 'payerId']),
      })),
    });
  } catch (err) {
    console.error(err);
    return json({ error: 'server_error' }, 500);
  }
}
