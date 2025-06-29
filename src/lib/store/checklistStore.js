import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { v4 as uuid } from 'uuid';

/**
 * checklist 구조
 * checklists: [
 *   {
 *     id,              // uuid
 *     name,            // 문자열
 *     items: [         // 담긴 항목(상위·하위 모두 포함)
 *       { id, checked }  // id: string, checked: boolean
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
      
      /* ───────── 항목 담기 ─────────
         itemIds: [id, ...]
         ancestorMap: { id -> [조상들] } (정렬용)
      */
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
                    // 중복 제거
                    ...itemIds
                      .filter((id) => !c.items.some((i) => i.id === id))
                      .map((id) => ({ id, checked: false })),
                  ].sort(
                    // 깊이(루트=0) 기준 상위 → 하위
                    (a, b) =>
                      ancestorMap[a.id]?.length -
                      ancestorMap[b.id]?.length
                  ),
                }
            ),
          };
        }),
      
      /* ───────── 체크 / 해제 (연쇄) ─────────
         itemId        : 클릭된 id
         descendants   : 하위 id 배열
         ancestors     : 조상 id 배열 (가까운 부모 → 최상위)
         descMap       : 전체 descendantMap
      */
      toggleCascade: (itemId, descendants, ancestors, descMap) =>
        set((state) => {
          const { activeId, checklists } = state;
          
          return {
            checklists: checklists.map((c) => {
              if (c.id !== activeId) return c;
              
              // 0) 현재 리스트 복사 및 존재 항목 집합
              let items = [...c.items];
              const presentIds = new Set(items.map((i) => i.id));
              
              // 1) 실제로 존재하는 대상(id + 하위)만 토글
              const targetIds = [itemId, ...descendants].filter((d) =>
                presentIds.has(d)
              );
              if (targetIds.length === 0) return c; // 없으면 그대로
              
              const nowChecked =
                !items.find((i) => i.id === itemId)?.checked;
              
              targetIds.forEach((id) => {
                const idx = items.findIndex((i) => i.id === id);
                if (idx !== -1)
                  items[idx] = { ...items[idx], checked: nowChecked };
              });
              
              // 2) 상위(ancestors) 상태 동기화
              ancestors.forEach((parentId) => {
                const pIdx = items.findIndex((i) => i.id === parentId);
                if (pIdx === -1) return; // 리스트에 없다면 무시
                
                const presentChildren = descMap[parentId].filter((cid) =>
                  presentIds.has(cid)
                );
                
                const allChecked =
                  presentChildren.length > 0 &&
                  presentChildren.every(
                    (cid) => items.find((i) => i.id === cid).checked
                  );
                
                items[pIdx] = { ...items[pIdx], checked: allChecked };
              });
              
              return { ...c, items };
            }),
          };
        }),
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
