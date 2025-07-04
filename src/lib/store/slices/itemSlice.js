export const createItemSlice = (set, get) => ({
  // 항목 추가
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
                      targetCount: c.mode === 'repeat' ? 1 : 1,
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

  // 항목 카운트/체크 관련 액션들...
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
                        currentCount: Math.min(item.currentCount, targetCount),
                        checked:
                          c.mode === 'repeat'
                            ? Math.min(item.currentCount, targetCount) >= targetCount
                            : item.checked,
                      }
                    : item
                ),
              }
        ),
      };
    }),

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
                        currentCount: Math.max(
                          0,
                          Math.min(currentCount, item.targetCount)
                        ),
                        checked:
                          c.mode === 'repeat'
                            ? Math.max(0, Math.min(currentCount, item.targetCount)) >=
                              item.targetCount
                            : item.checked,
                      }
                    : item
                ),
              }
        ),
      };
    }),

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
                  item.id === itemId
                    ? {
                        ...item,
                        currentCount: Math.min(
                          item.currentCount + 1,
                          item.targetCount
                        ),
                        checked:
                          c.mode === 'repeat'
                            ? Math.min(item.currentCount + 1, item.targetCount) >=
                              item.targetCount
                            : item.checked,
                      }
                    : item
                ),
              }
        ),
      };
    }),

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
                  item.id === itemId
                    ? {
                        ...item,
                        currentCount: Math.max(0, item.currentCount - 1),
                        checked:
                          c.mode === 'repeat'
                            ? Math.max(0, item.currentCount - 1) >=
                              item.targetCount
                            : item.checked,
                      }
                    : item
                ),
              }
        ),
      };
    }),

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
              items[idx] = {
                ...item,
                checked: nowChecked,
                currentCount:
                  c.mode === 'simple'
                    ? nowChecked
                      ? 1
                      : 0
                    : nowChecked
                    ? item.targetCount
                    : 0,
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
            items[pIdx] = {
              ...parentItem,
              checked: allChecked,
              currentCount:
                c.mode === 'simple'
                  ? allChecked
                    ? 1
                    : 0
                  : allChecked
                  ? parentItem.targetCount
                  : 0,
            };
          });

          return { ...c, items };
        }),
      };
    }),
});
