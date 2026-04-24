import { useState, useEffect, useRef } from 'react';

// 상단 매장 전환 드롭다운
// props:
//   - stores: [{ id, name }]
//   - activeStoreId: string | null
//   - onSwitch(storeId): void
//   - onAddClick(): void
//   - onEditClick(): void

export default function StoreSwitcher({ stores, activeStoreId, onSwitch, onAddClick, onEditClick }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const active = stores.find(s => s.id === activeStoreId);

  // 외부 클릭 시 닫기
  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [open]);

  function handleSwitch(id) {
    if (id !== activeStoreId) {
      onSwitch(id);
    }
    setOpen(false);
  }

  return (
    <div style={S.wrap} ref={wrapRef}>
      <button
        className='switcherBtn'
        style={S.btn}
        onClick={() => setOpen(o => !o)}
      >
        <span style={S.icon}>🏪</span>
        <span style={S.name}>
          {active ? active.name : '매장 선택'}
        </span>
        <span style={{ ...S.chevron, transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
      </button>

      {open && (
        <div style={S.menu}>
          <div style={S.menuHead}>내 매장 {stores.length}개</div>

          <div style={S.list}>
            {stores.map(s => {
              const isActive = s.id === activeStoreId;
              return (
                <button
                  key={s.id}
                  className='storeItem'
                  style={{
                    ...S.item,
                    ...(isActive ? S.itemActive : {}),
                  }}
                  onClick={() => handleSwitch(s.id)}
                >
                  <span style={S.check}>
                    {isActive ? '✓' : ''}
                  </span>
                  <span style={S.itemName}>{s.name}</span>
                </button>
              );
            })}
          </div>

          <div style={S.divider} />

          <button className='menuAction' style={S.action} onClick={() => { setOpen(false); onAddClick(); }}>
            <span style={S.actionIcon}>➕</span>
            <span>새 매장 추가</span>
          </button>
          {active && (
            <button className='menuAction' style={S.action} onClick={() => { setOpen(false); onEditClick(); }}>
              <span style={S.actionIcon}>⚙️</span>
              <span>현재 매장 설정</span>
            </button>
          )}
        </div>
      )}

      <style>{`
        .switcherBtn:hover {
          background: #1c2021 !important;
          border-color: rgba(61,186,111,.4) !important;
        }
        .storeItem:hover {
          background: #1c2021 !important;
        }
        .menuAction:hover {
          background: rgba(61,186,111,.08) !important;
          color: #3dba6f !important;
        }
      `}</style>
    </div>
  );
}

const S = {
  wrap: { position: 'relative' },

  btn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 14px',
    background: '#181c1a', border: '1px solid #2a3030', borderRadius: '10px',
    color: '#e8ede8', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all .15s',
    maxWidth: '260px',
  },
  icon: { fontSize: '16px', flexShrink: 0 },
  name: {
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    minWidth: 0, flex: 1, textAlign: 'left',
  },
  chevron: {
    fontSize: '12px', color: '#607570', transition: 'transform .2s',
    flexShrink: 0,
  },

  menu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    minWidth: '260px', maxWidth: '320px',
    background: '#181c1a', border: '1px solid #2a3030', borderRadius: '10px',
    boxShadow: '0 12px 32px rgba(0,0,0,.5)',
    zIndex: 100, overflow: 'hidden',
  },
  menuHead: {
    padding: '10px 14px 8px',
    fontSize: '11px', color: '#607570', fontWeight: 600, letterSpacing: '.3px',
    textTransform: 'uppercase',
  },
  list: { maxHeight: '280px', overflowY: 'auto' },

  item: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px',
    background: 'transparent', border: 'none',
    color: '#e8ede8', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'background .15s',
  },
  itemActive: {
    background: 'rgba(61,186,111,.1)',
    color: '#3dba6f', fontWeight: 600,
  },
  check: {
    width: '14px', fontSize: '12px', color: '#3dba6f', flexShrink: 0,
  },
  itemName: {
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0,
  },

  divider: { height: '1px', background: '#2a3030', margin: '6px 0' },

  action: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px',
    background: 'transparent', border: 'none',
    color: '#9aada6', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'all .15s',
  },
  actionIcon: { fontSize: '13px', width: '14px', flexShrink: 0 },
};
