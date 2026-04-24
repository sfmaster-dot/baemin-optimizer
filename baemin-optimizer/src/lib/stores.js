// 다점포 Firestore 헬퍼
// 경로 구조:
//   baemin/{uid}                      ← 사용자 프로필 (activeStoreId 포함)
//   baemin/{uid}/stores/{storeId}     ← 매장별 데이터 (체크리스트, 샵인샵, AI캐시)

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// ── 프로필 (activeStoreId 관리) ──

export async function loadProfile(uid) {
  try {
    const ref = doc(db, 'baemin', uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('loadProfile error:', err);
    return null;
  }
}

export async function setActiveStoreId(uid, storeId) {
  try {
    const ref = doc(db, 'baemin', uid);
    await setDoc(ref, {
      activeStoreId: storeId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('setActiveStoreId error:', err);
    return false;
  }
}

// ── 매장 목록 조회 ──

export async function listStores(uid) {
  try {
    const ref = collection(db, 'baemin', uid, 'stores');
    const q = query(ref, orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('listStores error:', err);
    return [];
  }
}

// ── 매장 개별 조회 ──

export async function loadStore(uid, storeId) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) {
    console.error('loadStore error:', err);
    return null;
  }
}

// ── 매장 생성 ──
// input: { name, mainCategoryId, businessId?, shopInShops? }

export async function createStore(uid, input) {
  try {
    const ref = collection(db, 'baemin', uid, 'stores');
    const docRef = await addDoc(ref, {
      name: input.name?.trim() || '이름 없는 매장',
      mainCategoryId: input.mainCategoryId || '',
      businessId: input.businessId?.trim() || '',
      shopInShops: Array.isArray(input.shopInShops) ? input.shopInShops : [],
      checklist: {},
      aiCache: {},
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error('createStore error:', err);
    return null;
  }
}

// ── 매장 업데이트 (부분 merge) ──

export async function updateStore(uid, storeId, patch) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    await updateDoc(ref, {
      ...patch,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('updateStore error:', err);
    return false;
  }
}

// ── 체크리스트만 저장 (디바운스용) ──

export async function saveStoreChecklist(uid, storeId, checklist) {
  return updateStore(uid, storeId, { checklist });
}

// ── 샵인샵 관리 ──

export async function saveShopInShops(uid, storeId, shopInShops) {
  return updateStore(uid, storeId, { shopInShops });
}

// ── AI 캐시 저장 ──

export async function saveAiCache(uid, storeId, cacheKey, content) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data().aiCache || {}) : {};
    await updateDoc(ref, {
      aiCache: { ...prev, [cacheKey]: content },
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('saveAiCache error:', err);
    return false;
  }
}

// ── 매장 삭제 ──

export async function deleteStore(uid, storeId) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    await deleteDoc(ref);
    return true;
  } catch (err) {
    console.error('deleteStore error:', err);
    return false;
  }
}
