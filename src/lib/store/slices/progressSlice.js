export const createProgressSlice = (set, get) => ({
  // 진행률 계산
  getProgress: (checklistId) => {
    const checklist = get().checklists.find((c) => c.id === checklistId);
    if (!checklist || checklist.items.length === 0) return 0;

    const allItems = get().allItems; // allItems 가져오기
    const findItemById = get().findItemById; // findItemById 가져오기

    // 카테고리 항목을 제외한 실제 아이템만 필터링
    const nonCategoryItems = checklist.items.filter(item => {
      const fullItem = get().findItemById(item.id);
      return fullItem && !(fullItem.children && fullItem.children.length > 0);
    });

    if (nonCategoryItems.length === 0) return 0; // 실제 아이템이 없으면 0 반환

    if (checklist.mode === 'simple') {
      const completed = nonCategoryItems.filter((item) => item.checked).length;
      return Math.round((completed / nonCategoryItems.length) * 100);
    } else {
      const totalTarget = nonCategoryItems.reduce(
        (sum, item) => sum + item.targetCount,
        0
      );
      const totalCurrent = nonCategoryItems.reduce(
        (sum, item) => sum + item.currentCount,
        0
      );
      return totalTarget > 0
        ? Math.round((totalCurrent / totalTarget) * 100)
        : 0;
    }
  },

  // 진행률 상세 정보
  getProgressInfo: (checklistId) => {
    const checklist = get().checklists.find((c) => c.id === checklistId);
    if (!checklist) return null;

    const allItems = get().allItems; // allItems 가져오기
    const findItemById = get().findItemById; // findItemById 가져오기

    // 카테고리 항목을 제외한 실제 아이템만 필터링
    const nonCategoryItems = checklist.items.filter(item => {
      const fullItem = get().findItemById(item.id);
      return fullItem && !(fullItem.children && fullItem.children.length > 0);
    });

    const progress = get().getProgress(checklistId);
    const totalItems = nonCategoryItems.length; // 필터링된 항목의 개수

    if (checklist.mode === 'simple') {
      const completedItems = nonCategoryItems.filter((item) => item.checked).length;
      return {
        mode: 'simple',
        progress,
        totalItems,
        completedItems,
        description: `${completedItems}/${totalItems} 항목 완료`,
      };
    } else {
      const totalTarget = nonCategoryItems.reduce(
        (sum, item) => sum + item.targetCount,
        0
      );
      const totalCurrent = nonCategoryItems.reduce(
        (sum, item) => sum + item.currentCount,
        0
      );
      const completedItems = nonCategoryItems.filter((item) => item.checked).length;

      return {
        mode: 'repeat',
        progress,
        totalItems,
        completedItems,
        totalCurrent,
        totalTarget,
        description: `${totalCurrent}/${totalTarget} 회 완료 (${completedItems}/${totalItems} 항목 달성)`,
      };
    }
  },
});
