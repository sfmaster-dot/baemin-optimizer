import { useState, useMemo } from 'react';
import {
  BAEMIN_CATEGORIES,
  MAX_CATEGORIES_PER_STORE,
  toggleCategoryId,
} from '../data/categories';
import {
  MAX_STORES_PER_BUSINESS,
  getGroupKey,
  countStoresInSameGroup,
} from '../lib/stores';

// 매장 수정/삭제 모달
// props:
//   - store: { id, name, categoryIds, businessId, businessGroupName }
//   - onSubmit(storeId, patch) => Promise<boolean>
//   - onDelete(storeId) => Promise<boolean>
//   - onClose(): void
//   - canDelete: boolean
//   - existingStores?: []  ← 4개 초과 경고 계산용

export default function StoreEditModal({
  store,
  onSubmit,
  onDelete,
  onClose,
  canDelete,
  existingStores = [],
}) {
  const initialCategoryIds = Array.isArray(store?.categoryIds) ? store.categoryIds : [];
  const initialBusinessId = store?.businessId || '';
  const initialGroupName = store?.businessGroupName || '';

  const [name, setName] = useState(store?.name || '');
  const [categoryIds, setCategoryIds] = useState(initialCategoryIds);
  const [businessId, setBusinessId] = useState(initialBusinessId);
  const [businessGroupName, setBusinessGroupName] = useState(initialGroupName);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState('');

  // 현재 입력값 기준 가상 매장 (경고 계산용)
  const previewStore = { businessId, businessGroupName };
  const sameGroupKey = getGroupKey(previewStore);

  // 같은 그룹에 이미 몇 개? (자기 자신 제외)
  const existingCount = useMemo(() => {
    if (sameGroupKey === null) return 0;
    return countStoresInSameGroup(existingStores, previewStore, store?.id);
  }, [existingStores, sameGroupKey, businessId, businessGroupName, store?.id]);

  // 경고는 "4개 이미 있는데 이 매장이 그 그룹에 추가로 들어가려 할 때" 표시
  // 수정이므로 이 매장까지 포함하면 5개 이상이 되는 상황
  const showOverLimit = existingCount >= MAX_STORES_PER_BUSINESS;

  const categoriesChanged =
    categoryIds.length !== initialCategoryIds.length ||
    categoryIds.some((id, i) => id !== initialCategoryIds[i]);

  const hasChanges =
    name.trim() !== (store?.name || '') ||
    categoriesChanged ||
    businessId.trim() !== initialBusinessId ||
    businessGroupName.trim() !== initialGroupName;

  const canSubmit =
    name.trim() &&
    categoryIds.length > 0 &&
    hasChanges &&
    !submitting;

  function handleToggleCategory(id) {
    setCategoryIds(prev => toggleCategoryId(prev, id));
  }

  async function handleSave() {
    if (!canSubmit) return;
    setError('');
    setSubmitting(true);
    try {
      const ok = await onSubmit(store.id, {
        name: name.trim(),
        categoryIds,
        businessId: businessId.trim(),
        businessGroupName: businessGroupName.trim(),
      });
      if (ok) {
        onClose();
      } else {
        setError('저장에 실패했습니다. 다시 시도해주세요.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('저장 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setError('');
    setSubmitting(true);
    try {
      const ok = await onDelete(store.id);
      if (ok) {
        onClose();
      } else {
        setError('삭제에 실패했습니다.');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('삭제 중 오류가 발생했습니다.');
      setSubmitting(false);
    }
  }

  const countLabel = `${categoryIds.length}/${MAX_CATEGORIES_PER_STORE}`;
  const atMax = categoryIds.length >= MAX_CATEGORIES_PER_STORE;

  // ── 삭제 확인 화면 ──
  if (confirmDelete) {
    return (
      <div style={S.backdrop} onClick={() => !submitting && setConfirmDelete(false)}>
        <div style={S.modal} onClick={(e) => e.stopPropagation()}>
          <div style={S.head}>
            <div>
              <div style={{ ...S.title, color: '#ef5b5b' }}>⚠️ 매장 삭제</div>
              <div style={S.sub}>이 작업은 되돌릴 수 없습니다</div>
            </div>
          </div>
          <div style={S.body}>
            <div style={S.deleteWarn}>
              <div style={S.deleteWarnTitle}>"{store.name}" 을(를) 정말 삭제하시겠습니까?</div>
              <ul style={S.deleteList}>
                <li>체크리스트 진행 상황이 모두 삭제됩니다</li>
                <li>저장된 AI 문구 캐시가 모두 삭제됩니다</li>
                <li>등록된 샵인샵 정보가 모두 삭제됩니다</li>
              </ul>
            </div>
            {error && <div style={S.error}>{error}</div>}
          </div>
          <div style={S.footer}>
            <button style={S.cancelBtn} onClick={() => setConfirmDelete(false)} disabled={submitting}>
              취소
            </button>
            <button style={S.deleteConfirmBtn} onClick={handleDelete} disabled={submitting}>
              {submitting ? '삭제 중...' : '영구 삭제'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── 편집 화면 ──
  return (
    <div style={S.backdrop} onClick={() => !submitting && onClose()}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        <div style={S.head}>
          <div>
            <div style={S.title}>⚙️ 매장 설정</div>
            <div style={S.sub}>매장 정보를 수정합니다</div>
          </div>
          <button style={S.closeBtn} onClick={onClose} aria-label='닫기'>✕</button>
        </div>

        {/* 경고 배너 (수정 시 다른 그룹으로 옮기려는데 그쪽에 이미 4개 있을 때) */}
        {showOverLimit && (
          <div style={S.warnBanner}>
            <span style={S.warnIcon}>⚠️</span>
            <div style={S.warnText}>
              이 사업자에 이미 {existingCount}개 매장이 있습니다.{' '}
              <span style={S.warnSub}>
                배민은 사업자 1개당 최대 {MAX_STORES_PER_BUSINESS}개 매장까지 권장합니다.
              </span>
            </div>
          </div>
        )}

        <div style={S.body}>
          <div style={S.field}>
            <label style={S.label}>
              매장명 <span style={S.req}>필수</span>
            </label>
            <input
              style={S.input}
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
          </div>

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

          {/* 사업자 그룹 */}
          <div style={S.groupBox}>
            <div style={S.groupTitle}>
              <span>📋 사업자 정보</span>
              <span style={S.opt}>모두 선택</span>
            </div>
            <div style={S.groupHint}>
              같은 사업자의 매장끼리 묶여서 관리됩니다.
            </div>

            <div style={S.fieldRow}>
              <label style={S.labelSmall}>사업자명</label>
              <input
                style={S.input}
                type='text'
                value={businessGroupName}
                onChange={(e) => setBusinessGroupName(e.target.value)}
                placeholder='예: (주)단꿈 · 영일이F&B'
                maxLength={40}
              />
            </div>

            <div style={S.fieldRow}>
              <label style={S.labelSmall}>사업자번호</label>
              <input
                style={S.input}
                type='text'
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                placeholder='예: 123-45-67890'
                maxLength={20}
              />
            </div>
          </div>

          {error && <div style={S.error}>{error}</div>}
        </div>

        <div style={S.footer}>
          {canDelete && (
            <button
              style={S.deleteBtn}
              onClick={() => setConfirmDelete(true)}
              disabled={submitting}
              title='매장 삭제'
            >
              🗑️ 삭제
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button style={S.cancelBtn} onClick={onClose} disabled={submitting}>
            취소
          </button>
          <button
            className='submitBtn'
            style={{ ...S.submitBtn, ...(!canSubmit ? S.submitBtnDisabled : {}) }}
            onClick={handleSave}
            disabled={!canSubmit}
          >
            {submitting ? '저장 중...' : '저장'}
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

  warnBanner: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    padding: '12px 20px',
    background: 'rgba(245,160,65,.08)',
    borderBottom: '1px solid rgba(245,160,65,.3)',
  },
  warnIcon: { fontSize: '16px', flexShrink: 0, marginTop: '1px' },
  warnText: { fontSize: '12.5px', color: '#F5A041', fontWeight: 600, lineHeight: 1.5 },
  warnSub: { color: '#d49140', fontWeight: 400 },

  body: { padding: '20px 24px', overflowY: 'auto', flex: 1 },
  field: { marginBottom: '20px' },
  fieldRow: { marginBottom: '10px' },
  label: {
    display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
    fontSize: '13px', fontWeight: 600, color: '#e8ede8', marginBottom: '8px',
  },
  labelSmall: {
    display: 'block',
    fontSize: '11.5px', fontWeight: 500, color: '#9aada6', marginBottom: '5px',
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
  },

  groupBox: {
    padding: '14px 16px', marginBottom: '20px',
    background: 'rgba(255,255,255,.02)',
    border: '1px solid #2a3030', borderRadius: '12px',
  },
  groupTitle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', fontWeight: 600, color: '#e8ede8', marginBottom: '4px',
  },
  groupHint: {
    fontSize: '11.5px', color: '#607570', lineHeight: 1.5,
    marginBottom: '14px',
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
    paddingRight: '28px',
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
  deleteWarn: {
    padding: '16px 18px', background: 'rgba(239,91,91,.08)',
    border: '1px solid rgba(239,91,91,.3)', borderRadius: '10px',
  },
  deleteWarnTitle: {
    fontSize: '14px', fontWeight: 600, color: '#e8ede8', marginBottom: '10px',
  },
  deleteList: {
    margin: 0, paddingLeft: '18px',
    fontSize: '12.5px', color: '#9aada6', lineHeight: 1.8,
  },
  footer: {
    padding: '16px 24px', borderTop: '1px solid #2a3030',
    display: 'flex', gap: '10px', alignItems: 'center',
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
  deleteBtn: {
    padding: '10px 14px', background: 'transparent',
    border: '1px solid rgba(239,91,91,.3)', borderRadius: '10px',
    color: '#ef5b5b', fontSize: '12.5px', fontWeight: 500,
    cursor: 'pointer', fontFamily: 'inherit',
  },
  deleteConfirmBtn: {
    padding: '10px 22px',
    background: '#ef5b5b', border: 'none', borderRadius: '10px',
    color: 'white', fontSize: '13.5px', fontWeight: 600,
    cursor: 'pointer', fontFamily: 'inherit',
    marginLeft: 'auto',
  },
};
