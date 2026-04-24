import { useState } from 'react';
import { CHECKLIST, SECTIONS } from './data/checklist';
import CheckItem from './components/CheckItem';
import AiModal from './components/AiModal';

const AI_TOOLS = [
  { type: 'intro',    emoji: '🏪', name: '가게소개 생성',   desc: '200~400자 · 스토리형' },
  { type: 'notice',   emoji: '📢', name: '사장님공지 생성', desc: '이벤트·휴무·신메뉴' },
  { type: 'menuname', emoji: '🍽️', name: '메뉴명 SEO',     desc: '검색 키워드 최적화 3종' },
  { type: 'menudesc', emoji: '📝', name: '메뉴설명 후킹',   desc: '60자 이내 · 후킹+구성' },
  { type: 'reply',    emoji: '💬', name: '리뷰답변 생성',   desc: '별점 기반 톤 자동 조정' },
];

function getGrade(pct) {
  if (pct === 0)  return { label: '시작 전',        cls: 'g0' };
  if (pct <= 30)  return { label: '🌱 기초 단계',   cls: 'g1' };
  if (pct <= 60)  return { label: '📈 성장 단계',   cls: 'g2' };
  if (pct <= 90)  return { label: '🚀 안정 단계',   cls: 'g3' };
  if (pct < 100)  return { label: '⭐ 최적화 임박', cls: 'g3' };
  return            { label: '🏆 최적화 완료',       cls: 'g4' };
}

const GRADE_COLOR = {
  g0: { color: '#607570' },
  g1: { color: '#F5B041' },
  g2: { color: '#7BC67E' },
  g3: { color: '#3dba6f' },
  g4: { color: '#FFD700', filter: 'drop-shadow(0 0 6px rgba(255,215,0,.6))' },
};

export default function App() {
  const [checked, setChecked]   = useState({});
  const [aiModal, setAiModal]   = useState(null);
  const [fabOpen, setFabOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState(1); // 현재 선택된 섹션

  const total = CHECKLIST.length;
  const done  = Object.keys(checked).length;
  const pct   = Math.round((done / total) * 100);
  const grade = getGrade(pct);

  function toggle(id) {
    setChecked(c => { const n={...c}; if(n[id]) delete n[id]; else n[id]=true; return n; });
  }
  function openAi(type) { setAiModal(type); setFabOpen(false); }

  const modalItem = aiModal
    ? (() => { const t = AI_TOOLS.find(x => x.type === aiModal); return t ? { aiType: t.type, aiLabel: t.name } : null; })()
    : null;

  const activeItems = CHECKLIST.filter(i => i.section === activeTab);

  return (
    <div style={S.root}>
      <header style={S.header}>
        <div style={S.logo}><img src='/baemin-logo.png' alt='배민' style={S.logoImg} /></div>
        <div style={S.htext}>
          <h1 style={S.htitle}>배민 가게 최적화 체크리스트</h1>
          <div style={S.hsub}>
            <span>배달의민족 셀프서비스 · 전체 설정 점검</span>
            <span style={S.badge}>✓ 공식 가이드 2026.04 반영</span>
          </div>
        </div>
        <div style={S.hprog}>
          <div style={S.plabel}>완료 항목 · <span style={{...S.grade, ...GRADE_COLOR[grade.cls]}}>{grade.label}</span></div>
          <div style={S.pbarWrap}><div style={{ ...S.pbarFill, width: pct + '%' }} /></div>
          <div style={S.pcount}><span style={{color:'#3dba6f',fontWeight:700}}>{done}</span><span style={{color:'#607570',fontWeight:500}}> / {total}</span></div>
        </div>
      </header>

      <main style={S.main}>
        {/* AI 도구 패널 */}
        <div style={S.aiPanel}>
          <div style={S.aiPanelHead}>
            <div>
              <div style={S.aiPanelTitle}><span>✨</span> AI 문구 생성 도구</div>
              <div style={S.aiPanelSub}>가게소개·공지사항·메뉴명·메뉴설명·리뷰답변을 업종별 프리셋으로 한 번에</div>
            </div>
            <span style={S.aiCount}>{AI_TOOLS.length}종</span>
          </div>
          <div style={S.aiGrid}>
            {AI_TOOLS.map(t => (
              <button key={t.type} className='aiCard' onClick={() => openAi(t.type)}>
                <span className='aiCardEmoji'>{t.emoji}</span>
                <div style={S.aiMeta}>
                  <span style={S.aiName}>{t.name}</span>
                  <span style={S.aiDesc}>{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 UI */}
        <div style={S.tabsWrap}>
          <div style={S.tabs}>
            {SECTIONS.map(sec => {
              const items = CHECKLIST.filter(i => i.section === sec.id);
              const secDone = items.filter(i => checked[i.id]).length;
              const isActive = activeTab === sec.id;
              const isDone = secDone === items.length;
              return (
                <button
                  key={sec.id}
                  className='tabBtn'
                  style={{
                    ...S.tabBtn,
                    ...(isActive ? S.tabBtnActive : {}),
                  }}
                  onClick={() => setActiveTab(sec.id)}
                >
                  <span style={S.tabEmoji}>{sec.emoji}</span>
                  <span style={S.tabLabel}>{sec.short}</span>
                  <span style={{
                    ...S.tabCount,
                    color: isActive ? '#3dba6f' : isDone ? '#3dba6f' : '#607570',
                    background: isActive ? 'rgba(61,186,111,.15)' : 'transparent',
                  }}>
                    {secDone}/{items.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 현재 섹션 체크리스트 */}
        <div style={{minHeight: '300px'}}>
          {activeItems.map(item => (
            <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
          ))}
        </div>

        {done === total && (
          <div style={S.banner}>
            <div style={S.bannerTitle}>🏆 최적화 완료!</div>
            <div style={S.bannerSub}>배민 최적화 {total}개 항목을 모두 확인했습니다.<br/>이제 주문이 들어올 모든 준비가 됐습니다.</div>
          </div>
        )}
      </main>

      {/* 플로팅 AI 버튼 */}
      <div style={S.fab}>
        <div style={{...S.fabMenu, display: fabOpen ? 'flex' : 'none'}}>
          {AI_TOOLS.map(t => (
            <button key={t.type} className='fabItem' onClick={() => openAi(t.type)}>
              <span className='fabItemIcon'>{t.emoji}</span>
              {t.name}
            </button>
          ))}
        </div>
        <button
          className='fabMain'
          style={{...S.fabMain, ...(fabOpen ? S.fabMainOpen : {})}}
          onClick={() => setFabOpen(o => !o)}
          title='AI 문구 생성 도구'
        >
          {fabOpen ? '✕' : '✨'}
        </button>
      </div>

      {aiModal && modalItem && <AiModal item={modalItem} onClose={() => setAiModal(null)} />}

      <style>{`
        @keyframes fabFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .aiCard {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 16px; background: #181c1a;
          border: 1px solid #2a3030; border-radius: 12px;
          color: #e8ede8; text-align: left; cursor: pointer;
          transition: all 0.2s; font-family: inherit;
        }
        .aiCard:hover {
          border-color: rgba(61,186,111,.5); background: #1c2021;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(61,186,111,.15);
        }
        .aiCardEmoji {
          flex-shrink: 0; width: 38px; height: 38px;
          border-radius: 10px; background: rgba(61,186,111,.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }

        .tabBtn:hover {
          background: #1c2021 !important;
          color: #e8ede8 !important;
        }

        .fabMain {
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, #3dba6f 0%, #00a869 100%);
          color: white; font-size: 26px;
          box-shadow: 0 6px 20px rgba(61,186,111,.35), 0 2px 8px rgba(0,0,0,.25);
          border: 2px solid rgba(255,255,255,.15);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; justify-content: center;
        }
        .fabMain:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 28px rgba(61,186,111,.5), 0 4px 12px rgba(0,0,0,.3);
        }

        .fabItem {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px 10px 14px; background: #181c1a;
          border: 1px solid #323c38; border-radius: 999px;
          color: #e8ede8; font-size: 13.5px; font-weight: 500;
          box-shadow: 0 4px 14px rgba(0,0,0,.3);
          white-space: nowrap; transition: all 0.2s;
          cursor: pointer; font-family: inherit;
        }
        .fabItem:hover {
          background: rgba(61,186,111,.12);
          border-color: rgba(61,186,111,.5);
          color: #3dba6f; transform: translateX(-4px);
        }
        .fabItemIcon {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(61,186,111,.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
        }

        @media (max-width: 680px) {
          .aiCard { padding: 12px 12px; gap: 10px; }
          .aiCardEmoji { width: 34px; height: 34px; font-size: 16px; }
        }
      `}</style>
    </div>
  );
}

const S = {
  root: { fontFamily:"'Noto Sans KR',sans-serif", background:'#0f1110', color:'#e8ede8', minHeight:'100vh', WebkitFontSmoothing:'antialiased' },
  header: { background:'rgba(15,17,16,0.92)', backdropFilter:'blur(8px)', borderBottom:'1px solid #2a3030', padding:'20px 32px', display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'20px', alignItems:'center', position:'sticky', top:0, zIndex:50 },
  logo: { width:'56px', height:'56px', borderRadius:'14px', background:'white', padding:'2px', boxShadow:'0 2px 8px rgba(0,0,0,.3)', overflow:'hidden', flexShrink:0 },
  logoImg: { width:'100%', height:'100%', objectFit:'contain', borderRadius:'12px', display:'block' },
  htext: { minWidth:0 },
  htitle: { fontSize:'20px', fontWeight:700, letterSpacing:'-0.3px', margin:0, marginBottom:'3px' },
  hsub: { fontSize:'12.5px', color:'#9aada6', display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' },
  badge: { display:'inline-flex', alignItems:'center', padding:'2px 8px', background:'rgba(61,186,111,.12)', color:'#3dba6f', border:'1px solid rgba(61,186,111,.3)', borderRadius:'4px', fontSize:'11px', fontWeight:600 },
  hprog: { textAlign:'right', minWidth:'150px' },
  plabel: { fontSize:'11px', color:'#607570', marginBottom:'6px', letterSpacing:'.3px' },
  grade: { fontWeight:600 },
  pbarWrap: { width:'150px', height:'6px', background:'#232829', borderRadius:'999px', overflow:'hidden', marginBottom:'4px', marginLeft:'auto' },
  pbarFill: { height:'100%', background:'linear-gradient(90deg,#3dba6f,#00a869)', borderRadius:'999px', transition:'width .4s cubic-bezier(.4,0,.2,1)' },
  pcount: { fontSize:'14px', fontWeight:600 },

  main: { maxWidth:'920px', margin:'0 auto', padding:'32px 24px 100px' },

  aiPanel: { background:'#16191a', border:'1px solid #2a3030', borderRadius:'14px', padding:'20px 22px', marginBottom:'24px' },
  aiPanelHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' },
  aiPanelTitle: { fontSize:'16px', fontWeight:700, color:'#e8ede8', display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' },
  aiPanelSub: { fontSize:'12.5px', color:'#607570' },
  aiCount: { background:'#232829', color:'#9aada6', border:'1px solid #2a3030', borderRadius:'999px', padding:'3px 12px', fontSize:'12px', fontWeight:600, flexShrink:0 },
  aiGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:'10px' },
  aiMeta: { flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'2px' },
  aiName: { fontSize:'13.5px', fontWeight:600, color:'#e8ede8', lineHeight:1.3 },
  aiDesc: { fontSize:'11.5px', color:'#607570', lineHeight:1.3 },

  // 탭
  tabsWrap: { position:'sticky', top:'97px', zIndex:30, background:'rgba(15,17,16,0.95)', backdropFilter:'blur(8px)', padding:'12px 0', marginBottom:'16px', borderBottom:'1px solid #2a3030', marginLeft:'-24px', marginRight:'-24px', paddingLeft:'24px', paddingRight:'24px' },
  tabs: { display:'flex', gap:'6px', overflowX:'auto', scrollbarWidth:'none' },
  tabBtn: { display:'flex', alignItems:'center', gap:'6px', padding:'10px 14px', background:'transparent', border:'1px solid transparent', borderRadius:'10px', color:'#607570', fontSize:'13px', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s', fontFamily:'inherit' },
  tabBtnActive: { background:'#1c2021', border:'1px solid rgba(61,186,111,.3)', color:'#e8ede8' },
  tabEmoji: { fontSize:'14px' },
  tabLabel: { },
  tabCount: { fontSize:'11px', fontWeight:700, padding:'2px 7px', borderRadius:'10px', transition:'all .2s' },

  banner: { background:'linear-gradient(135deg,#1e4a32,#0d3020)', border:'1px solid #3dba6f', borderRadius:'14px', padding:'24px', textAlign:'center', marginTop:'24px' },
  bannerTitle: { fontSize:'20px', fontWeight:700, color:'#3dba6f', marginBottom:'8px' },
  bannerSub: { fontSize:'13px', color:'#7acf9a', lineHeight:1.7 },

  fab: { position:'fixed', bottom:'28px', right:'28px', zIndex:60, display:'flex', flexDirection:'column-reverse', alignItems:'flex-end', gap:'10px' },
  fabMain: {},
  fabMainOpen: { transform:'rotate(45deg)', background:'#232829', color:'#9aada6', boxShadow:'0 4px 12px rgba(0,0,0,.3)' },
  fabMenu: { flexDirection:'column', gap:'8px', animation:'fabFadeIn 0.25s ease' },
};
