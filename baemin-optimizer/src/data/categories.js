// 배민 공식 카테고리 (2026.04 기준, 총 15개)
// 매장당 최대 4개까지 선택 가능 (배민 실제 정책)

export const BAEMIN_CATEGORIES = [
  { id: 'meat',        emoji: '🥩', name: '고기·구이' },
  { id: 'baekban',     emoji: '🍚', name: '백반·죽·국수' },
  { id: 'jjim',        emoji: '🍲', name: '찜·탕·찌개' },
  { id: 'snack',       emoji: '🌭', name: '분식' },
  { id: 'cafe',        emoji: '☕', name: '카페·디저트' },
  { id: 'japanese',    emoji: '🍣', name: '돈까스·회·일식' },
  { id: 'western',     emoji: '🍝', name: '양식' },
  { id: 'asian',       emoji: '🌏', name: '아시안' },
  { id: 'jokbal',      emoji: '🥓', name: '족발·보쌈' },
  { id: 'pizza',       emoji: '🍕', name: '피자' },
  { id: 'chicken',     emoji: '🍗', name: '치킨' },
  { id: 'chinese',     emoji: '🥟', name: '중식' },
  { id: 'night',       emoji: '🌙', name: '야식' },
  { id: 'lunchbox',    emoji: '🍱', name: '도시락' },
  { id: 'fastfood',    emoji: '🍔', name: '패스트푸드' },
];

// 카테고리 최대 선택 개수 (배민 실제 정책)
export const MAX_CATEGORIES_PER_STORE = 4;

// 유효한 카테고리 ID 집합 (마이그레이션/검증용)
export const VALID_CATEGORY_IDS = new Set(BAEMIN_CATEGORIES.map(c => c.id));

// ID로 카테고리 찾기
export function getCategoryById(id) {
  return BAEMIN_CATEGORIES.find(c => c.id === id) || null;
}

// ID 배열을 카테고리 객체 배열로 변환 (유효한 것만)
// 유효하지 않은 ID는 자동으로 걸러짐 → 구 카테고리 자동 무시
export function getCategoriesByIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map(id => getCategoryById(id))
    .filter(Boolean);
}

// 주어진 ID들 중 유효한 것만 남기기
// → 구 카테고리 ID(korean, franchise 등)는 자동 제거
export function sanitizeCategoryIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter(id => VALID_CATEGORY_IDS.has(id));
}

// 카테고리 ID 토글 (선택/해제)
// 최대 개수 초과 시 무시
export function toggleCategoryId(currentIds, newId) {
  if (!Array.isArray(currentIds)) return [newId];
  if (currentIds.includes(newId)) {
    return currentIds.filter(id => id !== newId);
  }
  if (currentIds.length >= MAX_CATEGORIES_PER_STORE) {
    return currentIds;  // 최대 개수 도달, 추가 불가
  }
  return [...currentIds, newId];
}