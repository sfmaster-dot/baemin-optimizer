import { signInWithGoogle } from '../lib/firebase';

export default function LoginScreen() {
  async function handleLogin() {
    try {
      await signInWithGoogle();
    } catch (err) {
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  }

  return (
    <div style={S.root}>
      <div style={S.container}>
        <div style={S.logoWrap}>
          <img src='/baemin-logo.png' alt='배민' style={S.logo} />
        </div>

        <h1 style={S.title}>배민 가게 최적화 체크리스트</h1>
        <p style={S.subtitle}>
          배달의민족 셀프서비스 <strong style={{color:'#3dba6f'}}>28개 필수 항목</strong>을<br/>
          빠뜨리지 않고 점검하고, AI로 문구까지 한 번에
        </p>

        <div style={S.features}>
          <Feature icon='✅' title='28개 항목 체크리스트' desc='가게관리·메뉴·할인·광고·리뷰까지 완전 정리' />
          <Feature icon='✨' title='AI 문구 생성 5종' desc='가게소개·공지·메뉴명·메뉴설명·리뷰답변' />
          <Feature icon='🏪' title='다점포 지원' desc='사업자별·매장별 분리 관리' />
          <Feature icon='💾' title='내 데이터 영구 저장' desc='구글 계정으로 언제든 이어서 작업' />
        </div>

        <button style={S.loginBtn} onClick={handleLogin}>
          <GoogleIcon />
          <span>Google 계정으로 시작하기</span>
        </button>

        <div style={S.footer}>
          by 단꿈 · <a href='https://danggum.net' target='_blank' rel='noreferrer' style={S.flink}>danggum.net</a>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div style={S.feat}>
      <div style={S.featIcon}>{icon}</div>
      <div>
        <div style={S.featTitle}>{title}</div>
        <div style={S.featDesc}>{desc}</div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 48 48'>
      <path fill='#FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/>
      <path fill='#FF3D00' d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/>
      <path fill='#4CAF50' d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/>
      <path fill='#1976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'/>
    </svg>
  );
}

const S = {
  root: { fontFamily:"'Noto Sans KR',sans-serif", background:'#0f1110', color:'#e8ede8', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' },
  container: { maxWidth:'480px', width:'100%', textAlign:'center' },

  // 흰 배경·테두리 제거 — 로고 이미지 자체 디자인 그대로 노출
  logoWrap: { display:'inline-block', width:'80px', height:'80px', borderRadius:'20px', boxShadow:'0 8px 32px rgba(61,186,111,.3)', marginBottom:'24px', overflow:'hidden' },
  logo: { width:'100%', height:'100%', objectFit:'contain', display:'block' },

  title: { fontSize:'26px', fontWeight:800, letterSpacing:'-0.5px', marginBottom:'14px', margin:0, lineHeight:1.3 },
  subtitle: { fontSize:'14px', color:'#9aada6', lineHeight:1.7, marginTop:'14px', marginBottom:'36px' },

  features: { display:'flex', flexDirection:'column', gap:'12px', marginBottom:'36px', textAlign:'left' },
  feat: { display:'flex', gap:'14px', alignItems:'flex-start', padding:'14px 16px', background:'#16191a', border:'1px solid #2a3030', borderRadius:'10px' },
  featIcon: { fontSize:'22px', flexShrink:0, width:'32px', textAlign:'center' },
  featTitle: { fontSize:'13.5px', fontWeight:700, color:'#e8ede8', marginBottom:'3px' },
  featDesc: { fontSize:'12px', color:'#607570', lineHeight:1.5 },

  loginBtn: { width:'100%', background:'#fff', color:'#202020', border:'none', borderRadius:'10px', padding:'14px', fontSize:'15px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', boxShadow:'0 4px 14px rgba(0,0,0,.2)', transition:'transform .15s, box-shadow .15s', fontFamily:'inherit' },

  footer: { fontSize:'11.5px', color:'#607570', marginTop:'28px' },
  flink: { color:'#3dba6f', textDecoration:'none' },
};
