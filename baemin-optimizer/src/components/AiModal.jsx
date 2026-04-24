import { useState } from 'react';

// ── 업종 프리셋 데이터 ──────────────────────────────
const PRESETS = {
  chicken: {
    label: '🍗 치킨',
    intro: { category:'치킨 전문점', mainMenu:'후라이드, 양념치킨, 반반', feature:'당일 도계, 국내산 닭만 사용', style:'1인 반마리 가능' },
    order: { category:'치킨', mainMenu:'후라이드, 양념', includes:'치킨무, 소스', allergy:'없음', spicy:'가능', peakTime:'20~30분' },
    notice: { category:'치킨 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 치즈볼 4개 증정' },
    menuname: { currentName:'후라이드치킨', category:'치킨', feature:'당일 도계, 국내산', ingredient:'국내산 닭, 직접 배합 튀김가루' },
    menudesc: { menuName:'반반치킨', taste:'바삭하고 촉촉한, 달콤매콤', compose:'한마리 / 치킨무·음료 포함' },
    reply: { storeName:'치킨 가게', review:'', rating:'5' },
  },
  chinese: {
    label: '🥡 중식',
    intro: { category:'중식 전문점', mainMenu:'짜장면, 짬뽕, 탕수육', feature:'수타 면발, 직접 내린 육수', style:'' },
    order: { category:'중식', mainMenu:'짜장면, 짬뽕', includes:'단무지, 양파', allergy:'없음', spicy:'가능', peakTime:'20~25분' },
    notice: { category:'중국집', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 군만두 4개 증정' },
    menuname: { currentName:'짬뽕', category:'중식', feature:'수타 면발, 불맛', ingredient:'해물, 수타면, 직접 낸 육수' },
    menudesc: { menuName:'해물짬뽕', taste:'얼큰하고 시원한, 불향 가득', compose:'1인분 / 단무지·양파 포함' },
    reply: { storeName:'중국집', review:'', rating:'5' },
  },
  donkatsu: {
    label: '🍱 돈까스·회·일식',
    intro: { category:'돈까스·일식 전문점', mainMenu:'등심돈까스, 모둠회, 초밥', feature:'수제 빵가루, 당일 입고 활어', style:'' },
    order: { category:'돈까스·일식', mainMenu:'등심돈까스', includes:'밥, 된장국, 양배추', allergy:'갑각류', spicy:'불가능', peakTime:'15~20분' },
    notice: { category:'돈까스·일식', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 계란 장조림 증정' },
    menuname: { currentName:'돈까스', category:'돈까스·일식', feature:'수제 빵가루, 국내산 돼지', ingredient:'국내산 등심, 수제 빵가루' },
    menudesc: { menuName:'등심돈까스', taste:'바삭하고 육즙 가득한', compose:'1인분 / 밥·된장국·양배추 포함' },
    reply: { storeName:'돈까스 가게', review:'', rating:'5' },
  },
  pizza: {
    label: '🍕 피자',
    intro: { category:'피자 전문점', mainMenu:'페퍼로니, 고르곤졸라, 불고기피자', feature:'화덕 구이, 당일 반죽 수제 도우', style:'' },
    order: { category:'피자', mainMenu:'페퍼로니피자', includes:'피클, 소스', allergy:'없음', spicy:'불가능', peakTime:'20~25분' },
    notice: { category:'피자 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 콜라 1.25L 증정' },
    menuname: { currentName:'페퍼로니피자', category:'피자', feature:'화덕 구이, 수제 도우', ingredient:'자연치즈, 수제 도우' },
    menudesc: { menuName:'페퍼로니피자 L', taste:'치즈 쭉 늘어나는, 짭조름한', compose:'Large 31cm / 3~4인분' },
    reply: { storeName:'피자 가게', review:'', rating:'5' },
  },
  fastfood: {
    label: '🍔 패스트푸드',
    intro: { category:'수제버거·패스트푸드', mainMenu:'치즈버거, 베이컨버거, 감자튀김', feature:'100% 수제 패티, 당일 반죽 번', style:'빠른 조리, 1인 세트 가능' },
    order: { category:'버거·패스트푸드', mainMenu:'시그니처 치즈버거', includes:'감자튀김, 소스', allergy:'없음', spicy:'가능', peakTime:'15~20분' },
    notice: { category:'수제버거', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 감자튀김 무료 추가' },
    menuname: { currentName:'치즈버거', category:'버거·패스트푸드', feature:'수제 패티, 직접 반죽 번', ingredient:'국내산 소고기 패티, 수제 번' },
    menudesc: { menuName:'시그니처 치즈버거', taste:'육즙 가득한, 진한 치즈맛', compose:'1인분 / 감튀·콜라 포함' },
    reply: { storeName:'버거 가게', review:'', rating:'5' },
  },
  jjim: {
    label: '🍲 찜·탕·찌개',
    intro: { category:'찜·탕 전문', mainMenu:'갈비찜, 감자탕, 아구찜', feature:'당일 끓이는 진한 육수, 국내산 재료', style:'' },
    order: { category:'찜·탕', mainMenu:'갈비찜', includes:'공기밥, 김치', allergy:'없음', spicy:'가능', peakTime:'25~35분' },
    notice: { category:'찜·탕 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 공깃밥 추가 증정' },
    menuname: { currentName:'갈비찜', category:'찜·탕', feature:'당일 끓임, 국내산', ingredient:'국내산 갈비, 당근, 밤, 비법 양념' },
    menudesc: { menuName:'갈비찜 2~3인분', taste:'달콤짭짤한, 살이 살살 녹는', compose:'2~3인분 / 공깃밥 2개·김치 포함' },
    reply: { storeName:'찜 가게', review:'', rating:'5' },
  },
  jokbal: {
    label: '🍖 족발·보쌈',
    intro: { category:'족발·보쌈 전문', mainMenu:'앞다리족발, 보쌈, 막국수', feature:'매일 삶는 당일 족발, 국내산 돼지', style:'' },
    order: { category:'족발', mainMenu:'앞다리족발', includes:'쌈채소, 마늘, 새우젓', allergy:'없음', spicy:'가능', peakTime:'20~30분' },
    notice: { category:'족발 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 막국수 1인분 증정' },
    menuname: { currentName:'족발', category:'족발·보쌈', feature:'당일 삶기, 국내산 돼지', ingredient:'국내산 앞다리, 비법 양념' },
    menudesc: { menuName:'앞다리족발 中', taste:'쫄깃하고 담백한, 잡내 없는', compose:'중자 700g / 쌈채소·마늘·새우젓 포함' },
    reply: { storeName:'족발 가게', review:'', rating:'5' },
  },
  bunsik: {
    label: '🥟 분식',
    intro: { category:'분식 전문점', mainMenu:'떡볶이, 김밥, 순대', feature:'매일 아침 김밥 말기, 국내산 쌀', style:'1인 세트 다양' },
    order: { category:'분식', mainMenu:'떡볶이, 김밥', includes:'국물', allergy:'없음', spicy:'가능', peakTime:'15~20분' },
    notice: { category:'분식 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 순대 1인분 증정' },
    menuname: { currentName:'떡볶이', category:'분식', feature:'멸치 육수, 고추장 양념', ingredient:'국내산 쌀떡, 어묵, 계란' },
    menudesc: { menuName:'떡볶이', taste:'달콤매콤한, 쫄깃한', compose:'2인분 700g / 어묵·계란 포함' },
    reply: { storeName:'분식 가게', review:'', rating:'5' },
  },
  cafe: {
    label: '☕ 카페·디저트',
    intro: { category:'카페·디저트', mainMenu:'아메리카노, 라떼, 케이크', feature:'직접 로스팅 원두, 당일 제조 디저트', style:'' },
    order: { category:'카페', mainMenu:'라떼, 아메리카노', includes:'없음', allergy:'유제품(라떼류)', spicy:'불가능', peakTime:'10~15분' },
    notice: { category:'카페', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 쿠키 1개 증정' },
    menuname: { currentName:'라떼', category:'카페·디저트', feature:'직접 로스팅, 스페셜티', ingredient:'직접 로스팅 원두, 신선 우유' },
    menudesc: { menuName:'시그니처 라떼', taste:'부드럽고 고소한, 풍부한 크레마', compose:'Regular 355ml / Hot·Ice 선택' },
    reply: { storeName:'카페', review:'', rating:'5' },
  },
  korean: {
    label: '🍚 한식',
    intro: { category:'한식 전문점', mainMenu:'제육볶음, 김치찌개, 비빔밥', feature:'직접 담근 김치, 당일 조리', style:'1인분 주문 가능' },
    order: { category:'한식', mainMenu:'제육볶음', includes:'공기밥, 국, 김치, 반찬', allergy:'없음', spicy:'가능', peakTime:'20~30분' },
    notice: { category:'한식 전문점', noticeType:'임시휴무', noticeDetail:'매주 일요일 정기 휴무입니다' },
    menuname: { currentName:'제육볶음', category:'한식', feature:'직화, 국내산 돼지', ingredient:'국내산 돼지고기, 직접 담근 김치' },
    menudesc: { menuName:'제육볶음', taste:'불향 가득한, 매콤달콤한', compose:'1인분 / 공깃밥·국·김치 포함' },
    reply: { storeName:'한식 가게', review:'', rating:'5' },
  },
  gogi: {
    label: '🥩 고기·구이',
    intro: { category:'고기구이 전문', mainMenu:'삼겹살, 목살, 갈비', feature:'저온 숙성 냉장육, 직접 구워 배달', style:'' },
    order: { category:'고기구이', mainMenu:'삼겹살', includes:'쌈채소, 된장, 마늘', allergy:'없음', spicy:'불가능', peakTime:'20~30분' },
    notice: { category:'삼겹살 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 된장찌개 증정' },
    menuname: { currentName:'삼겹살', category:'고기구이', feature:'저온 숙성, 직화 구이', ingredient:'국내산 냉장 삼겹살' },
    menudesc: { menuName:'숙성 삼겹살 300g', taste:'쫀득하고 고소한, 육즙 가득', compose:'300g / 쌈채소·된장·마늘 포함' },
    reply: { storeName:'삼겹살 가게', review:'', rating:'5' },
  },
  western: {
    label: '🍝 양식',
    intro: { category:'양식·파스타 전문', mainMenu:'크림파스타, 토마토파스타, 스테이크', feature:'생면 사용, 수제 소스', style:'' },
    order: { category:'파스타·양식', mainMenu:'크림파스타', includes:'빵, 피클', allergy:'견과류', spicy:'불가능', peakTime:'15~20분' },
    notice: { category:'양식 레스토랑', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 갈릭브레드 증정' },
    menuname: { currentName:'크림파스타', category:'양식', feature:'생면, 수제 소스', ingredient:'생면, 직접 만든 크림 소스' },
    menudesc: { menuName:'트러플크림파스타', taste:'진하고 고소한, 향 가득한', compose:'1인분 / 빵·피클 포함' },
    reply: { storeName:'파스타 가게', review:'', rating:'5' },
  },
  asian: {
    label: '🍜 아시안·분식',
    intro: { category:'쌀국수·아시안 전문', mainMenu:'쌀국수, 팟타이, 분짜', feature:'12시간 우려낸 육수, 현지 재료 사용', style:'' },
    order: { category:'아시안', mainMenu:'소고기 쌀국수', includes:'숙주, 라임, 소스', allergy:'없음', spicy:'가능', peakTime:'15~20분' },
    notice: { category:'아시안 음식점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 짜조 2개 증정' },
    menuname: { currentName:'쌀국수', category:'아시안', feature:'12시간 육수, 현지 재료', ingredient:'사골 육수, 현지 향신료' },
    menudesc: { menuName:'소고기 쌀국수', taste:'시원하고 진한, 담백한', compose:'1인분 / 숙주·라임·고수 포함' },
    reply: { storeName:'아시안 가게', review:'', rating:'5' },
  },
  jokjang: {
    label: '🍻 야식·안주',
    intro: { category:'야식·안주 전문', mainMenu:'닭발, 곱창, 막창, 먹태', feature:'매일 손질 국내산, 심야 운영', style:'새벽까지 영업' },
    order: { category:'야식·안주', mainMenu:'국물닭발', includes:'주먹밥, 계란찜', allergy:'없음', spicy:'가능', peakTime:'20~30분' },
    notice: { category:'야식 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 먹태 1봉 증정' },
    menuname: { currentName:'닭발', category:'야식·안주', feature:'매일 손질, 국내산', ingredient:'국내산 닭발, 비법 양념' },
    menudesc: { menuName:'국물닭발', taste:'화끈하게 매운, 쫄깃한', compose:'2인분 / 주먹밥·계란찜 포함' },
    reply: { storeName:'야식 가게', review:'', rating:'5' },
  },
  dosirak: {
    label: '🍙 도시락·죽·간편식',
    intro: { category:'도시락 전문', mainMenu:'제육도시락, 불고기도시락, 돈까스도시락', feature:'당일 조리, 균형 잡힌 구성', style:'1인분 합리적 가격' },
    order: { category:'도시락', mainMenu:'제육도시락', includes:'밥, 반찬3종, 국', allergy:'없음', spicy:'가능', peakTime:'15~20분' },
    notice: { category:'도시락 전문점', noticeType:'이벤트', noticeDetail:'리뷰 작성 시 계란후라이 추가 증정' },
    menuname: { currentName:'제육도시락', category:'도시락', feature:'당일 조리, 균형 구성', ingredient:'국내산 돼지, 직접 담근 김치' },
    menudesc: { menuName:'제육도시락', taste:'매콤달콤한, 푸짐한', compose:'1인분 550g / 밥·반찬3종·국 포함' },
    reply: { storeName:'도시락 가게', review:'', rating:'5' },
  },
};
const NOTICE_TYPES = ['이벤트', '임시휴무', '재료소진', '배달지연', '신메뉴출시'];

const DEFAULT_FORM = {
  category:'', mainMenu:'', feature:'', style:'',
  includes:'공기밥, 김치', allergy:'', spicy:'가능', peakTime:'20~30분',
  noticeType:'이벤트', noticeDetail:'',
  currentName:'', ingredient:'',
  menuName:'', taste:'', compose:'',
  storeName:'', review:'', rating:'5',
};

export default function AiModal({ item, onClose }) {
  const [form, setForm]       = useState({ ...DEFAULT_FORM });
  const [preset, setPreset]   = useState('');
  const [result, setResult]   = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const type = item.aiType;
  const set  = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function applyPreset(key) {
    setPreset(key);
    if (!key) return;
    const p = PRESETS[key]?.[type];
    if (p) setForm(f => ({ ...f, ...p }));
  }

  function reroll() {
    if (!preset) { alert('먼저 업종을 선택해주세요.'); return; }
    const p = PRESETS[preset]?.[type];
    if (p) setForm(f => ({ ...f, ...p }));
  }

  async function generate() {
    const required = {
      intro:    ['category','mainMenu'],
      order:    ['category','mainMenu'],
      notice:   ['category','noticeDetail'],
      menuname: ['currentName','category'],
      menudesc: ['menuName','taste'],
      reply:    ['storeName','review','rating'],
    }[type] || [];
    if (required.some(k => !form[k])) { alert('필수 항목(*)을 모두 입력해주세요.'); return; }
    setLoading(true); setResult('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, storeInfo: form }),
      });
      const data = await res.json();
      setResult(data.result || data.error || '오류가 발생했습니다.');
    } catch { setResult('서버 연결 오류가 발생했습니다.'); }
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(result);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  const showPreset = ['intro','order','notice','menuname','menudesc'].includes(type);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.mhead}>
          <div>
            <div style={S.mtitle}>✨ {item.aiLabel}</div>
            <div style={S.msub}>가게 정보를 입력하면 AI가 문구를 생성해드립니다</div>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.mbody}>

          {/* 업종 프리셋 */}
          {showPreset && (
            <div style={S.presetWrap}>
              <label style={S.presetLabel}>⚡ 업종 프리셋 <span style={{color:'#607570',fontWeight:400}}>(선택 시 자동 채움 · 매번 랜덤 조합)</span></label>
              <div style={S.presetRow}>
                <select style={S.presetSel} value={preset} onChange={e => applyPreset(e.target.value)}>
                  <option value=''>직접 입력</option>
                  {Object.entries(PRESETS).map(([k,v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <button style={S.rerollBtn} onClick={reroll} title='다른 조합으로 다시 채우기'>🎲</button>
              </div>
            </div>
          )}

          {/* intro */}
          {type==='intro' && <>
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 제육볶음 전문점, 치킨집" value={form.category} onChange={v=>set('category',v)} />
              <Field label="대표 메뉴 *" placeholder="예: 직화 제육볶음, 후라이드" value={form.mainMenu} onChange={v=>set('mainMenu',v)} />
            </div>
            <Field label="특징/차별점" placeholder="예: 직화 불맛, 15년 전통, 국내산 재료" value={form.feature} onChange={v=>set('feature',v)} />
            <Field label="운영 특이사항" placeholder="예: 1인분 주문 가능, 새벽 영업, 단체 주문 환영" value={form.style} onChange={v=>set('style',v)} />
          </>}

          {/* order */}
          {type==='order' && <>
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 한식, 치킨, 분식" value={form.category} onChange={v=>set('category',v)} />
              <Field label="대표 메뉴 *" placeholder="예: 제육볶음, 후라이드" value={form.mainMenu} onChange={v=>set('mainMenu',v)} />
            </div>
            <div style={S.row}>
              <Field label="기본 제공 구성" placeholder="예: 공기밥, 김치, 수저" value={form.includes} onChange={v=>set('includes',v)} />
              <Field label="알레르기 유발 식재료" placeholder="예: 견과류, 갑각류" value={form.allergy} onChange={v=>set('allergy',v)} />
            </div>
            <div style={S.row}>
              <SelectField label="맵기 조절" value={form.spicy} onChange={v=>set('spicy',v)} options={['가능','불가능']} />
              <Field label="피크타임 조리 시간" placeholder="예: 20~30분" value={form.peakTime} onChange={v=>set('peakTime',v)} />
            </div>
          </>}

          {/* notice */}
          {type==='notice' && <>
            <div style={S.row}>
              <Field label="업종 *" placeholder="예: 제육볶음 전문점" value={form.category} onChange={v=>set('category',v)} />
              <SelectField label="공지 유형" value={form.noticeType} onChange={v=>set('noticeType',v)} options={NOTICE_TYPES} />
            </div>
            <Field label="세부 내용 *" placeholder="예: 5/20 휴무 / 치즈볼 재료 소진 / 2만원 이상 음료 무료" value={form.noticeDetail} onChange={v=>set('noticeDetail',v)} textarea />
          </>}

          {/* menuname */}
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

          {/* menudesc */}
          {type==='menudesc' && <>
            <Field label="메뉴명 *" placeholder="예: 직화 불향 제육볶음" value={form.menuName} onChange={v=>set('menuName',v)} />
            <Field label="맛·식감 *" placeholder="예: 불향 가득한 촉촉한 제육, 매콤달콤" value={form.taste} onChange={v=>set('taste',v)} />
            <Field label="구성·용량" placeholder="예: 공기밥 포함, 350g, 1~2인분" value={form.compose} onChange={v=>set('compose',v)} />
          </>}

          {/* reply */}
          {type==='reply' && <>
            <Field label="가게명 *" placeholder="예: 영일이아구찜 창원점" value={form.storeName} onChange={v=>set('storeName',v)} />
            <Field label="고객 리뷰 *" placeholder="리뷰 본문을 붙여넣으세요" value={form.review} onChange={v=>set('review',v)} textarea />
            <SelectField label="별점 *" value={form.rating} onChange={v=>set('rating',v)} options={['1','2','3','4','5']} />
          </>}

          <button style={{ ...S.genBtn, opacity: loading ? 0.6 : 1 }} onClick={generate} disabled={loading}>
            {loading ? '생성 중...' : '✨ 문구 생성하기'}
          </button>

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

function Field({ label, placeholder, value, onChange, textarea }) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      {textarea
        ? <textarea style={{ ...S.finput, height:'80px', resize:'vertical' }} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
        : <input style={S.finput} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <select style={S.finput} value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

const S = {
  overlay: { position:'fixed', inset:0, background:'rgba(0,0,0,.78)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'16px' },
  modal: { background:'#16191a', border:'1px solid #2a2f30', borderRadius:'14px', width:'100%', maxWidth:'580px', maxHeight:'90vh', overflow:'auto', boxShadow:'0 24px 64px rgba(0,0,0,.6)' },
  mhead: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 20px 16px', borderBottom:'1px solid #2a2f30' },
  mtitle: { fontSize:'16px', fontWeight:700, color:'#e8ede8' },
  msub: { fontSize:'12px', color:'#607570', marginTop:'3px' },
  closeBtn: { background:'none', border:'none', color:'#607570', fontSize:'18px', cursor:'pointer', padding:'2px 6px' },
  mbody: { padding:'20px' },

  presetWrap: { marginBottom:'18px' },
  presetLabel: { display:'block', fontSize:'12px', fontWeight:700, color:'#e8a020', marginBottom:'8px' },
  presetRow: { display:'flex', gap:'8px' },
  presetSel: { flex:1, background:'#0d0f10', border:'1px solid #3dba6f', borderRadius:'8px', padding:'9px 12px', fontSize:'13px', color:'#e8ede8', outline:'none', cursor:'pointer' },
  rerollBtn: { width:'40px', height:'40px', background:'#1c2021', border:'1px solid #2a2f30', borderRadius:'8px', fontSize:'18px', cursor:'pointer', flexShrink:0 },

  row: { display:'flex', gap:'12px' },
  field: { flex:1, marginBottom:'14px' },
  flabel: { display:'block', fontSize:'12px', fontWeight:600, color:'#9aada6', marginBottom:'6px' },
  finput: { width:'100%', background:'#0d0f10', border:'1px solid #2a2f30', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', color:'#e8ede8', outline:'none', boxSizing:'border-box', fontFamily:'inherit' },

  genBtn: { width:'100%', background:'#3dba6f', border:'none', borderRadius:'8px', padding:'12px', fontSize:'14px', fontWeight:700, color:'#fff', cursor:'pointer', marginTop:'4px' },
  resultWrap: { marginTop:'16px', background:'#0d0f10', border:'1px solid #2a2f30', borderLeft:'3px solid #e8a020', borderRadius:'8px', padding:'14px' },
  resultLabel: { fontSize:'10px', fontWeight:700, color:'#e8a020', letterSpacing:'.07em', textTransform:'uppercase', marginBottom:'8px' },
  resultText: { fontSize:'13px', color:'#e8ede8', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0, fontFamily:'inherit' },
  resultActions: { display:'flex', gap:'8px', marginTop:'12px' },
  copyBtn: { background:'#1e4a32', border:'1px solid #3dba6f', borderRadius:'6px', padding:'7px 14px', fontSize:'12px', fontWeight:600, color:'#3dba6f', cursor:'pointer' },
  regenBtn: { background:'none', border:'1px solid #2a2f30', borderRadius:'6px', padding:'7px 14px', fontSize:'12px', color:'#9aada6', cursor:'pointer' },
};
