import { useState } from 'react';

const NOTICE_TYPES = ['이벤트', '임시휴무', '재료소진', '배달지연', '신메뉴출시'];

export default function AiModal({ item, onClose }) {
  const [form, setForm] = useState({
    category: '',
    mainMenu: '',
    feature: '',
    style: '',
    includes: '공기밥, 김치, 수저',
    allergy: '',
    spicy: '가능',
    peakTime: '20~30분',
    noticeType: '이벤트',
    noticeDetail: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const type = item.aiType;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function generate() {
    if (!form.category || !form.mainMenu) return alert('업종과 대표 메뉴를 입력해주세요.');
    setLoading(true);
    setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, storeInfo: form }),
      });
      const data = await res.json();
      setResult(data.result || data.error || '오류가 발생했습니다.');
    } catch {
      setResult('서버 연결 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div style={S.mhead}>
          <div>
            <div style={S.mtitle}>✨ {item.aiLabel}</div>
            <div style={S.msub}>가게 정보를 입력하면 AI가 문구를 생성해드립니다</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.mbody}>
          {/* 공통 입력 */}
          <div style={S.row}>
            <Field label="업종 *" placeholder="예: 제육볶음 전문점, 분식집, 치킨집" value={form.category} onChange={v => set('category', v)} />
            <Field label="대표 메뉴 *" placeholder="예: 제육볶음, 떡볶이, 후라이드치킨" value={form.mainMenu} onChange={v => set('mainMenu', v)} />
          </div>

          {type === 'intro' && <>
            <Field label="특징/차별점" placeholder="예: 직화 불맛, 국내산 재료만 사용, 15년 전통" value={form.feature} onChange={v => set('feature', v)} />
            <Field label="운영 특이사항" placeholder="예: 1인분 주문 가능, 단체 주문 환영, 새벽 영업" value={form.style} onChange={v => set('style', v)} />
          </>}

          {type === 'order' && <>
            <div style={S.row}>
              <Field label="기본 제공 구성" placeholder="예: 공기밥, 김치, 수저" value={form.includes} onChange={v => set('includes', v)} />
              <Field label="알레르기 유발 식재료" placeholder="예: 견과류, 갑각류 / 없으면 비워두세요" value={form.allergy} onChange={v => set('allergy', v)} />
            </div>
            <div style={S.row}>
              <SelectField label="맵기 조절" value={form.spicy} onChange={v => set('spicy', v)} options={['가능', '불가능']} />
              <Field label="피크타임 조리 시간" placeholder="예: 20~30분, 30~40분" value={form.peakTime} onChange={v => set('peakTime', v)} />
            </div>
          </>}

          {type === 'notice' && <>
            <SelectField label="공지 유형" value={form.noticeType} onChange={v => set('noticeType', v)} options={NOTICE_TYPES} />
            <Field label="세부 내용" placeholder="예: 5/20 휴무, 6/1부터 정상영업 / 치즈볼 재료 소진 / 2만원 이상 음료 무료" value={form.noticeDetail} onChange={v => set('noticeDetail', v)} />
          </>}

          {/* 생성 버튼 */}
          <button style={{ ...S.genBtn, opacity: loading ? 0.6 : 1 }} onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '✨ 문구 생성하기'}
          </button>

          {/* 결과 */}
          {result && (
            <div style={S.resultWrap}>
              <div style={S.resultLabel}>생성된 문구</div>
              <pre style={S.resultText}>{result}</pre>
              <div style={S.resultActions}>
                <button style={S.copyBtn} onClick={copy}>{copied ? '✓ 복사됨' : '복사하기'}</button>
                <button style={S.regenBtn} onClick={generate}>다시 생성</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <input style={S.finput} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <select style={S.fselect} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  },
  modal: {
    background: '#181c1a', border: '1px solid #2a3030',
    borderRadius: '14px', width: '100%', maxWidth: '560px',
    maxHeight: '90vh', overflow: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,.6)',
  },
  mhead: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: '20px 20px 16px', borderBottom: '1px solid #2a3030',
  },
  mtitle: { fontSize: '16px', fontWeight: 700, color: '#e8ede8' },
  msub: { fontSize: '12px', color: '#607570', marginTop: '3px' },
  closeBtn: {
    background: 'none', border: 'none', color: '#607570',
    fontSize: '18px', cursor: 'pointer', padding: '2px 6px',
  },
  mbody: { padding: '20px' },
  row: { display: 'flex', gap: '12px' },
  field: { flex: 1, marginBottom: '14px' },
  flabel: { display: 'block', fontSize: '12px', fontWeight: 600, color: '#9aada6', marginBottom: '6px' },
  finput: {
    width: '100%', background: '#0f1110', border: '1px solid #2a3030',
    borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#e8ede8',
    outline: 'none', boxSizing: 'border-box',
  },
  fselect: {
    width: '100%', background: '#0f1110', border: '1px solid #2a3030',
    borderRadius: '7px', padding: '9px 12px', fontSize: '13px', color: '#e8ede8',
    outline: 'none', boxSizing: 'border-box',
  },
  genBtn: {
    width: '100%', background: '#3dba6f', border: 'none',
    borderRadius: '8px', padding: '12px', fontSize: '14px',
    fontWeight: 700, color: '#fff', cursor: 'pointer', marginTop: '4px',
  },
  resultWrap: {
    marginTop: '16px', background: '#0f1110',
    border: '1px solid #2a3030', borderLeft: '3px solid #e8a020',
    borderRadius: '8px', padding: '14px',
  },
  resultLabel: { fontSize: '10px', fontWeight: 700, color: '#e8a020', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '8px' },
  resultText: {
    fontSize: '13px', color: '#e8ede8', lineHeight: 1.7,
    whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit',
  },
  resultActions: { display: 'flex', gap: '8px', marginTop: '12px' },
  copyBtn: {
    background: '#1e4a32', border: '1px solid #3dba6f', borderRadius: '6px',
    padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#3dba6f', cursor: 'pointer',
  },
  regenBtn: {
    background: 'none', border: '1px solid #2a3030', borderRadius: '6px',
    padding: '7px 14px', fontSize: '12px', color: '#9aada6', cursor: 'pointer',
  },
};
