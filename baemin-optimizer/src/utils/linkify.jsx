// utils/linkify.jsx
// 텍스트 안의 URL 패턴 + 마크다운 링크를 React <a> 노드로 변환합니다.
//
// 지원 패턴:
//   1. Plain URL (초록 underline)
//      - https://...  http://...
//      - www.example.com
//      - danggum.net/숫자  (단꿈 단축 URL)
//      - xxx.vercel.app(/...)  (Vercel 앱)
//   2. 마크다운 링크 (노란 배경 강조)
//      - [텍스트](URL)
//      - 예: [🔗 세일즈랩](https://www.saleslab.co.kr/)
//
// 사용법: { linkify(item.guide.tip) }

import React from 'react';

// 마크다운 링크 [텍스트](URL) + Plain URL 패턴 결합
const COMBINED_RE = /(\[[^\]\n]+\]\([^\s)]+\))|(https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+|danggum\.net\/\d+|[a-z0-9-]+\.vercel\.app(?:\/[^\s<>"')\]]*)?)/gi;

// 마크다운 링크 분해
const MD_PARSE_RE = /^\[([^\]]+)\]\(([^\s)]+)\)$/;

// URL 끝의 구두점은 잘라내기
const TRAILING_PUNCT = /[.,;:!?)\]}>]+$/;

// 기본 링크 스타일 (plain URL)
const linkStyle = {
  color: '#3dba6f',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  wordBreak: 'break-all',
};

// 강조 링크 스타일 (마크다운 링크 — 노란 배경)
const highlightLinkStyle = {
  background: '#fff59d',
  color: '#5d4037',
  padding: '2px 8px',
  borderRadius: '4px',
  fontWeight: 700,
  textDecoration: 'none',
  margin: '0 2px',
  display: 'inline-block',
};

export function linkify(text) {
  if (text == null) return text;
  if (typeof text !== 'string') return text;
  if (!text) return text;

  const parts = [];
  let lastIdx = 0;
  let match;
  const re = new RegExp(COMBINED_RE.source, 'gi');

  while ((match = re.exec(text)) !== null) {
    const fullMatch = match[0];
    const idx = match.index;

    // 이전 일반 텍스트
    if (idx > lastIdx) {
      parts.push(text.slice(lastIdx, idx));
    }

    // 마크다운 링크인지 plain URL인지 분기
    const mdMatch = fullMatch.match(MD_PARSE_RE);

    if (mdMatch) {
      // ────────── 마크다운 링크 [label](url) → 노란 배경 강조 ──────────
      const label = mdMatch[1];
      let href = mdMatch[2];
      if (!/^https?:\/\//i.test(href)) {
        href = 'https://' + href;
      }

      parts.push(
        React.createElement(
          'a',
          {
            key: `hl-${idx}`,
            href,
            target: '_blank',
            rel: 'noopener noreferrer',
            style: highlightLinkStyle,
            onClick: (e) => e.stopPropagation(),
          },
          label
        )
      );

      lastIdx = idx + fullMatch.length;
    } else {
      // ────────── Plain URL → 초록 underline (기존 로직) ──────────
      let url = fullMatch;
      let trailing = '';
      const trail = url.match(TRAILING_PUNCT);
      if (trail) {
        trailing = trail[0];
        url = url.slice(0, url.length - trailing.length);
      }

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

      lastIdx = idx + fullMatch.length;
    }
  }

  // 마지막 일반 텍스트
  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts.length > 0 ? parts : text;
}

export default linkify;