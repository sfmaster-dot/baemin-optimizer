import { useState } from 'react';

const NOTICE_TYPES = ['이벤트', '임시휴무', '재료소진', '배달지연', '신메뉴출시'];

export default function AiModal({ item, onClose }) {
  const [form, setForm] = useState({
    category:'', mainMenu:'', feature:'', style:'',
    includes:'공기밥, 김치', allergy:'', spicy:'가능', peakTime:'20~30분',
    noticeType:'이벤트', noticeDetail:'',
    currentName:'', ingredient:'',
    menuName:'', taste:'', compose:'',
    storeName:'', review:'', rating:'5',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const type = item.aiType;
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  async function generate() {
    const required = {
      intro: ['category','mainMenu'],
      order: ['category','mainMenu'],
      notice: ['category','noticeDetail'],
      menuname: ['currentName','category'],
      menudesc: ['menuName','taste'],
      reply: ['storeName','review','rating'],
    }[type] || [];
    if (required.some(k => !form[k])) return alert('필수 항목(*)을 모두 입력해주세요.');
    setLoading(true); setResult('');
    try {
      const res = await fetch('/api/generate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ type, storeInfo: form }),
      });
      const data = await res.json();
      setResult(data.result || data.error || '오류가 발생했습니다.');
    } catch { setResult('서버 연결 오류가 발생했습니다.'); }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e=>e.stopPropagation()}>
        <div style={S.mhead}>
          <div>
            <div style={S.mtitle}>✨ {item.aiLabel}</div>
            <div style={S.msub}>가게 정보를 입력하면 AI가 문구를 생성해드립니다</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.mbody}>

          {/* 공통 업종/메뉴 — intro, order, notice */}
          {['intro','order','notice'].includes(type) && (
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 제육볶음 전문점, 치킨집" value={form.category} onChange={v=>set('category',v)} />
              <Field label="대표 메뉴 *" placeholder="예: 직화 제육볶음, 후라이드" value={form.mainMenu} onChange={v=>set('mainMenu',v)} />
            </div>
          )}

          {type==='intro' && <>
            <Field label="특징/차별점" placeholder="예: 직화 불맛, 15년 전통, 국내산 재료" value={form.feature} onChange={v=>set('feature',v)} />
            <Field label="운영 특이사항" placeholder="예: 1인분 주문 가능, 새벽 영업, 단체 주문 환영" value={form.style} onChange={v=>set('style',v)} />
          </>}

          {type==='order' && <>
            <div style={S.row}>
              <Field label="기본 제공 구성" placeholder="예: 공기밥, 김치, 수저" value={form.includes} onChange={v=>set('includes',v)} />
              <Field label="알레르기 유발 식재료" placeholder="예: 견과류, 갑각류 / 없으면 비워두세요" value={form.allergy} onChange={v=>set('allergy',v)} />
            </div>
            <div style={S.row}>
              <SelectField label="맵기 조절" value={form.spicy} onChange={v=>set('spicy',v)} options={['가능','불가능']} />
              <Field label="피크타임 조리 시간" placeholder="예: 20~30분" value={form.peakTime} onChange={v=>set('peakTime',v)} />
            </div>
          </>}

          {type==='notice' && <>
            <SelectField label="공지 유형" value={form.noticeType} onChange={v=>set('noticeType',v)} options={NOTICE_TYPES} />
            <Field label="세부 내용 *" placeholder="예: 5/20 휴무 / 치즈볼 재료 소진 / 2만원 이상 음료 무료" value={form.noticeDetail} onChange={v=>set('noticeDetail',v)} />
          </>}

          {type==='menuname' && <>
            <div style={S.row}>
              <Field label="현재 메뉴명 *" placeholder="예: 제육볶음" value={form.currentName} onChange={v=>set('currentName',v)} />
              <Field label="업종/음식 종류 *" placeholder="예: 한식, 볶음류" value={form.category} onChange={v=>set('category',v)} />
            </div>
            <div style={S.row}>
              <Field label="조리 방식·특징" placeholder="예: 직화, 수제, 당일 손질" value={form.feature} onChange={v=>set('feature',v)} />
              <Field label="주요 재료" placeholder="예: 국내산 돼지고기, 청양고추" value={form.ingredient} onChange={v=>set('ingredient',v)} />
            </div>
          </>}

          {type==='menudesc' && <>
            <Field label="메뉴명 *" placeholder="예: 직화 불향 제육볶음" value={form.menuName} onChange={v=>set('menuName',v)} />
            <Field label="맛·식감 *" placeholder="예: 불향 가득한 촉촉한 제육, 매콤달콤" value={form.taste} onChange={v=>set('taste',v)} />
            <Field label="구성·용량" placeholder="예: 공기밥 포함, 350g, 1~2인분" value={form.compose} onChange={v=>set('compose',v)} />
          </>}

          {type==='reply' && <>
            <Field label="가게명 *" placeholder="예: 영일이아구찜 창원점" value={form.storeName} onChange={v=>set('storeName',v)} />
            <Field label="고객 리뷰 *" placeholder="리뷰 본문을 붙여넣으세요" value={form.review} onChange={v=>set('review',v)} textarea />
            <SelectField label="별점 *" value={form.rating} onChange={v=>set('rating',v)} options={['1','2','3','4','5']} />
          </>}

          <button style={{...S.genBtn, opacity: loading?0.6:1}} onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '✨ 문구 생성하기'}
          </button>

          {result && (
            <div style={S.resultWrap}>
              <div style={S.resultLabel}>생성된 문구</div>
              <pre style={S.resultText}>{result}</pre>
              <div style={S.resultActions}>
                <button style={S.copyBtn} onClick={copy}>{copied?'✓ 복사됨':'복사하기'}</button>
                <button style={S.regenBtn} onClick={generate}>다시 생성</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({label, placeholder, value, onChange, textarea}) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      {textarea
        ? <textarea style={{...S.finput, height:'80px', resize:'vertical'}} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} />
        : <input style={S.finput} placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)} />
      }
    </div>
  );
}

function SelectField({label, value, onChange, options}) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <select style={S.finput} value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const S = {
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'16px'},
  modal:{background:'#181c1a',border:'1px solid #2a3030',borderRadius:'14px',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflow:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.6)'},
  mhead:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'20px 20px 16px',borderBottom:'1px solid #2a3030'},
  mtitle:{fontSize:'16px',fontWeight:700,color:'#e8ede8'},
  msub:{fontSize:'12px',color:'#607570',marginTop:'3px'},
  closeBtn:{background:'none',border:'none',color:'#607570',fontSize:'18px',cursor:'pointer',padding:'2px 6px'},
  mbody:{padding:'20px'},
  row:{display:'flex',gap:'12px'},
  field:{flex:1,marginBottom:'14px'},
  flabel:{display:'block',fontSize:'12px',fontWeight:600,color:'#9aada6',marginBottom:'6px'},
  finput:{width:'100%',background:'#0f1110',border:'1px solid #2a3030',borderRadius:'7px',padding:'9px 12px',fontSize:'13px',color:'#e8ede8',outline:'none',boxSizing:'border-box',fontFamily:'inherit'},
  genBtn:{width:'100%',background:'#3dba6f',border:'none',borderRadius:'8px',padding:'12px',fontSize:'14px',fontWeight:700,color:'#fff',cursor:'pointer',marginTop:'4px'},
  resultWrap:{marginTop:'16px',background:'#0f1110',border:'1px solid #2a3030',borderLeft:'3px solid #e8a020',borderRadius:'8px',padding:'14px'},
  resultLabel:{fontSize:'10px',fontWeight:700,color:'#e8a020',letterSpacing:'.07em',textTransform:'uppercase',marginBottom:'8px'},
  resultText:{fontSize:'13px',color:'#e8ede8',lineHeight:1.7,whiteSpace:'pre-wrap',margin:0,fontFamily:'inherit'},
  resultActions:{display:'flex',gap:'8px',marginTop:'12px'},
  copyBtn:{background:'#1e4a32',border:'1px solid #3dba6f',borderRadius:'6px',padding:'7px 14px',fontSize:'12px',fontWeight:600,color:'#3dba6f',cursor:'pointer'},
  regenBtn:{background:'none',border:'1px solid #2a3030',borderRadius:'6px',padding:'7px 14px',fontSize:'12px',color:'#9aada6',cursor:'pointer'},
};
