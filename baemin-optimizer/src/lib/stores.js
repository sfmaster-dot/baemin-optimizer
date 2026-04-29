// 다점포 Firestore 헬퍼
// 경로 구조:
//   baemin/{uid}                      ← 사용자 프로필 (activeStoreId 포함)
//   baemin/{uid}/stores/{storeId}     ← 매장별 데이터

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

// 사업자당 매장 권장 최대 개수 (배민 정책)
export const MAX_STORES_PER_BUSINESS = 4;

// 미분류 그룹 식별자 (상수화)
// 배민 현실 반영: 사업자명을 입력하지 않은 매장들도 "하나의 사업자" 그룹으로 취급
// (대부분 사장님은 사업자 1개로 운영하므로)
const UNCLASSIFIED_KEY = '__unclassified__';

// ── 프로필 ──

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

// ── 매장 목록 ──

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

export async function loadStore(uid, storeId) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();

    // 마이그레이션: 구버전 단일 'checklist' 필드를 'checklists.baemin' 으로 자동 이전
    // 신규 매장은 checklists.{baemin,coupang} 구조
    if (!data.checklists && data.checklist && typeof data.checklist === 'object') {
      data.checklists = { baemin: data.checklist, coupang: {} };
    }
    if (!data.checklists) {
      data.checklists = { baemin: {}, coupang: {} };
    }

    return { id: snap.id, ...data };
  } catch (err) {
    console.error('loadStore error:', err);
    return null;
  }
}

// ── 매장 생성/수정/삭제 ──

export async function createStore(uid, input) {
  try {
    const ref = collection(db, 'baemin', uid, 'stores');
    const docRef = await addDoc(ref, {
      name: input.name?.trim() || '이름 없는 매장',
      categoryIds: Array.isArray(input.categoryIds) ? input.categoryIds.slice(0, 4) : [],
      businessId: input.businessId?.trim() || '',
      businessGroupName: input.businessGroupName?.trim() || '',
      shopInShops: Array.isArray(input.shopInShops) ? input.shopInShops : [],
      checklists: { baemin: {}, coupang: {} },  // ← 신규 구조: 플랫폼별 맵
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

export async function updateStore(uid, storeId, patch) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const safePatch = { ...patch };
    if (Array.isArray(safePatch.categoryIds)) {
      safePatch.categoryIds = safePatch.categoryIds.slice(0, 4);
    }
    await updateDoc(ref, {
      ...safePatch,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('updateStore error:', err);
    return false;
  }
}

// ← 인자 이름을 명확히 'checklists' 로 (플랫폼별 맵 구조 그대로 저장)
export async function saveStoreChecklist(uid, storeId, checklists) {
  return updateStore(uid, storeId, { checklists });
}

export async function saveShopInShops(uid, storeId, shopInShops) {
  return updateStore(uid, storeId, { shopInShops });
}

// AI 캐시 = 버전 히스토리 (최근 10개까지 누적)
// 구조: aiCache[cacheKey] = [{ ts, content }, ...최신순]
//
// cacheKey 예시:
//   'intro'                       — 가게소개 (전체 매장 1개)
//   'notice'                      — 사장님공지 (전체 매장 1개)
//   'menuname:불향쭈꾸미덮밥'     — 메뉴명 (메뉴별 분리)
//   'menudesc:불향쭈꾸미덮밥'     — 메뉴설명 (메뉴별 분리)
//
// 리뷰답변(review)은 일회성이라 캐시 ✗ — saveAiCache 호출하지 않음

const AI_HISTORY_MAX = 10;  // 매장·항목별 최근 10개까지 보관

export async function saveAiCache(uid, storeId, cacheKey, content) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    const prev = snap.exists() ? (snap.data().aiCache || {}) : {};

    // 구버전 호환: 기존 단일 문자열 캐시를 배열로 마이그레이션
    let history = prev[cacheKey];
    if (typeof history === 'string') {
      history = [{ ts: Date.now() - 1, content: history }];
    }
    if (!Array.isArray(history)) history = [];

    // 동일 content 중복 저장 방지 (가장 최신 버전과 같으면 skip)
    if (history.length > 0 && history[0].content === content) {
      return true;
    }

    // 최신을 맨 앞에 추가 + 최근 N개만 유지
    const next = [{ ts: Date.now(), content }, ...history].slice(0, AI_HISTORY_MAX);

    await updateDoc(ref, {
      aiCache: { ...prev, [cacheKey]: next },
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('saveAiCache error:', err);
    return false;
  }
}

// AI 캐시 히스토리 불러오기 (최신순 배열)
// 구버전 단일 문자열 캐시도 자동으로 배열로 변환해 반환
export async function loadAiHistory(uid, storeId, cacheKey) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    const cache = snap.data().aiCache || {};
    const raw = cache[cacheKey];

    if (!raw) return [];
    if (typeof raw === 'string') return [{ ts: 0, content: raw }];  // 구버전 호환
    if (Array.isArray(raw)) return raw;
    return [];
  } catch (err) {
    console.error('loadAiHistory error:', err);
    return [];
  }
}

// 특정 히스토리 버전 삭제 (timestamp 기준)
export async function deleteAiHistoryItem(uid, storeId, cacheKey, ts) {
  try {
    const ref = doc(db, 'baemin', uid, 'stores', storeId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return false;
    const cache = snap.data().aiCache || {};
    const history = Array.isArray(cache[cacheKey]) ? cache[cacheKey] : [];
    const next = history.filter(h => h.ts !== ts);

    await updateDoc(ref, {
      aiCache: { ...cache, [cacheKey]: next },
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    console.error('deleteAiHistoryItem error:', err);
    return false;
  }
}

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

// ─────────────────────────────────────────────
// 그룹핑 헬퍼
// ─────────────────────────────────────────────

// 매장에서 그룹 키 추출
// 우선순위: businessGroupName > businessId > '__unclassified__' (기본 사업자)
export function getGroupKey(store) {
  if (!store) return UNCLASSIFIED_KEY;
  const name = (store.businessGroupName || '').trim();
  if (name) return `name:${name}`;
  const bid = (store.businessId || '').trim();
  if (bid) return `bid:${bid}`;
  return UNCLASSIFIED_KEY;  // 미분류도 "하나의 사업자" 그룹으로 취급
}

// 그룹 표시용 레이블 (드롭다운 헤더에 쓸 이름)
export function getGroupLabel(store) {
  if (!store) return '';
  const name = (store.businessGroupName || '').trim();
  if (name) return name;
  const bid = (store.businessId || '').trim();
  if (bid) return bid;
  return '';  // 미분류는 빈 문자열 (UI에서 헤더 안 보임)
}

// 매장 리스트를 그룹별로 묶기
// 반환: [{ key, label, stores: [...] }, ...]
// - 미분류 그룹은 맨 앞에 배치 (드롭다운에서 헤더 없이 먼저 표시)
// - 나머지 그룹은 첫 매장 createdAt 기준 오름차순
export function groupStoresByBusiness(stores) {
  if (!Array.isArray(stores) || stores.length === 0) return [];

  const groups = new Map();

  for (const s of stores) {
    const key = getGroupKey(s);
    const label = getGroupLabel(s);

    if (!groups.has(key)) {
      groups.set(key, { key, label, stores: [] });
    }
    groups.get(key).stores.push(s);
  }

  // 정렬: 미분류는 맨 앞, 나머지는 createdAt 순
  const arr = Array.from(groups.values());
  arr.sort((a, b) => {
    if (a.key === UNCLASSIFIED_KEY) return -1;
    if (b.key === UNCLASSIFIED_KEY) return 1;
    const aTime = a.stores[0]?.createdAt?.seconds || 0;
    const bTime = b.stores[0]?.createdAt?.seconds || 0;
    return aTime - bTime;
  });

  return arr;
}

// 같은 그룹에 속한 매장 수 세기 (4개 초과 경고용)
// - 미분류 매장도 이제 경고 대상 (같은 "기본 사업자"로 간주)
// - excludeStoreId: 수정 시 자기 자신 제외
export function countStoresInSameGroup(stores, targetStore, excludeStoreId = null) {
  if (!targetStore) return 0;
  const targetKey = getGroupKey(targetStore);

  return stores.filter(s => {
    if (excludeStoreId && s.id === excludeStoreId) return false;
    return getGroupKey(s) === targetKey;
  }).length;
}
