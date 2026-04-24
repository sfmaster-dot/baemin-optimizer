// 배민 공식 카테고리 15종 (2026 기준)
// 매장 추가/수정 시 최대 4개 선택 가능 (배민 실제 정책)

export const BAEMIN_CATEGORIES = [
  { id: 'korean',      name: '한식',             emoji: '🍚' },
  { id: 'chinese',     name: '중식',             emoji: '🥟' },
  { id: 'japanese',    name: '일식',             emoji: '🍣' },
  { id: 'western',     name: '양식',             emoji: '🍝' },
  { id: 'snack',       name: '분식',             emoji: '🍜' },
  { id: 'chicken',     name: '치킨',             emoji: '🍗' },
  { id: 'pizza',       name: '피자',             emoji: '🍕' },
  { id: 'jokbal',      name: '족발·보쌈',         emoji: '🥩' },
  { id: 'night',       name: '야식',             emoji: '🌙' },
  { id: 'jjim',        name: '찜·탕',            emoji: '🍲' },
  { id: 'lunchbox',    name: '도시락',           emoji: '🍱' },
  { id: 'fastfood',    name: '패스트푸드',       emoji: '🍔' },
  { id: 'cafe',        name: '카페·디저트',       emoji: '☕' },
  { id: 'asian',       name: '아시안·세계음식',   emoji: '🌏' },
  { id: 'franchise',   name: '프랜차이즈',       emoji: '🏪' },
];

// 배민 카테고리 신청 최대 개수 (메인매장/샵인샵 각각 독립)
export const MAX_CATEGORIES_PER_STORE = 4;

// 샵인샵 소프트 제한 (경고만, 추가는 허용)
export const SHOP_IN_SHOP_SOFT_LIMIT = 3;

// 단일 ID 조회
export function getCategoryById(id) {
  return BAEMIN_CATEGORIES.find(c => c.id === id) || null;
}

export function getCategoryName(id) {
  return getCategoryById(id)?.name || '';
}

// 여러 ID를 이름 배열로 변환 (순서 유지, 없는 ID는 스킵)
export function getCategoryNames(ids) {
  if (!Array.isArray(ids)) return [];
  return ids
    .map(id => getCategoryName(id))
    .filter(name => name);
}

// 여러 ID를 "한식·중식·야식" 같은 구분자 문자열로 (UI 표시용)
export function formatCategoryList(ids, separator = '·') {
  return getCategoryNames(ids).join(separator);
}

// 배열 토글 (선택/해제). 최대 개수 제한 적용.
// - id가 이미 있으면 제거
// - 없으면 추가 (단, 이미 max개면 무시)
export function toggleCategoryId(currentIds, id, max = MAX_CATEGORIES_PER_STORE) {
  const list = Array.isArray(currentIds) ? currentIds : [];
  if (list.includes(id)) {
    return list.filter(x => x !== id);
  }
  if (list.length >= max) {
    return list;  // 최대 초과 시 무시
  }
  return [...list, id];
}