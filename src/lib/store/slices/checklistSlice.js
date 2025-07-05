import { v4 as uuid } from 'uuid';

export const createChecklistSlice = (set, get) => ({
  checklists: [],
  activeId: null,
  
  // 체크리스트 추가 (모드 옵션 제거 - 개별 항목별로 설정)
  addChecklist: (name = '새 체크리스트') =>
    set((state) => {
      const id = uuid();
      return {
        checklists: [...state.checklists, { id, name, items: [] }],
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
  
  // 특정 체크리스트의 모든 항목 삭제
  clearChecklist: (checklistId) =>
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id === checklistId ? { ...c, items: [] } : c
      ),
    })),
  
  
});