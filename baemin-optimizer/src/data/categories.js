// 배민 공식 카테고리 15종 (2026 기준)
// 매장 추가 시 필수 선택

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

// 편의 조회 함수
export function getCategoryById(id) {
  return BAEMIN_CATEGORIES.find(c => c.id === id) || null;
}

export function getCategoryName(id) {
  return getCategoryById(id)?.name || '';
}

// 샵인샵 소프트 제한 (경고만, 추가는 허용)
export const SHOP_IN_SHOP_SOFT_LIMIT = 3;
