// utils/linkify.jsx
// 텍스트 안의 URL 패턴을 React <a> 노드로 변환합니다.
// 지원 패턴:
//   - https://...  http://...
//   - www.example.com
//   - danggum.net/숫자  (단꿈 단축 URL)
//   - xxx.vercel.app(/...)  (Vercel 앱)
//
// 사용법: { linkify(item.guide.tip) }
// 부모 요소에 whiteSpace: 'pre-wrap' 또는 줄바꿈 처리가 되어 있어야
// \n이 그대로 보입니다.

import React from 'react';

// URL 후보를 잡는 정규식
// - 끝에 들러붙는 구두점·괄호는 제외 (.,;:!?)]}>)
const URL_RE = /(https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+|danggum\.net\/\d+|[a-z0-9-]+\.vercel\.app(?:\/[^\s<>"')\]]*)?)/gi;

// URL 끝의 구두점은 잘라내기 (예: "danggum.net/71." → "danggum.net/71" + ".")
const TRAILING_PUNCT = /[.,;:!?)\]}>]+$/;

const linkStyle = {
  color: '#3dba6f',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  wordBreak: 'break-all',
};

export function linkify(text) {
  if (text == null) return text;
  if (typeof text !== 'string') return text;
  if (!text) return text;

  const parts = [];
  let lastIdx = 0;
  let match;
  // 매번 새 인스턴스로 lastIndex 안전 처리
  const re = new RegExp(URL_RE.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    let url = match[0];
    let idx = match.index;

    // 끝의 구두점 떼어내기
    let trailing = '';
    const trail = url.match(TRAILING_PUNCT);
    if (trail) {
      trailing = trail[0];
      url = url.slice(0, url.length - trailing.length);
    }

    // URL 이전 일반 텍스트
    if (idx > lastIdx) {
      parts.push(text.slice(lastIdx, idx));
    }

    // 절대 경로 보정
    let href = url;
    if (!/^https?:\/\//i.test(href)) {
      href = 'https://' + href;
    }

    parts.push(
      React.createElement(
        'a',
        {
          key: `lk-${idx}-${url}`,
          href,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: linkStyle,
          onClick: (e) => e.stopPropagation(),
        },
        url
      )
    );

    if (trailing) parts.push(trailing);

    lastIdx = idx + url.length + trailing.length;
  }

  // 마지막 일반 텍스트
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  // URL이 없으면 원본 문자열 그대로 반환 (성능 + 단순성)
  return parts.length > 0 ? parts : text;
}

export default linkify;
