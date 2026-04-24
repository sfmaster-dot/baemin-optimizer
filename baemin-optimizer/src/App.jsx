import { useState } from 'react';
import { CHECKLIST, SECTIONS } from './data/checklist';
import CheckItem from './components/CheckItem';
import AiModal from './components/AiModal';

const AI_TOOLS = [
  { type: 'intro',    emoji: '🏪', name: '가게소개 생성',  desc: '200~400자 · 스토리형' },
  { type: 'notice',   emoji: '📢', name: '사장님공지 생성', desc: '이벤트·휴무·신메뉴' },
  { type: 'menuname', emoji: '🍽️', name: '메뉴명 SEO',     desc: '검색 키워드 최적화 3종' },
  { type: 'menudesc', emoji: '📝', name: '메뉴설명 후킹',  desc: '60자 이내 · 후킹+구성' },
  { type: 'reply',    emoji: '💬', name: '리뷰답변 생성',  desc: '별점 기반 톤 자동 조정' },
];

function getGrade(pct) {
  if (pct === 0)    return { label: '시작 전',       cls: 'g0' };
  if (pct <= 30)   return { label: '🌱 기초 단계',   cls: 'g1' };
  if (pct <= 60)   return { label: '📈 성장 단계',   cls: 'g2' };
  if (pct <= 90)   return { label: '🚀 안정 단계',   cls: 'g3' };
  if (pct < 100)   return { label: '⭐ 최적화 임박', cls: 'g3' };
  return            { label: '🏆 최적화 완료',       cls: 'g4' };
}

export default function App() {
  const [checked, setChecked]   = useState({});
  const [aiModal, setAiModal]   = useState(null); // aiType string
  const [fabOpen, setFabOpen]   = useState(false);

  const total = CHECKLIST.length;
  const done  = Object.keys(checked).length;
  const pct   = Math.round((done / total) * 100);
  const grade = getGrade(pct);

  function toggle(id) {
    setChecked(c => { const n={...c}; if(n[id]) delete n[id]; else n[id]=true; return n; });
  }

  function openAi(type) {
    setAiModal(type);
    setFabOpen(false);
  }

  // AiModal에 item-like 객체 전달
  const modalItem = aiModal
    ? AI_TOOLS.find(t => t.type === aiModal) || { aiType: aiModal, aiLabel: aiModal }
    : null;
  const modalItemFull = modalItem
    ? { aiType: modalItem.type, aiLabel: modalItem.name }
    : null;

  return (
    <div style={S.root}>
      {/* ── 헤더 ── */}
      <header style={S.header}>
        <div style={S.logo}>
          <img src='/baemin-logo.png' alt='배민' style={S.logoImg} />
        </div>
        <div style={S.htext}>
          <h1 style={S.htitle}>배민 가게 최적화 체크리스트</h1>
          <div style={S.hsub}>
            <span>배달의민족 셀프서비스 · 전체 설정 점검</span>
            <span style={S.badge}>✓ 공식 가이드 2026.04 반영</span>
          </div>
        </div>
        <div style={S.hprog}>
          <div style={S.plabel}>완료 항목 · <span style={{...S.grade, ...GRADE_COLOR[grade.cls]}}>{grade.label}</span></div>
          <div style={S.pbarWrap}>
            <div style={{ ...S.pbarFill, width: pct + '%' }} />
          </div>
          <div style={S.pcount}><span style={{color:'#3dba6f',fontWeight:700}}>{done}</span><span style={{color:'#607570',fontWeight:500}}> / {total}</span></div>
        </div>
      </header>

      {/* ── 메인 ── */}
      <main style={S.main}>

        {/* AI 도구 패널 */}
        <div style={S.aiPanel}>
          <div style={S.aiPanelHead}>
            <div>
              <div style={S.aiPanelTitle}><span>✨</span> AI 문구 생성 도구</div>
              <div style={S.aiPanelSub}>가게소개·공지사항·메뉴명·메뉴설명·리뷰답변을 한 번에</div>
            </div>
            <span style={S.aiCount}>{AI_TOOLS.length}종</span>
          </div>
          <div style={S.aiGrid}>
            {AI_TOOLS.map(t => (
              <button key={t.type} style={S.aiCard} onClick={() => openAi(t.type)}>
                <span style={S.aiEmoji}>{t.emoji}</span>
                <div style={S.aiMeta}>
                  <span style={S.aiName}>{t.name}</span>
                  <span style={S.aiDesc}>{t.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 섹션별 체크리스트 */}
        {SECTIONS.map(sec => {
          const items  = CHECKLIST.filter(i => i.section === sec.id);
          const secDone = items.filter(i => checked[i.id]).length;
          return (
            <div key={sec.id}>
              <div style={S.secLabel}>
                <span>{sec.label} — <span style={{color:'#3dba6f',fontWeight:600}}>{secDone}</span><span style={{color:'#607570'}}>/{items.length}개</span> 항목</span>
              </div>
              {items.map(item => (
                <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} onOpenAi={openAi} />
              ))}
            </div>
          );
        })}

        {done === total && (
          <div style={S.banner}>
            <div style={S.bannerTitle}>🏆 최적화 완료!</div>
            <div style={S.bannerSub}>배민 최적화 {total}개 항목을 모두 확인했습니다.<br/>이제 주문이 들어올 모든 준비가 됐습니다.</div>
          </div>
        )}
      </main>

      {/* 플로팅 AI 버튼 */}
      <div style={S.fab}>
        {fabOpen && (
          <div style={S.fabMenu}>
            {AI_TOOLS.map(t => (
              <button key={t.type} style={S.fabItem} onClick={() => openAi(t.type)}>
                <span>{t.emoji}</span>{t.name}
              </button>
            ))}
          </div>
        )}
        <button style={{...S.fabMain, background: fabOpen ? '#2a3030' : '#3dba6f'}} onClick={() => setFabOpen(o => !o)}>
          {fabOpen ? '✕' : '✨'}
        </button>
      </div>

      {/* AI 모달 */}
      {aiModal && modalItemFull && (
        <AiModal item={modalItemFull} onClose={() => setAiModal(null)} />
      )}
    </div>
  );
}

const GRADE_COLOR = {
  g0: { color: '#607570' },
  g1: { color: '#F5B041' },
  g2: { color: '#7BC67E' },
  g3: { color: '#3dba6f' },
  g4: { color: '#FFD700', filter: 'drop-shadow(0 0 6px rgba(255,215,0,.6))' },
};

const S = {
  root: { fontFamily:"'Noto Sans KR',sans-serif", background:'#0f1110', color:'#e8ede8', minHeight:'100vh', WebkitFontSmoothing:'antialiased' },

  // 헤더
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

  // 메인
  main: { maxWidth:'920px', margin:'0 auto', padding:'32px 24px 100px' },

  // AI 패널
  aiPanel: { background:'#181c1a', border:'1px solid #2a3030', borderRadius:'14px', padding:'20px 22px', marginBottom:'32px' },
  aiPanelHead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'16px' },
  aiPanelTitle: { fontSize:'16px', fontWeight:700, color:'#e8ede8', display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' },
  aiPanelSub: { fontSize:'12.5px', color:'#607570' },
  aiCount: { background:'#232829', color:'#9aada6', border:'1px solid #2a3030', borderRadius:'6px', padding:'3px 10px', fontSize:'12px', fontWeight:600, flexShrink:0 },
  aiGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'10px' },
  aiCard: { background:'#1c2021', border:'1px solid #2a3030', borderRadius:'10px', padding:'14px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', transition:'border-color .2s, background .2s', textAlign:'left' },
  aiEmoji: { fontSize:'22px', flexShrink:0 },
  aiMeta: { display:'flex', flexDirection:'column', gap:'2px', minWidth:0 },
  aiName: { fontSize:'13px', fontWeight:600, color:'#e8ede8' },
  aiDesc: { fontSize:'11px', color:'#607570' },

  // 섹션
  secLabel: { fontSize:'13px', color:'#9aada6', margin:'28px 4px 14px', fontWeight:500 },

  // 배너
  banner: { background:'linear-gradient(135deg,#1e4a32,#0d3020)', border:'1px solid #3dba6f', borderRadius:'14px', padding:'24px', textAlign:'center', marginTop:'24px' },
  bannerTitle: { fontSize:'20px', fontWeight:700, color:'#3dba6f', marginBottom:'8px' },
  bannerSub: { fontSize:'13px', color:'#7acf9a', lineHeight:1.7 },

  // FAB
  fab: { position:'fixed', bottom:'28px', right:'24px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' },
  fabMenu: { display:'flex', flexDirection:'column', gap:'6px', alignItems:'flex-end' },
  fabItem: { background:'#181c1a', border:'1px solid #2a3030', borderRadius:'10px', padding:'9px 16px', fontSize:'13px', fontWeight:600, color:'#e8ede8', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', whiteSpace:'nowrap', boxShadow:'0 4px 16px rgba(0,0,0,.4)' },
  fabMain: { width:'52px', height:'52px', borderRadius:'50%', border:'none', fontSize:'22px', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,.5)', transition:'background .2s' },
};
