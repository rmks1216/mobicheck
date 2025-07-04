export const createProgressSlice = (set, get) => ({
  // 진행률 계산
  getProgress: (checklistId) => {
    const checklist = get().checklists.find((c) => c.id === checklistId);
    if (!checklist || checklist.items.length === 0) return 0;

    if (checklist.mode === 'simple') {
      const completed = checklist.items.filter((item) => item.checked).length;
      return Math.round((completed / checklist.items.length) * 100);
    } else {
      const totalTarget = checklist.items.reduce(
        (sum, item) => sum + item.targetCount,
        0
      );
      const totalCurrent = checklist.items.reduce(
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

    const progress = get().getProgress(checklistId);
    const totalItems = checklist.items.length;

    if (checklist.mode === 'simple') {
      const completedItems = checklist.items.filter((item) => item.checked).length;
      return {
        mode: 'simple',
        progress,
        totalItems,
        completedItems,
        description: `${completedItems}/${totalItems} 항목 완료`,
      };
    } else {
      const totalTarget = checklist.items.reduce(
        (sum, item) => sum + item.targetCount,
        0
      );
      const totalCurrent = checklist.items.reduce(
        (sum, item) => sum + item.currentCount,
        0
      );
      const completedItems = checklist.items.filter((item) => item.checked).length;

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
