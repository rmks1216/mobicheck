import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { v4 as uuid } from 'uuid';

/**
 * checklist 구조 (업데이트됨)
 * checklists: [
 *   {
 *     id,              // uuid
 *     name,            // 문자열
 *     items: [         // 담긴 항목(상위·하위 모두 포함)
 *       {
 *         id,           // string
 *         checked,      // boolean (targetCount에 도달했는지)
 *         targetCount,  // number (목표 횟수, 기본값: 1)
 *         currentCount  // number (현재 횟수, 기본값: 0)
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
            items: checklist.items.map(item => ({
              id: item.id,
              checked: item.checked || false,
              targetCount: item.targetCount || 1,
              currentCount: item.currentCount || (item.checked ? 1 : 0)
            }))
          }))
        })),
      
      /* ───────── checklist 관리 ───────── */
      addChecklist: (name = '새 체크리스트') =>
        set((state) => {
          const id = uuid();
          return {
            checklists: [...state.checklists, { id, name, items: [] }],
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
                        targetCount: 1,
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
      removeItem: (itemId) =>
        set((state) => {
          const { activeId, checklists } = state;
          if (!activeId) return state;
          
          return {
            checklists: checklists.map((c) =>
              c.id !== activeId
                ? c
                : {
                  ...c,
                  items: c.items.filter(item => item.id !== itemId),
                }
            ),
          };
        }),
      
      // 새로 추가: 항목의 목표 횟수 설정
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
                        checked: item.currentCount >= Math.max(1, targetCount)
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 새로 추가: 항목 카운트 증가
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
                        checked: (item.currentCount + 1) >= item.targetCount
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 새로 추가: 항목 카운트 감소
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
                        checked: Math.max(0, item.currentCount - 1) >= item.targetCount
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      // 새로 추가: 항목 카운트 직접 설정
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
                        checked: Math.max(0, Math.min(currentCount, item.targetCount)) >= item.targetCount
                      }
                      : item
                  ),
                }
            ),
          };
        }),
      
      /* ───────── 체크 / 해제 (연쇄) - 업데이트됨 ───────── */
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
              
              // 체크된 상태면 카운트를 0으로, 아니면 목표값으로 설정
              const nowChecked = !clickedItem.checked;
              
              targetIds.forEach((id) => {
                const idx = items.findIndex((i) => i.id === id);
                if (idx !== -1) {
                  const item = items[idx];
                  items[idx] = {
                    ...item,
                    checked: nowChecked,
                    currentCount: nowChecked ? item.targetCount : 0
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
                  currentCount: allChecked ? parentItem.targetCount : 0
                };
              });
              
              return { ...c, items };
            }),
          };
        }),
      
      // 진행률 계산 헬퍼
      getProgress: (checklistId) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist || checklist.items.length === 0) return 0;
        
        const completed = checklist.items.filter(item => item.checked).length;
        return Math.round((completed / checklist.items.length) * 100);
      },
      
      // 새로 추가: 전체 완료도 계산 (카운트 기반)
      getTotalProgress: (checklistId) => {
        const checklist = get().checklists.find(c => c.id === checklistId);
        if (!checklist || checklist.items.length === 0) return 0;
        
        const totalTarget = checklist.items.reduce((sum, item) => sum + item.targetCount, 0);
        const totalCurrent = checklist.items.reduce((sum, item) => sum + item.currentCount, 0);
        
        return totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
      },
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