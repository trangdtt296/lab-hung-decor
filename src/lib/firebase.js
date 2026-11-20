import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Đọc cấu hình Firebase từ biến môi trường NEXT_PUBLIC_
 * Hỗ trợ fallback an toàn khi chưa cấu hình để vẫn chạy được mock data
 */
const readEnvConfig = () => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
    const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

    if (apiKey && projectId) {
      return {
        apiKey,
        authDomain,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const FIREBASE_CONFIG = readEnvConfig();

let authInstance = null;
let dbInstance = null;

if (FIREBASE_CONFIG) {
  try {
    const fbApp = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();
    authInstance = getAuth(fbApp);
    dbInstance = getFirestore(fbApp);
  } catch (error) {
    console.warn('Firebase initialization warning:', error);
    authInstance = null;
    dbInstance = null;
  }
}

export const firebaseAuth = authInstance;
export const firebaseDb = dbInstance;
export const isFirebaseConfigured = Boolean(authInstance && dbInstance);

