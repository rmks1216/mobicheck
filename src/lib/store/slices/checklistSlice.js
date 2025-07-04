import { v4 as uuid } from 'uuid';

export const createChecklistSlice = (set, get) => ({
  checklists: [],
  activeId: null,

  // 체크리스트 추가
  addChecklist: (name = '새 체크리스트', mode = 'simple') =>
    set((state) => {
      const id = uuid();
      return {
        checklists: [...state.checklists, { id, name, mode, items: [] }],
        activeId: id,
      };
    }),

  // 활성 체크리스트 설정
  setActive: (id) => set({ activeId: id }),

  // 체크리스트 이름 변경
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
              items: c.items.map((item) => ({
                ...item,
                checked: mode === 'simple' ? false : item.currentCount >= item.targetCount,
                currentCount: mode === 'simple' ? 0 : item.currentCount,
                targetCount: mode === 'simple' ? 1 : item.targetCount || 1,
              })),
            }
          : c
      ),
    })),

  // 체크리스트 삭제
  deleteChecklist: (id) =>
    set((state) => {
      const newChecklists = state.checklists.filter((c) => c.id !== id);
      const newActiveId =
        state.activeId === id
          ? newChecklists.length > 0
            ? newChecklists[0].id
            : null
          : state.activeId;

      return {
        checklists: newChecklists,
        activeId: newActiveId,
      };
    }),
});
