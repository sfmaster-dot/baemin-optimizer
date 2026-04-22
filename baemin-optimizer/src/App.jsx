import { useState } from 'react';
import { CHECKLIST } from './data/checklist';
import CheckItem from './components/CheckItem';

export default function App() {
  const [checked, setChecked] = useState({});
  const total = CHECKLIST.length;
  const done = Object.keys(checked).length;
  const pct = Math.round((done / total) * 100);

  function toggle(id) {
    setChecked(c => {
      const n = { ...c };
      if (n[id]) delete n[id]; else n[id] = true;
      return n;
    });
  }

  return (
    <div style={S.root}>
      <div style={S.header}>
        <img src='/baemin-logo.png' alt='배민' style={S.logo} />
        <div style={S.htext}>
          <div style={S.htitle}>배민 가게정보 최적화 체크리스트</div>
          <div style={S.hsub}>배달의민족 셀프서비스 · 가게정보 설정</div>
        </div>
        <div style={S.hprog}>
          <div style={S.plabel}>완료 항목</div>
          <div style={S.pbarWrap}>
            <div style={{ ...S.pbarFill, width: pct + '%' }} />
          </div>
          <div style={S.pcount}>{done} / {total}</div>
        </div>
      </div>

      <div style={S.main}>
        <div style={S.slabel}>📋 가게정보 설정 — {total}개 항목</div>
        {CHECKLIST.map(item => (
          <CheckItem key={item.id} item={item} checked={!!checked[item.id]} onToggle={toggle} />
        ))}
        {done === total && (
          <div style={S.banner}>
            <div style={S.bannerTitle}>🎉 가게정보 설정 완료!</div>
            <div style={S.bannerSub}>9개 항목 확인 완료. 다음 단계 — 메뉴 최적화 체크리스트로 이어가세요.</div>
          </div>
        )}
      </div>
    </div>
  );
}

const S = {
  root: { fontFamily:"'Noto Sans KR',sans-serif", background:'#0f1110', color:'#e8ede8', minHeight:'100vh', WebkitFontSmoothing:'antialiased' },
  header: { background:'#181c1a', borderBottom:'1px solid #2a3030', padding:'18px 24px', display:'flex', alignItems:'center', gap:'14px', position:'sticky', top:0, zIndex:50 },
  logo: { width:'36px', height:'36px', flexShrink:0, borderRadius:'8px', objectFit:'cover' },
  htext: { flex:1 },
  htitle: { fontSize:'16px', fontWeight:700 },
  hsub: { fontSize:'11px', color:'#607570', marginTop:'2px' },
  hprog: { textAlign:'right', flexShrink:0 },
  plabel: { fontSize:'11px', color:'#607570', marginBottom:'4px' },
  pbarWrap: { width:'110px', height:'5px', background:'#2a3030', borderRadius:'3px', overflow:'hidden' },
  pbarFill: { height:'100%', background:'#3dba6f', borderRadius:'3px', transition:'width .4s' },
  pcount: { fontSize:'12px', fontWeight:700, color:'#3dba6f', marginTop:'4px' },
  main: { maxWidth:'720px', margin:'0 auto', padding:'28px 20px 80px' },
  slabel: { fontSize:'11px', fontWeight:700, letterSpacing:'.08em', color:'#607570', textTransform:'uppercase', marginBottom:'12px' },
  banner: { background:'linear-gradient(135deg,#1e4a32,#0d3020)', border:'1px solid #3dba6f', borderRadius:'10px', padding:'20px 24px', textAlign:'center', marginTop:'16px' },
  bannerTitle: { fontSize:'17px', fontWeight:700, color:'#3dba6f', marginBottom:'6px' },
  bannerSub: { fontSize:'13px', color:'#7acf9a', lineHeight:1.6 },
};
