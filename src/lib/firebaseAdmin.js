/**
 * src/lib/firebaseAdmin.js
 * Firebase Admin SDK — CHỈ chạy trên server (Route Handler). Admin SDK bỏ qua Firestore Rules,
 * nên server tự quyết định trả về dữ liệu gì (VD: chỉ phiếu lương của đúng 1 nhân viên).
 *
 * Biến môi trường (không có tiền tố NEXT_PUBLIC_ → không bao giờ lộ ra trình duyệt):
 *   FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY
 *   (lấy từ Firebase Console → Project settings → Service accounts → Generate new private key)
 */
import 'server-only';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let db = null;

/** Firestore admin (khởi tạo lười, dùng lại giữa các request). Ném lỗi nếu thiếu cấu hình. */
export const getAdminDb = () => {
  if (db) return db;

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // Khi lưu trong .env / Vercel, xuống dòng của private key thường bị đổi thành chuỗi "\n"
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Thiếu cấu hình Firebase Admin (FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY).');
  }

  const app = getApps()[0] || initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  db = getFirestore(app);
  return db;
};
