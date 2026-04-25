import { useState } from 'react';
import AiModal from './AiModal';

const BADGE = {
  must:     { bg: '#3d1810', color: '#e85040' },
  high:     { bg: '#3d2a08', color: '#e8a020' },
  mid:      { bg: '#1a2535', color: '#4090e0' },
  advanced: { bg: '#2d0a3d', color: '#c060e8' },
};

const CYCLE = {
  '1m':     { label: '⚠️ 월 1회 점검',      color: '#e85040', bg: 'rgba(232,80,64,.1)',  border: 'rgba(232,80,64,.3)' },
  '3m':     { label: '⚠️ 3개월 주기 교체',  color: '#e85040', bg: 'rgba(232,80,64,.1)',  border: 'rgba(232,80,64,.3)' },
  '6m':     { label: '🔁 6개월 주기 점검',  color: '#e8a020', bg: 'rgba(232,160,32,.1)', border: 'rgba(232,160,32,.3)' },
  weekly:   { label: '⚠️ 주 1회 점검',       color: '#e8a020', bg: 'rgba(232,160,32,.1)', border: 'rgba(232,160,32,.3)' },
  adhoc:    { label: '🔄 수시 체크',          color: '#4090e0', bg: 'rgba(64,144,224,.1)', border: 'rgba(64,144,224,.3)' },
};

export default function CheckItem({ item, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  // 자가검증 체크박스 로컬 상태 (저장 안 함, 펼침 동안만 유지)
  const [prereqChecks, setPrereqChecks] = useState({});
  const g = item.guide;

  const togglePrereq = (idx) => {
    setPrereqChecks(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <>
      <div style={{
        ...S.wrap,
        borderColor: checked ? '#1e4a32' : open ? '#323c38' : '#2a3030',
      }}>
        {/* 헤더 행 */}
        <div style={S.head} onClick={() => setOpen(o => !o)}>
          {/* 체크박스 */}
          <div
            style={{ ...S.cb, background: checked ? '#3dba6f' : 'transparent', borderColor: checked ? '#3dba6f' : '#323c38' }}
            onClick={e => { e.stopPropagation(); onToggle(item.id); }}
          >
            {checked && (
              <svg width="12" height="10" fill="none" viewBox="0 0 12 10">
                <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>

          {/* 정보 */}
          <div style={S.info}>
            <div style={{ ...S.name, color: checked ? '#9aada6' : '#e8ede8' }}>
              {item.name}
              <span style={{ ...S.badge, ...BADGE[item.badge] }}>{item.badgeLabel}</span>
              {item.cycle && CYCLE[item.cycle] && (
                <span style={{ ...S.cycleBadge, color: CYCLE[item.cycle].color, background: CYCLE[item.cycle].bg, border: `1px solid ${CYCLE[item.cycle].border}` }}>
                  {CYCLE[item.cycle].label}
                </span>
              )}
            </div>
            <div style={S.desc}>{item.desc}</div>
          </div>

          {/* 화살표 */}
          <svg style={{ ...S.chev, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
          </svg>
        </div>

        {/* 가이드 패널 */}
        {open && (
          <div style={S.panel}>
            {/* 🚨 펼치자마자 가장 먼저 보이는 빨간 경고 박스 (warnTop) */}
            {g.warnTop && (
              <div style={S.warnTop}>
                <pre style={S.warnTopText}>{g.warnTop.content}</pre>
              </div>
            )}

            {/* 🛑 자가검증 체크박스 (prerequisiteCheck) */}
            {g.prerequisiteCheck && (
              <div style={S.prereq}>
                <div style={S.prereqTitle}>{g.prerequisiteCheck.title}</div>
                <ul style={S.prereqList}>
                  {g.prerequisiteCheck.items.map((it, i) => (
                    <li key={i} style={S.prereqItem} onClick={() => togglePrereq(i)}>
                      <span style={{
                        ...S.prereqBox,
                        background: prereqChecks[i] ? '#3dba6f' : 'transparent',
                        borderColor: prereqChecks[i] ? '#3dba6f' : '#7a6020',
                      }}>
                        {prereqChecks[i] && (
                          <svg width="10" height="8" fill="none" viewBox="0 0 12 10">
                            <path d="M1 5l3.5 3.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </span>
                      <span style={{ color: prereqChecks[i] ? '#7acf9a' : '#e0c890', textDecoration: prereqChecks[i] ? 'line-through' : 'none' }}>{it}</span>
                    </li>
                  ))}
                </ul>
                {g.prerequisiteCheck.warn && (
                  <div style={S.prereqWarn}>{g.prerequisiteCheck.warn}</div>
                )}
              </div>
            )}

            {/* 포인트 리스트 */}
            {g.points && (
              <div style={S.gsec}>
                <div style={S.gtitle}>입력해야 할 것</div>
                <ul style={S.pts}>
                  {g.points.map((p, i) => (
                    <li key={i} style={S.pt}>
                      <span style={S.arr}>›</span>
                      <span><strong style={{ color: '#e8ede8', fontWeight: 600 }}>{p.strong}</strong> — {p.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 예시 */}
            {g.example && (
              <div style={S.gsec}>
                <div style={S.gtitle}>예시</div>
                <div style={S.ex}>
                  <div style={S.exlabel}>{g.example.label}</div>
                  <pre style={S.extext}>{g.example.content}</pre>
                </div>
              </div>
            )}

            {/* 경고 */}
            {g.warn && <div style={S.warn}>⚠ {g.warn}</div>}

            {/* 팁 */}
            {g.tip && <div style={S.tip}>💡 {g.tip}</div>}

            {/* AI 버튼 */}
            {item.aiType && (
              <button style={S.aiBtn} onClick={() => setAiOpen(true)}>
                ✨ {item.aiLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {aiOpen && <AiModal item={item} onClose={() => setAiOpen(false)} />}
    </>
  );
}

const S = {
  wrap: {
    background: '#181c1a', border: '1px solid',
    borderRadius: '10px', marginBottom: '8px', overflow: 'hidden',
    transition: 'border-color .2s',
  },
  head: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '15px 16px', cursor: 'pointer', userSelect: 'none',
  },
  cb: {
    width: '22px', height: '22px', flexShrink: 0,
    border: '2px solid', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s', cursor: 'pointer',
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontSize: '14px', fontWeight: 600,
    display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap',
  },
  badge: {
    fontSize: '10px', fontWeight: 700,
    padding: '2px 6px', borderRadius: '4px',
  },
  cycleBadge: {
    fontSize: '10px', fontWeight: 600,
    padding: '2px 7px', borderRadius: '10px',
    letterSpacing: '-0.2px',
  },
  desc: { fontSize: '12px', color: '#607570', marginTop: '3px' },
  chev: { width: '18px', height: '18px', flexShrink: 0, color: '#607570', transition: 'transform .25s' },

  panel: {
    background: '#1f2421', borderTop: '1px solid #2a3030',
    padding: '18px 18px 20px 52px',
  },

  // 🚨 warnTop — 펼치자마자 가장 먼저 보이는 빨간 경고 박스
  warnTop: {
    background: 'linear-gradient(135deg, #4a1208, #2d0a05)',
    border: '1px solid #e85040',
    borderLeft: '4px solid #ff4030',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '16px',
    boxShadow: '0 0 0 1px rgba(232,80,64,.15)',
  },
  warnTopText: {
    fontSize: '13px', color: '#ffc4b8', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit',
    fontWeight: 500,
  },

  // 🛑 prerequisiteCheck — 자가검증 체크박스
  prereq: {
    background: '#2d2208',
    border: '1px solid #7a6020',
    borderLeft: '4px solid #e8a020',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '16px',
  },
  prereqTitle: {
    fontSize: '13px', fontWeight: 700,
    color: '#f5d77a', marginBottom: '10px',
    letterSpacing: '-0.3px',
  },
  prereqList: { listStyle: 'none', padding: 0, margin: 0 },
  prereqItem: {
    fontSize: '13px', lineHeight: 1.6,
    padding: '6px 0', display: 'flex', gap: '10px',
    cursor: 'pointer', userSelect: 'none',
    borderBottom: '1px solid rgba(122,96,32,.3)',
  },
  prereqBox: {
    width: '18px', height: '18px', flexShrink: 0,
    border: '2px solid', borderRadius: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .15s',
    marginTop: '2px',
  },
  prereqWarn: {
    marginTop: '12px',
    padding: '8px 10px',
    background: 'rgba(232,160,32,.08)',
    borderRadius: '5px',
    fontSize: '11.5px',
    color: '#d8a85a',
    lineHeight: 1.55,
  },

  gsec: { marginBottom: '14px' },
  gtitle: {
    fontSize: '10px', fontWeight: 700, letterSpacing: '.08em',
    color: '#607570', textTransform: 'uppercase', marginBottom: '8px',
  },
  pts: { listStyle: 'none', padding: 0, margin: 0 },
  pt: {
    fontSize: '13px', color: '#9aada6', lineHeight: 1.65,
    padding: '4px 0 4px 0', borderBottom: '1px solid #2a3030',
    display: 'flex', gap: '6px',
  },
  arr: { color: '#3dba6f', fontWeight: 700, flexShrink: 0 },

  ex: {
    background: '#0f1110', border: '1px solid #2a3030',
    borderLeft: '3px solid #e8a020', borderRadius: '6px', padding: '12px 14px',
  },
  exlabel: {
    fontSize: '10px', fontWeight: 700, letterSpacing: '.07em',
    color: '#e8a020', marginBottom: '6px', textTransform: 'uppercase',
  },
  extext: {
    fontSize: '13px', color: '#9aada6', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit',
  },

  warn: {
    background: '#3d1810', border: '1px solid #5a2018',
    borderRadius: '6px', padding: '10px 14px',
    fontSize: '12px', color: '#e09088', lineHeight: 1.6, marginBottom: '10px',
  },
  tip: {
    background: 'rgba(61,186,111,.1)', border: '1px solid #1e4a32',
    borderRadius: '6px', padding: '10px 14px',
    fontSize: '12px', color: '#7acf9a', lineHeight: 1.6, marginBottom: '10px',
  },

  aiBtn: {
    background: 'linear-gradient(135deg, #1e4a32, #0d3020)',
    border: '1px solid #3dba6f', borderRadius: '8px',
    padding: '10px 18px', fontSize: '13px', fontWeight: 700,
    color: '#3dba6f', cursor: 'pointer', marginTop: '4px',
    display: 'flex', alignItems: 'center', gap: '6px',
  },
};
