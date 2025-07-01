import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { v4 as uuid } from 'uuid';

/**
 * 개선된 checklist 구조
 * checklists: [
 *   {
 *     id,              // uuid
 *     name,            // 문자열
 *     mode,            // 'simple' | 'repeat' - 체크리스트 모드
 *     items: [         // 담긴 항목(상위·하위 모두 포함)
 *       {
 *         id,           // string
 *         checked,      // boolean
 *         targetCount,  // number (반복 모드에서만 사용, 기본값: 1)
 *         currentCount  // number (반복 모드에서만 사용, 기본값: 0)
 *       }
 *     ]
 *   },
 *   ...
 * ]
 * activeId: 현재 작업 중인 체크리스트 id
 */

export const useChecklistStore = create(
  persist(
    (set, get) => ({
      /* ───────── state ───────── */
      checklists: [],
      activeId: null,
      
      // 기존 데이터 마이그레이션 함수
      migrateData: () =>
        set((state) => ({
          checklists: state.checklists.map(checklist => ({
            ...checklist,
            mode: checklist.mode || 'simple', // 기본값 설정
            items: checklist.items.map(item => ({
              id: item.id,
              checked: item.checked || false,
              targetCount: item.targetCount || 1,
              currentCount: item.currentCount || (item.checked ? 1 : 0)
            }))
          }))
        })),
      
      /* ───────── checklist 관리 ───────── */
      addChecklist: (name = '새 체크리스트', mode = 'simple') =>
        set((state) => {
          const id = uuid();
          return {
            checklists: [...state.checklists, { id, name, mode, items: [] }],
            activeId: id,
          };
        }),
      
      setActive: (id) => set({ activeId: id }),
      
      renameChecklist: (id, name) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, name } : c
          ),
        })),
      
      // 체크리스트 모드 변경
      setChecklistMode: (id, mode) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id
              ? {
                ...c,
                mode,
                // 모드 변경 시 항목들을 적절히 초기화
                items: c.items.map(item => ({
                  ...item,
                  checked: mode === 'simple' ? false : item.currentCount >= item.targetCount,
                  currentCount: mode === 'simple' ? 0 : item.currentCount,
                  targetCount: mode === 'simple' ? 1 : (item.targetCount || 1)
                }))
              }
              : c
          ),
        })),
      
      // 체크리스트 삭제
      deleteChecklist: (id) =>
        set((state) => {
          const newChecklists = state.checklists.filter(c => c.id !== id);
          const newActiveId = state.activeId === id
            ? (newChecklists.length > 0 ? newChecklists[0].id : null)
            : state.activeId;
          
          return {
            checklists: newChecklists,
            activeId: newActiveId,
          };
        }),
      
      // 체크리스트 초기화 (모든 항목 삭제)
      clearChecklist: (id) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id ? { ...c, items: [] } : c
          ),
        })),
      
      // 체크리스트 모든 항목 체크 및 카운트 초기화
      uncheckAllItems: (id) =>
        set((state) => ({
          checklists: state.checklists.map((c) =>
            c.id === id
              ? {
                ...c,
                items: c.items.map(item => ({
                  ...item,
                  checked: false,
                  currentCount: 0
                }))
              }
              : c
          ),
        })),
      
      /* ───────── 항목 담기 ───────── */
      addItems: (itemIds, ancestorMap) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          const activeChecklist = checklists.find(c => c.id === activeId);
          if (!activeChecklist) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: [
                    ...c.items,
                    // 중복 제거하고 새 구조로 추가
                    ...itemIds
                      .filter((id) => !c.items.some((i) => i.id === id))
                      .map((id) => ({
                        id,
                        checked: false,
                        targetCount: c.mode === 'repeat' ? 1 : 1,
                        currentCount: 0
                      })),
                  ].sort(
                    // 깊이(루트=0) 기준 상위 → 하위
                    (a, b) =>
                      (ancestorMap[a.id]?.length || 0) -
                      (ancestorMap[b.id]?.length || 0)
                  ),
                }
            ),
          };
        }),
      
      // 개별 항목 제거
      removeItem: (itemId, descendantMap) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.filter(item => {
                    // 삭제할 항목 자체인 경우
                    if (item.id === itemId) return false;
                    
                    // descendantMap이 제공된 경우, 하위 항목도 함께 삭제
                    if (descendantMap && descendantMap[itemId]) {
                      const descendants = descendantMap[itemId] || [];
                      // 현재 항목이 삭제될 항목의 하위 항목인지 확인
                      if (descendants.includes(item.id)) return false;
                    }
                    
                    return true;
                  }),
                }
            ),
          };
        }),
      
      // 항목의 목표 횟수 설정 (반복 모드에서만)
      setTargetCount: (itemId, targetCount) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.map(item =>
                    item.id === itemId
                      ? {
                        ...item,
                        targetCount: Math.max(1, targetCount),
                        currentCount: Math.min(item.currentCount, targetCount),
                        checked: c.mode === 'repeat'
                          ? Math.min(item.currentCount, targetCount) >= targetCount
                          : item.checked
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 항목의 현재 횟수 설정 (반복 모드에서만)
      setCurrentCount: (itemId, currentCount) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.map(item =>
                    item.id === itemId
                      ? {
                        ...item,
                        currentCount: Math.max(0, Math.min(currentCount, item.targetCount)),
                        checked: c.mode === 'repeat'
                          ? Math.max(0, Math.min(currentCount, item.targetCount)) >= item.targetCount
                          : item.checked
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 카운트 증가 (반복 모드에서만)
      incrementCount: (itemId) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.map(item =>
                    item.id === itemId
                      ? {
                        ...item,
                        currentCount: Math.min(item.currentCount + 1, item.targetCount),
                        checked: c.mode === 'repeat'
                          ? Math.min(item.currentCount + 1, item.targetCount) >= item.targetCount
                          : item.checked
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 카운트 감소 (반복 모드에서만)
      decrementCount: (itemId) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.map(item =>
                    item.id === itemId
                      ? {
                        ...item,
                        currentCount: Math.max(0, item.currentCount - 1),
                        checked: c.mode === 'repeat'
                          ? Math.max(0, item.currentCount - 1) >= item.targetCount
                          : item.checked
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      /* ───────── 체크 / 해제 (연쇄) - 모드별 처리 ───────── */
      toggleCascade: (itemId, descendants, ancestors, descMap) =>
        set((state) => {
          const { activeId, checklists } = state;
          
          return {
            checklists: checklists.map((c) => {
              if (c.id !== activeId) return c;
              
              // 현재 리스트 복사 및 존재 항목 집합
              let items = [...c.items];
              const presentIds = new Set(items.map((i) => i.id));
              
              // 실제로 존재하는 대상(id + 하위)만 토글
              const targetIds = [itemId, ...descendants].filter((d) =>
                presentIds.has(d)
              );
              if (targetIds.length === 0) return c;
              
              const clickedItem = items.find((i) => i.id === itemId);
              if (!clickedItem) return c;
              
              const nowChecked = !clickedItem.checked;
              
              targetIds.forEach((id) => {
                const idx = items.findIndex((i) => i.id === id);
                if (idx !== -1) {
                  const item = items[idx];
                  items[idx] = {
                    ...item,
                    checked: nowChecked,
                    // 모드에 따른 카운트 처리
                    currentCount: c.mode === 'simple'
                      ? (nowChecked ? 1 : 0)
                      : (nowChecked ? item.targetCount : 0)
                  };
                }
              });
              
              // 상위(ancestors) 상태 동기화
              ancestors.forEach((parentId) => {
                const pIdx = items.findIndex((i) => i.id === parentId);
                if (pIdx === -1) return;
                
                const presentChildren = descMap[parentId].filter((cid) =>
                  presentIds.has(cid)
                );
                
                const allChecked =
                  presentChildren.length > 0 &&
                  presentChildren.every(
                    (cid) => items.find((i) => i.id === cid).checked
                  );
                
                const parentItem = items[pIdx];
                items[pIdx] = {
                  ...parentItem,
                  checked: allChecked,
                  currentCount: c.mode === 'simple'
                    ? (allChecked ? 1 : 0)
                    : (allChecked ? parentItem.targetCount : 0)
                };
              });
              
              return { ...c, items };
            }),
          };
        }),
      
      // 통합된 진행률 계산 (모드에 따라 다르게 계산)
      getProgress: (checklistId) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist || checklist.items.length === 0) return 0;
        
        if (checklist.mode === 'simple') {
          // 간단 모드: 체크된 항목 수 / 전체 항목 수
          const completed = checklist.items.filter(item => item.checked).length;
          return Math.round((completed / checklist.items.length) * 100);
        } else {
          // 반복 모드: 현재 카운트 합계 / 목표 카운트 합계
          const totalTarget = checklist.items.reduce((sum, item) => sum + item.targetCount, 0);
          const totalCurrent = checklist.items.reduce((sum, item) => sum + item.currentCount, 0);
          
          return totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
        }
      },
      
      // 진행률 정보 상세 조회
      getProgressInfo: (checklistId) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist) return null;
        
        const progress = get().getProgress(checklistId);
        const totalItems = checklist.items.length;
        
        if (checklist.mode === 'simple') {
          const completedItems = checklist.items.filter(item => item.checked).length;
          return {
            mode: 'simple',
            progress,
            totalItems,
            completedItems,
            description: `${completedItems}/${totalItems} 항목 완료`
          };
        } else {
          const totalTarget = checklist.items.reduce((sum, item) => sum + item.targetCount, 0);
          const totalCurrent = checklist.items.reduce((sum, item) => sum + item.currentCount, 0);
          const completedItems = checklist.items.filter(item => item.checked).length;
          
          return {
            mode: 'repeat',
            progress,
            totalItems,
            completedItems,
            totalCurrent,
            totalTarget,
            description: `${totalCurrent}/${totalTarget} 회 완료 (${completedItems}/${totalItems} 항목 달성)`
          };
        }
      },
      
      // 레거시 지원을 위한 getTotalProgress (이제 getProgress와 동일)
      getTotalProgress: (checklistId) => get().getProgress(checklistId),
    }),
    {
      name: 'checklists',
      storage: createJSONStorage(() => ({
        getItem: (k) => Cookies.get(k) ?? null,
        setItem: (k, v) => Cookies.set(k, v, { expires: 30 }),
        removeItem: (k) => Cookies.remove(k),
      })),
    }
  )
);