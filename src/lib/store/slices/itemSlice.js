export const createItemSlice = (set, get) => ({
  allItems: [],
  
  // 모든 아이템 설정
  setAllItems: (items) => set({ allItems: items }),
  
  // 아이템 ID로 찾기 (재귀적으로 검색)
  findItemById: (itemId) => {
    const { allItems } = get();
    
    const findRecursive = (items, id) => {
      for (const item of items) {
        if (item.id === id) return item;
        if (item.children && item.children.length > 0) {
          const found = findRecursive(item.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findRecursive(allItems, itemId);
  },
  
  // ID-이름 매핑 생성
  getIdNameMap: () => {
    const { allItems } = get();
    const map = {};
    
    const mapRecursive = (items) => {
      for (const item of items) {
        map[item.id] = item.name;
        if (item.children && item.children.length > 0) {
          mapRecursive(item.children);
        }
      }
    };
    
    mapRecursive(allItems);
    return map;
  },
  
  // 조상-후손 관계 매핑 생성
  descendantMap: {},
  ancestorMap: {},
  
  // 조상-후손 매핑 업데이트
  updateRelationMaps: () => {
    const { allItems } = get();
    const descendantMap = {};
    const ancestorMap = {};
    
    const buildMaps = (items, ancestors = []) => {
      items.forEach(item => {
        // 현재 아이템의 조상들 설정
        ancestorMap[item.id] = [...ancestors];
        
        // 조상들에게 현재 아이템을 후손으로 추가
        ancestors.forEach(ancestorId => {
          if (!descendantMap[ancestorId]) {
            descendantMap[ancestorId] = [];
          }
          descendantMap[ancestorId].push(item.id);
        });
        
        // 자식들 처리
        if (item.children && item.children.length > 0) {
          descendantMap[item.id] = [];
          buildMaps(item.children, [...ancestors, item.id]);
        }
      });
    };
    
    buildMaps(allItems);
    
    set({ descendantMap, ancestorMap });
  },
  
  // 항목 추가 - 각 항목에 개별 모드 설정
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
                ...itemIds
                  .filter((id) => !c.items.some((i) => i.id === id))
                  .map((id) => ({
                    id,
                    checked: false,
                    itemMode: 'simple', // 기본값은 간단체크
                    targetCount: 1,
                    currentCount: 0,
                  })),
              ].sort(
                (a, b) =>
                  (ancestorMap[a.id]?.length || 0) -
                  (ancestorMap[b.id]?.length || 0)
              ),
            }
        ),
      };
    }),
  
  // 개별 항목의 모드 변경
  setItemMode: (itemId, itemMode) =>
    set((state) => {
      const { activeId, checklists } = state;
      if (!activeId) return state;
      
      return {
        checklists: checklists.map((c) =>
          c.id !== activeId
            ? c
            : {
              ...c,
              items: c.items.map((item) =>
                item.id === itemId
                  ? {
                    ...item,
                    itemMode,
                    // 모드 변경 시 초기화
                    checked: false,
                    currentCount: 0,
                    targetCount: itemMode === 'repeat' ? (item.targetCount || 1) : 1,
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 항목 제거
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
              items: c.items.filter((item) => {
                if (item.id === itemId) return false;
                if (descendantMap && descendantMap[itemId]) {
                  return !descendantMap[itemId].includes(item.id);
                }
                return true;
              }),
            }
        ),
      };
    }),
  
  // 목표 횟수 설정 (반복 모드 항목용)
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
              items: c.items.map((item) =>
                item.id === itemId
                  ? {
                    ...item,
                    targetCount: Math.max(1, targetCount),
                    currentCount: Math.min(item.currentCount || 0, targetCount),
                    checked: item.itemMode === 'repeat'
                      ? Math.min(item.currentCount || 0, targetCount) >= targetCount
                      : item.checked,
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 현재 횟수 설정 (반복 모드 항목용)
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
              items: c.items.map((item) =>
                item.id === itemId
                  ? {
                    ...item,
                    currentCount: Math.max(0, Math.min(currentCount, item.targetCount || 1)),
                    checked: item.itemMode === 'repeat'
                      ? Math.max(0, Math.min(currentCount, item.targetCount || 1)) >= (item.targetCount || 1)
                      : item.checked,
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 체크 상태 토글 (간단체크 모드 항목용)
  toggleCheck: (itemId) =>
    set((state) => {
      const { activeId, checklists } = state;
      if (!activeId) return state;
      
      return {
        checklists: checklists.map((c) =>
          c.id !== activeId
            ? c
            : {
              ...c,
              items: c.items.map((item) =>
                item.id === itemId && (item.itemMode || 'simple') === 'simple'
                  ? {
                    ...item,
                    checked: !item.checked,
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 반복 항목 카운트 증가
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
              items: c.items.map((item) =>
                item.id === itemId && item.itemMode === 'repeat'
                  ? {
                    ...item,
                    currentCount: Math.min(item.currentCount + 1, item.targetCount || 1),
                    checked: Math.min(item.currentCount + 1, item.targetCount || 1) >= (item.targetCount || 1),
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 반복 항목 카운트 감소
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
              items: c.items.map((item) =>
                item.id === itemId && item.itemMode === 'repeat'
                  ? {
                    ...item,
                    currentCount: Math.max(0, item.currentCount - 1),
                    checked: Math.max(0, item.currentCount - 1) >= (item.targetCount || 1),
                  }
                  : item
              ),
            }
        ),
      };
    }),
  
  // 모든 항목 체크 해제
  uncheckAllItems: (checklistId) =>
    set((state) => ({
      checklists: state.checklists.map((c) =>
        c.id !== checklistId
          ? c
          : {
            ...c,
            items: c.items.map((item) => ({
              ...item,
              checked: false,
              currentCount: 0,
            })),
          }
      ),
    })),
  
  // 캐스케이딩 토글 (하위 항목들 포함)
  toggleCascade: (itemId, descendants, ancestors, descMap) =>
    set((state) => {
      const { activeId, checklists } = state;
      
      return {
        checklists: checklists.map((c) => {
          if (c.id !== activeId) return c;
          
          let items = [...c.items];
          const presentIds = new Set(items.map((i) => i.id));
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
              const itemMode = item.itemMode || 'simple';
              
              items[idx] = {
                ...item,
                checked: nowChecked,
                currentCount: itemMode === 'simple'
                  ? (nowChecked ? 1 : 0)
                  : (nowChecked ? (item.targetCount || 1) : 0),
              };
            }
          });
          
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
            const parentMode = parentItem.itemMode || 'simple';
            
            items[pIdx] = {
              ...parentItem,
              checked: allChecked,
              currentCount: parentMode === 'simple'
                ? (allChecked ? 1 : 0)
                : (allChecked ? (parentItem.targetCount || 1) : 0),
            };
          });
          
          return { ...c, items };
        }),
      };
    }),
});