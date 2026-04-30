import { useState, useEffect, useRef } from 'react';
import {
  PLATFORMS,
  getSections,
  getChecklist,
  getTotalCount,
} from './data/checklist';
import CheckItem from './components/CheckItem';
import AiModal from './components/AiModal';
import LoginScreen from './components/LoginScreen';
import StoreAddModal from './components/StoreAddModal';
import StoreEditModal from './components/StoreEditModal';
import StoreSwitcher from './components/StoreSwitcher';
import { onAuthChange, logout } from './lib/firebase';
import {
  loadStore,
  saveStoreChecklist,
  updateStore,
  deleteStore as deleteStoreDoc,
} from './lib/stores';
import { useStores } from './hooks/useStores';

// AI 도구 — FAB 메뉴에서 사용 (상단 패널 제거됨, FAB 단일 진입점)
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

// (토스트 제거됨 — 단꿈 앱 행동으로 오해 가능)

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileMenu, setProfileMenu] = useState(false);

  const {
    stores,
    activeStoreId,
    activeStore,
    loading: storesLoading,
    switchStore,
    addStore,
    refresh: refreshStores,
    patchLocalStore,
  } = useStores(user);

  // 플랫폼 state — localStorage 마지막 본 플랫폼 기억
  const [currentPlatform, setCurrentPlatform] = useState(() => {
    if (typeof window === 'undefined') return 'baemin';
    const saved = localStorage.getItem('dgm_platform');
    return PLATFORMS.find(p => p.id === saved) ? saved : 'baemin';
  });

  // checked 구조: { baemin: {1:true,2:true}, coupang: {1:true} }
  const [checked, setChecked] = useState({ baemin: {}, coupang: {} });
  const [storeDataLoaded, setStoreDataLoaded] = useState(false);

  const [aiModal, setAiModal] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  // 섹션 인트로 토글 — 기본 접힘, 섹션·플랫폼 변경 시 자동 초기화
  const [introOpen, setIntroOpen] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const saveTimerRef = useRef(null);
  const prevStoreIdRef = useRef(null);

  // 플랫폼 변경 시: localStorage 저장 + activeTab 리셋 + intro 접힘
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dgm_platform', currentPlatform);
    }
    setActiveTab(1);
    setIntroOpen(false);
  }, [currentPlatform]);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setChecked({ baemin: {}, coupang: {} });
        setStoreDataLoaded(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user || !activeStoreId) {
      setChecked({ baemin: {}, coupang: {} });
      setStoreDataLoaded(false);
      prevStoreIdRef.current = null;
      return;
    }

    if (prevStoreIdRef.current === activeStoreId) return;

    let cancelled = false;
    setStoreDataLoaded(false);

    (async () => {
      const data = await loadStore(user.uid, activeStoreId);
      if (cancelled) return;
      // 새 구조: checklists 맵 필드 / 신규 사용자 기준 fallback
      setChecked(data?.checklists || { baemin: {}, coupang: {} });
      prevStoreIdRef.current = activeStoreId;
      setStoreDataLoaded(true);
    })();

    return () => { cancelled = true; };
  }, [user, activeStoreId]);

  useEffect(() => {
    if (!user || !activeStoreId || !storeDataLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      // checked = { baemin: {...}, coupang: {...} } 구조 그대로 저장
      saveStoreChecklist(user.uid, activeStoreId, checked);
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [checked, user, activeStoreId, storeDataLoaded]);

  // 섹션 변경 시 인트로 자동 접힘
  useEffect(() => {
    setIntroOpen(false);
  }, [activeTab]);

  // 현재 플랫폼 데이터
  const sections = getSections(currentPlatform);
  const checklist = getChecklist(currentPlatform);
  const platformChecked = checked[currentPlatform] || {};
  const currentPlatformObj = PLATFORMS.find(p => p.id === currentPlatform) || PLATFORMS[0];

  const total = checklist.length;
  const done = Object.keys(platformChecked).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const grade = getGrade(pct);

  function toggle(id) {
    setChecked(c => {
      const cur = { ...(c[currentPlatform] || {}) };
      if (cur[id]) delete cur[id];
      else cur[id] = true;
      return { ...c, [currentPlatform]: cur };
    });
  }

  function openAi(type) { setAiModal(type); setFabOpen(false); }

  const modalItem = aiModal
    ? (() => { const t = AI_TOOLS.find(x => x.type === aiModal); return t ? { aiType: t.type, aiLabel: t.name } : null; })()
    : null;

  const activeItems = checklist.filter(i => i.section === activeTab);
  const activeSection = sections.find(s => s.id === activeTab);

  async function handleAddStore(input) {
    const storeId = await addStore(input);
    if (storeId) {
      setShowAddModal(false);
    }
    return storeId;
  }

  async function handleEditStore(storeId, patch) {
    const ok = await updateStore(user.uid, storeId, patch);
    if (ok) {
      patchLocalStore(storeId, patch);
    }
    return ok;
  }

  async function handleDeleteStore(storeId) {
    const ok = await deleteStoreDoc(user.uid, storeId);
    if (ok) {
      await refreshStores();
      prevStoreIdRef.current = null;
    }
    return ok;
  }

  if (authLoading) {
    return (
      <div style={S.loader}>
        <div style={S.spinner} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (storesLoading) {
    return (
      <div style={S.loader}>
        <div style={S.spinner} />
      </div>
    );
  }

  // 매장이 하나도 없는 경우 — 강제 추가 모달
  if (stores.length === 0) {
    return (
      <>
        <div style={S.loader}>
          <div style={S.firstWelcome}>
            <img src='/baemin-logo.png' alt='' style={S.welcomeLogo} />
            <div style={S.welcomeTitle}>환영합니다 {user.displayName?.split(' ')[0] || ''} 사장님</div>
            <div style={S.welcomeSub}>첫 매장을 등록하고 체크리스트를 시작하세요</div>
          </div>
        </div>
        <StoreAddModal
          forceFirst
          onSubmit={handleAddStore}
          existingStores={stores}
        />
      </>
    );
  }

  return (
    <div style={S.root}>
      <header className="appHeader" style={S.header}>
        <div className="appHeaderLogo" style={S.logo}>
          <img
            src={currentPlatformObj.logo}
            alt={currentPlatformObj.short}
            style={S.logoImg}
          />
        </div>

        <div style={S.htext}>
          <div className="appHeaderRow1" style={S.hrow1}>
            <StoreSwitcher
              stores={stores}
              activeStoreId={activeStoreId}
              onSwitch={switchStore}
              onAddClick={() => setShowAddModal(true)}
              onEditClick={() => setShowEditModal(true)}
            />
          </div>
          <div className="appHeaderSub" style={S.hsub}>
            {/* 플랫폼 토글 탭 — 한 클릭 전환 */}
            <div style={S.platformTabs}>
              {PLATFORMS.map(p => {
                const isActive = currentPlatform === p.id;
                const pDone = Object.keys(checked[p.id] || {}).length;
                const pTotal = getTotalCount(p.id);
                return (
                  <button
                    key={p.id}
                    className="platformTab"
                    onClick={() => setCurrentPlatform(p.id)}
                    style={{
                      ...S.platformTab,
                      ...(isActive ? {
                        background: `${p.color}20`,
                        color: p.color,
                        borderColor: `${p.color}66`,
                        fontWeight: 700,
                      } : {}),
                    }}
                  >
                    {p.label}
                    <span style={S.platformCount}>{pDone}/{pTotal}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="appHeaderRight" style={S.hright}>
          <div className="appHeaderProg" style={S.hprog}>
            <div className="appHeaderProgLabel" style={S.plabel}>완료 · <span style={{ ...S.grade, ...GRADE_COLOR[grade.cls] }}>{grade.label}</span></div>
            <div className="appHeaderProgBar" style={S.pbarWrap}>
              <div style={{
                ...S.pbarFill,
                width: pct + '%',
                background: `linear-gradient(90deg, ${currentPlatformObj.color}, ${currentPlatformObj.color}dd)`,
              }} />
            </div>
            <div style={S.pcount}>
              <span style={{ color: currentPlatformObj.color, fontWeight: 700 }}>{done}</span>
              <span style={{ color: '#607570', fontWeight: 500 }}> / {total}</span>
              <span className="appHeaderBadge" style={S.badgeInline}>✓ 공식 2026.05</span>
            </div>
          </div>

          <div style={S.profileWrap}>
            <button className="appProfileBtn" style={S.profileBtn} onClick={() => setProfileMenu(o => !o)} title={user.displayName}>
              {user.photoURL
                ? <img src={user.photoURL} alt='' style={S.profileImg} referrerPolicy='no-referrer' />
                : <div style={S.profileFallback}>{(user.displayName || user.email)[0]}</div>
              }
            </button>
            {profileMenu && (
              <>
                <div style={S.profileBackdrop} onClick={() => setProfileMenu(false)} />
                <div style={S.profileMenu}>
                  <div style={S.profileInfo}>
                    <div style={S.profileName}>{user.displayName || '사용자'}</div>
                    <div style={S.profileEmail}>{user.email}</div>
                  </div>
                  <div style={S.profileDiv} />
                  <button style={S.profileItem} onClick={() => { logout(); setProfileMenu(false); }}>
                    <span>↗</span> 로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={S.main}>
        {/* 상단 AI 패널 제거 — AI 도구는 우측 하단 ✨ FAB와 각 항목 내부 ✨ 버튼으로만 진입 */}

        <div className="appTabsWrap" style={S.tabsWrap}>
          <div style={S.tabs}>
            {sections.map(sec => {
              const items = checklist.filter(i => i.section === sec.id);
              const secDone = items.filter(i => platformChecked[i.id]).length;
              const isActive = activeTab === sec.id;
              const isDone = secDone === items.length && items.length > 0;
              return (
                <button key={sec.id} className='tabBtn'
                  style={{ ...S.tabBtn, ...(isActive ? S.tabBtnActive : {}) }}
                  onClick={() => setActiveTab(sec.id)}>
                  <span style={S.tabEmoji}>{sec.emoji}</span>
                  <span>{sec.short}</span>
                  <span style={{
                    ...S.tabCount,
                    color: isActive ? '#3dba6f' : isDone ? '#3dba6f' : '#607570',
                    background: isActive ? 'rgba(61,186,111,.15)' : 'transparent',
                  }}>{secDone}/{items.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 섹션 intro 박스 — 클릭 토글 펼침 (기본 접힘) */}
        {activeSection?.intro && (
          <div style={S.introBox}>
            <div
              style={S.introHeader}
              onClick={() => setIntroOpen(o => !o)}
            >
              <div style={S.introTitle}>{activeSection.intro.title}</div>
              <span style={{
                ...S.introToggle,
                transform: introOpen ? 'rotate(180deg)' : 'rotate(0)',
              }}>▼</span>
            </div>
            {introOpen && (
              <div style={S.introContent}>{activeSection.intro.content}</div>
            )}
          </div>
        )}

        <div style={{ minHeight: '300px' }}>
          {activeItems.map(item => (
            <CheckItem key={item.id} item={item} checked={!!platformChecked[item.id]} onToggle={toggle} userId={user?.uid} storeId={activeStoreId} />
          ))}
        </div>

        {done === total && total > 0 && (
          <div style={S.banner}>
            <div style={S.bannerTitle}>🏆 {currentPlatform === 'baemin' ? '배민' : '쿠팡이츠'} 최적화 완료!</div>
            <div style={S.bannerSub}>{total}개 항목을 모두 확인했습니다.<br />이제 주문이 들어올 모든 준비가 됐습니다.</div>
          </div>
        )}
      </main>

      <div style={S.fab}>
        <div style={{ ...S.fabMenu, display: fabOpen ? 'flex' : 'none' }}>
          {AI_TOOLS.map(t => (
            <button key={t.type} className='fabItem' onClick={() => openAi(t.type)}>
              <span className='fabItemIcon'>{t.emoji}</span>{t.name}
            </button>
          ))}
        </div>
        <button className='fabMain'
          style={{ ...S.fabMain, ...(fabOpen ? S.fabMainOpen : {}) }}
          onClick={() => setFabOpen(o => !o)} title='AI 문구 생성 도구'>
          {fabOpen ? '✕' : '✨'}
        </button>
      </div>

      {aiModal && modalItem && (
        <AiModal
          item={modalItem}
          onClose={() => setAiModal(null)}
          userId={user?.uid}
          storeId={activeStoreId}
        />
      )}

      {showAddModal && (
        <StoreAddModal
          onSubmit={handleAddStore}
          onClose={() => setShowAddModal(false)}
          existingStores={stores}
        />
      )}

      {showEditModal && activeStore && (
        <StoreEditModal
          store={activeStore}
          onSubmit={handleEditStore}
          onDelete={handleDeleteStore}
          onClose={() => setShowEditModal(false)}
          canDelete={stores.length > 1}
          existingStores={stores}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fabFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes introSlideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .tabBtn:hover { background: #1c2021 !important; color: #e8ede8 !important; }

        .platformTab:hover { background: #1c2021 !important; }

        .fabMain {
          width: 60px; height: 60px; border-radius: 50%;
          background: linear-gradient(135deg, #3dba6f 0%, #00a869 100%);
          color: white; font-size: 26px;
          box-shadow: 0 6px 20px rgba(61,186,111,.35), 0 2px 8px rgba(0,0,0,.25);
          border: 2px solid rgba(255,255,255,.15);
          cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; justify-content: center;
        }
        .fabMain:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(61,186,111,.5), 0 4px 12px rgba(0,0,0,.3); }

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
          display: flex; align-items: center; justify-content: center; font-size: 14px;
        }

        /* 모바일 헤더 — 2단 레이아웃 (PC 그대로 유지) */
        @media (max-width: 680px) {
          .appHeader {
            padding: 10px 14px !important;
            gap: 8px 10px !important;
            grid-template-columns: auto 1fr auto !important;
            grid-template-areas:
              "logo store profile"
              "platforms platforms platforms"
              "progress progress progress" !important;
          }
          .appHeaderLogo {
            grid-area: logo !important;
            width: 36px !important;
            height: 36px !important;
            border-radius: 9px !important;
          }
          .appHeader > div:nth-child(2) {
            /* htext 영역을 store 영역으로 분리 */
            grid-area: store !important;
            min-width: 0 !important;
            display: contents !important;
          }
          .appHeaderRow1 {
            grid-area: store !important;
            min-width: 0 !important;
          }
          .appHeaderSub {
            grid-area: platforms !important;
            margin-top: 2px !important;
          }
          .appHeaderRight {
            grid-area: progress !important;
            display: flex !important;
            align-items: center !important;
            gap: 10px !important;
            justify-content: flex-end !important;
          }
          .appHeaderProg {
            flex: 1 !important;
            min-width: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
            text-align: left !important;
          }
          .appHeaderProgLabel { display: none !important; }
          .appHeaderProgBar {
            flex: 1 !important;
            width: auto !important;
            margin-left: 0 !important;
            margin-bottom: 0 !important;
          }
          .appHeaderProg > div:last-child {
            white-space: nowrap !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
          }
          .appProfileBtn {
            grid-area: profile !important;
            width: 32px !important;
            height: 32px !important;
            justify-self: end !important;
          }
          .appProfileBtn ~ * {
            /* 프로필 메뉴는 그대로 유지 */
          }
          .appTabsWrap {
            top: 122px !important;
          }
          /* 매장 박스 다이어트 */
          .storeSwitcherBtn {
            padding: 6px 10px !important;
            font-size: 12.5px !important;
          }
          /* 플랫폼 토글 padding 압축 */
          .platformTab {
            padding: 3px 8px !important;
            font-size: 11px !important;
          }
        }

        /* 매우 좁은 화면 (375px 이하) */
        @media (max-width: 380px) {
          .appHeaderBadge { font-size: 9.5px !important; padding: 1px 5px !important; }
        }
      `}</style>
    </div>
  );
}

const S = {
  root: { fontFamily: "'Noto Sans KR',sans-serif", background: '#0f1110', color: '#e8ede8', minHeight: '100vh', WebkitFontSmoothing: 'antialiased' },

  loader: { background: '#0f1110', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '36px', height: '36px', border: '3px solid rgba(61,186,111,.2)', borderTopColor: '#3dba6f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  firstWelcome: { textAlign: 'center', padding: '20px' },
  welcomeLogo: { width: '80px', height: '80px', borderRadius: '20px', marginBottom: '20px' },
  welcomeTitle: { fontSize: '20px', fontWeight: 700, color: '#e8ede8', marginBottom: '8px' },
  welcomeSub: { fontSize: '13.5px', color: '#9aada6' },

  header: { background: 'rgba(15,17,16,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2a3030', padding: '14px 32px', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '16px', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 },
  logo: { width: '50px', height: '50px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,.3)', overflow: 'hidden', flexShrink: 0 },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
  htext: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '5px' },
  hrow1: { display: 'flex', alignItems: 'center', minWidth: 0 },
  hsub: { fontSize: '11.5px', color: '#9aada6', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  badge: { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: 'rgba(61,186,111,.12)', color: '#3dba6f', border: '1px solid rgba(61,186,111,.3)', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600 },
  badgeInline: { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', background: 'rgba(61,186,111,.12)', color: '#3dba6f', border: '1px solid rgba(61,186,111,.3)', borderRadius: '4px', fontSize: '10.5px', fontWeight: 600, marginLeft: '8px' },

  // 플랫폼 토글 탭 — 헤더 sub 줄에 노출
  platformTabs: { display: 'flex', gap: '6px' },
  platformTab: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px',
    background: '#181c1a',
    border: '1px solid #2a3030',
    borderRadius: '999px',
    color: '#9aada6',
    fontSize: '11.5px',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all .2s',
  },
  platformCount: {
    fontSize: '10.5px',
    opacity: 0.85,
    fontWeight: 700,
  },

  hright: { display: 'flex', alignItems: 'center', gap: '16px' },
  hprog: { textAlign: 'right', minWidth: '130px' },
  plabel: { fontSize: '11px', color: '#607570', marginBottom: '5px' },
  grade: { fontWeight: 600 },
  pbarWrap: { width: '130px', height: '5px', background: '#232829', borderRadius: '999px', overflow: 'hidden', marginBottom: '3px', marginLeft: 'auto' },
  pbarFill: { height: '100%', background: 'linear-gradient(90deg,#3dba6f,#00a869)', borderRadius: '999px', transition: 'width .4s cubic-bezier(.4,0,.2,1)' },
  pcount: { fontSize: '13px', fontWeight: 600 },

  profileWrap: { position: 'relative' },
  profileBtn: { width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #2a3030', overflow: 'hidden', cursor: 'pointer', background: '#181c1a', padding: 0, flexShrink: 0 },
  profileImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  profileFallback: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3dba6f', fontWeight: 700, fontSize: '14px' },
  profileBackdrop: { position: 'fixed', inset: 0, zIndex: 99 },
  profileMenu: { position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#181c1a', border: '1px solid #2a3030', borderRadius: '10px', minWidth: '220px', boxShadow: '0 12px 32px rgba(0,0,0,.5)', zIndex: 100, overflow: 'hidden' },
  profileInfo: { padding: '14px 16px' },
  profileName: { fontSize: '13px', fontWeight: 600, color: '#e8ede8', marginBottom: '2px' },
  profileEmail: { fontSize: '11.5px', color: '#607570' },
  profileDiv: { height: '1px', background: '#2a3030' },
  profileItem: { width: '100%', background: 'none', border: 'none', padding: '11px 16px', fontSize: '13px', color: '#e8ede8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', fontFamily: 'inherit' },

  main: { maxWidth: '920px', margin: '0 auto', padding: '24px 24px 100px' },

  tabsWrap: { position: 'sticky', top: '94px', zIndex: 30, background: 'rgba(15,17,16,0.95)', backdropFilter: 'blur(8px)', padding: '12px 0', marginBottom: '16px', borderBottom: '1px solid #2a3030', marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px' },
  tabs: { display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' },
  tabBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', background: 'transparent', border: '1px solid transparent', borderRadius: '10px', color: '#607570', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .2s', fontFamily: 'inherit' },
  tabBtnActive: { background: '#1c2021', border: '1px solid rgba(61,186,111,.3)', color: '#e8ede8' },
  tabEmoji: { fontSize: '14px' },
  tabCount: { fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', transition: 'all .2s' },

  // 섹션 intro 박스 — 클릭 토글 펼침
  introBox: {
    background: 'rgba(232,160,32,.08)',
    border: '1px solid rgba(232,160,32,.3)',
    borderLeft: '3px solid #e8a020',
    borderRadius: '10px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  introHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  introTitle: {
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#e8a020',
  },
  introToggle: {
    color: '#e8a020',
    fontSize: '11px',
    transition: 'transform 0.25s ease',
    display: 'inline-block',
    marginLeft: '12px',
    flexShrink: 0,
  },
  introContent: {
    fontSize: '12.5px',
    color: '#c8d4ce',
    lineHeight: 1.7,
    whiteSpace: 'pre-wrap',
    padding: '0 16px 14px 16px',
    animation: 'introSlideDown 0.25s ease',
  },

  banner: { background: 'linear-gradient(135deg,#1e4a32,#0d3020)', border: '1px solid #3dba6f', borderRadius: '14px', padding: '24px', textAlign: 'center', marginTop: '24px' },
  bannerTitle: { fontSize: '20px', fontWeight: 700, color: '#3dba6f', marginBottom: '8px' },
  bannerSub: { fontSize: '13px', color: '#7acf9a', lineHeight: 1.7 },

  fab: { position: 'fixed', bottom: '28px', right: '28px', zIndex: 60, display: 'flex', flexDirection: 'column-reverse', alignItems: 'flex-end', gap: '10px' },
  fabMain: {},
  fabMainOpen: { transform: 'rotate(45deg)', background: '#232829', color: '#9aada6', boxShadow: '0 4px 12px rgba(0,0,0,.3)' },
  fabMenu: { flexDirection: 'column', gap: '8px', animation: 'fabFadeIn 0.25s ease' },
};
