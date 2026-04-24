import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// 마케팅 스케줄러와 같은 Firebase 프로젝트 (store-manager-f5a05) 사용
// 환경변수로 관리 (Vercel에서 설정)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ── 로그인/로그아웃 ──
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google sign-in error:', err);
    throw err;
  }
}

export async function logout() {
  return signOut(auth);
}

export function onAuthChange(cb) {
  return onAuthStateChanged(auth, cb);
}

// ── Firestore: 사용자 체크리스트 저장/불러오기 ──
// 경로: baemin/{uid}
// 마케팅 스케줄러(users/{uid})와 분리하기 위해 baemin 루트 컬렉션 사용

export async function loadUserData(uid) {
  try {
    const ref = doc(db, 'baemin', uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('loadUserData error:', err);
    return null;
  }
}

export async function saveChecklist(uid, checklist, userInfo = {}) {
  try {
    const ref = doc(db, 'baemin', uid);
    await setDoc(ref, {
      checklist,
      email: userInfo.email || '',
      displayName: userInfo.displayName || '',
      photoURL: userInfo.photoURL || '',
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('saveChecklist error:', err);
    return false;
  }
}
