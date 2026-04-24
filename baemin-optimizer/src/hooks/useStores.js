// 다점포 상태 관리 훅
// 사용자의 매장 목록 + activeStoreId를 관리
// App.jsx에서 { stores, activeStoreId, activeStore, refresh, switchStore, addStore } 형태로 사용

import { useState, useEffect, useCallback } from 'react';
import {
  loadProfile,
  listStores,
  createStore,
  setActiveStoreId as persistActiveStoreId,
} from '../lib/stores';

export function useStores(user) {
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── 매장 목록 + activeStoreId 불러오기 ──
  const refresh = useCallback(async () => {
    if (!user) {
      setStores([]);
      setActiveStoreId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [profile, storeList] = await Promise.all([
        loadProfile(user.uid),
        listStores(user.uid),
      ]);

      setStores(storeList);

      // activeStoreId 결정 우선순위:
      // 1) 프로필에 저장된 activeStoreId가 현재 stores에 존재하면 그대로
      // 2) 없으면 첫 번째 매장
      // 3) 매장이 하나도 없으면 null
      const saved = profile?.activeStoreId;
      const valid = saved && storeList.some(s => s.id === saved);
      const next = valid ? saved : (storeList[0]?.id ?? null);
      setActiveStoreId(next);
    } catch (err) {
      console.error('useStores.refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── 매장 전환 ──
  const switchStore = useCallback(async (storeId) => {
    if (!user || !storeId) return;
    setActiveStoreId(storeId);
    await persistActiveStoreId(user.uid, storeId);
  }, [user]);

  // ── 매장 추가 ──
  // input: { name, mainCategoryId, businessId?, shopInShops? }
  const addStore = useCallback(async (input) => {
    if (!user) return null;
    const newId = await createStore(user.uid, input);
    if (!newId) return null;

    // 새로 만든 매장을 active로 설정하고 목록 갱신
    await persistActiveStoreId(user.uid, newId);
    await refresh();
    setActiveStoreId(newId);
    return newId;
  }, [user, refresh]);

  // ── 로컬 상태 업데이트 (Firestore 저장 없이 리스트만 갱신) ──
  // 매장 설정 모달에서 이름/카테고리 변경 후 즉시 UI 반영용
  const patchLocalStore = useCallback((storeId, patch) => {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, ...patch } : s));
  }, []);

  const activeStore = stores.find(s => s.id === activeStoreId) || null;

  return {
    stores,
    activeStoreId,
    activeStore,
    loading,
    refresh,
    switchStore,
    addStore,
    patchLocalStore,
  };
}
