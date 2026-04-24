import { useState } from 'react';
import {
  BAEMIN_CATEGORIES,
  MAX_CATEGORIES_PER_STORE,
  toggleCategoryId,
} from '../data/categories';

// 매장 추가 모달
// props:
//   - onSubmit({ name, categoryIds, businessId }) => Promise<string | null>
//   - onClose?: () => void
//   - forceFirst?: boolean

export default function StoreAddModal({ onSubmit, onClose, forceFirst = false }) {
  const [name, setName] = useState('');
  const [categoryIds, setCategoryIds] = useState([]);
  const [businessId, setBusinessId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = name.trim() && categoryIds.length > 0 && !submitting;

  function handleToggleCategory(id) {
    setCategoryIds(prev => toggleCategoryId(prev, id));
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      const storeId = await onSubmit({
        name: name.trim(),
        categoryIds,
        businessId: businessId.trim(),
      });
      if (!storeId) {
        setError('매장 생성에 실패했습니다. 다시 시도해주세요.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('매장 생성 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  function handleBackdropClick() {
    if (forceFirst) return;
    onClose?.();
  }

  const countLabel = `${categoryIds.length}/${MAX_CATEGORIES_PER_STORE}`;
  const atMax = categoryIds.length >= MAX_CATEGORIES_PER_STORE;

  return (
    <div style={S.backdrop} onClick={handleBackdropClick}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <div>
            <div style={S.title}>
              {forceFirst ? '🏪 매장을 등록해주세요' : '➕ 매장 추가'}
            </div>
            <div style={S.sub}>
              {forceFirst
                ? '배민 체크리스트는 매장별로 관리됩니다'
                : '새 매장을 추가합니다'}
            </div>
          </div>
          {!forceFirst && (
            <button style={S.closeBtn} onClick={() => onClose?.()} aria-label='닫기'>✕</button>
          )}
        </div>

        <div style={S.body}>
          {/* 매장명 */}
          <div style={S.field}>
            <label style={S.label}>
              매장명 <span style={S.req}>필수</span>
            </label>
            <input
              style={S.input}
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='예: 영일이아구찜 상남점'
              maxLength={40}
              autoFocus
            />
          </div>

          {/* 카테고리 (최대 4개) */}
          <div style={S.field}>
            <label style={S.label}>
              카테고리 <span style={S.req}>필수</span>
              <span style={{ ...S.countBadge, ...(atMax ? S.countBadgeMax : {}) }}>
                {countLabel}
              </span>
              <span style={S.hint}>최대 {MAX_CATEGORIES_PER_STORE}개 선택</span>
            </label>
            <div style={S.catGrid}>
              {BAEMIN_CATEGORIES.map(cat => {
                const active = categoryIds.includes(cat.id);
                const disabled = !active && atMax;
                return (
                  <button
                    key={cat.id}
                    className='catBtn'
                    style={{
                      ...S.catBtn,
                      ...(active ? S.catBtnActive : {}),
                      ...(disabled ? S.catBtnDisabled : {}),
                    }}
                    onClick={() => handleToggleCategory(cat.id)}
                    disabled={disabled}
                  >
                    <span style={S.catEmoji}>{cat.emoji}</span>
                    <span>{cat.name}</span>
                    {active && <span style={S.catCheck}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 사업자번호 */}
          <div style={S.field}>
            <label style={S.label}>
              사업자번호 <span style={S.opt}>선택</span>
              <span style={S.hint}>나중에 입력해도 됩니다</span>
            </label>
            <input
              style={S.input}
              type='text'
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              placeholder='예: 123-45-67890'
              maxLength={20}
            />
          </div>

          {error && <div style={S.error}>{error}</div>}
        </div>

        <div style={S.footer}>
          {!forceFirst && (
            <button style={S.cancelBtn} onClick={() => onClose?.()} disabled={submitting}>
              취소
            </button>
          )}
          <button
            className='submitBtn'
            style={{ ...S.submitBtn, ...(!canSubmit ? S.submitBtnDisabled : {}) }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? '등록 중...' : '매장 등록'}
          </button>
        </div>
      </div>

      <style>{`
        .catBtn:not(:disabled):hover {
          background: #1c2021 !important;
          border-color: rgba(61,186,111,.4) !important;
        }
        .submitBtn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(61,186,111,.35);
        }
      `}</style>
    </div>
  );
}

const S = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: '20px',
  },
  modal: {
    background: '#16191a', border: '1px solid #2a3030', borderRadius: '16px',
    width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 24px 60px rgba(0,0,0,.6)',
  },
  head: {
    padding: '22px 24px 18px', borderBottom: '1px solid #2a3030',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px',
  },
  title: { fontSize: '17px', fontWeight: 700, color: '#e8ede8', marginBottom: '4px' },
  sub: { fontSize: '12.5px', color: '#9aada6' },
  closeBtn: {
    width: '32px', height: '32px', borderRadius: '8px', border: 'none',
    background: '#232829', color: '#9aada6', cursor: 'pointer',
    fontSize: '14px', flexShrink: 0,
  },

  body: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  field: { marginBottom: '20px' },
  label: {
    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
    fontSize: '13px', fontWeight: 600, color: '#e8ede8', marginBottom: '8px',
  },
  req: {
    fontSize: '10.5px', fontWeight: 700, color: '#ef5b5b',
    background: 'rgba(239,91,91,.12)', padding: '2px 7px', borderRadius: '4px',
  },
  opt: {
    fontSize: '10.5px', fontWeight: 700, color: '#607570',
    background: '#232829', padding: '2px 7px', borderRadius: '4px',
  },
  countBadge: {
    fontSize: '11px', fontWeight: 700,
    color: '#3dba6f', background: 'rgba(61,186,111,.12)',
    border: '1px solid rgba(61,186,111,.3)',
    padding: '2px 8px', borderRadius: '999px',
  },
  countBadgeMax: {
    color: '#F5A041', background: 'rgba(245,160,65,.12)',
    border: '1px solid rgba(245,160,65,.3)',
  },
  hint: { fontSize: '11.5px', color: '#607570', fontWeight: 400, marginLeft: 'auto' },

  input: {
    width: '100%', padding: '11px 14px',
    background: '#181c1a', border: '1px solid #2a3030', borderRadius: '10px',
    color: '#e8ede8', fontSize: '14px', fontFamily: 'inherit',
    boxSizing: 'border-box', outline: 'none',
    transition: 'border-color .15s',
  },

  catGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '8px',
  },
  catBtn: {
    position: 'relative',
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 12px',
    background: '#181c1a', border: '1px solid #2a3030', borderRadius: '10px',
    color: '#9aada6', fontSize: '13px', fontWeight: 500,
    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
    transition: 'all .15s',
  },
  catBtnActive: {
    background: 'rgba(61,186,111,.12)',
    border: '1px solid #3dba6f',
    color: '#3dba6f',
    fontWeight: 600,
    paddingRight: '28px',  // 체크 표시 공간
  },
  catBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  catEmoji: { fontSize: '16px' },
  catCheck: {
    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
    color: '#3dba6f', fontSize: '14px', fontWeight: 700,
  },

  error: {
    padding: '10px 12px', background: 'rgba(239,91,91,.1)',
    border: '1px solid rgba(239,91,91,.3)', borderRadius: '8px',
    color: '#ef5b5b', fontSize: '12.5px',
  },

  footer: {
    padding: '16px 24px', borderTop: '1px solid #2a3030',
    display: 'flex', gap: '10px', justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 18px', background: 'transparent',
    border: '1px solid #2a3030', borderRadius: '10px',
    color: '#9aada6', fontSize: '13.5px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #3dba6f 0%, #00a869 100%)',
    border: 'none', borderRadius: '10px',
    color: 'white', fontSize: '13.5px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    boxShadow: '0 4px 12px rgba(61,186,111,.25)',
    transition: 'all .15s',
  },
  submitBtnDisabled: {
    opacity: 0.4, cursor: 'not-allowed', boxShadow: 'none',
  },
};
