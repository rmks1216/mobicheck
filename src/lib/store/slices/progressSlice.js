export const createProgressSlice = (set, get) => ({
  // 진행률 계산 (혼합 모드 지원)
  getProgress: (checklistId) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist || checklist.items.length === 0) return 0;
    
    // findItemById 함수를 state에서 가져오기
    const findItemById = state.findItemById;
    
    // 카테고리 항목을 제외한 실제 아이템만 필터링
    const nonCategoryItems = checklist.items.filter(item => {
      const fullItem = findItemById(item.id);
      return fullItem && !(fullItem.children && fullItem.children.length > 0);
    });
    
    if (nonCategoryItems.length === 0) return 0;
    
    // 각 모드별로 진행률 계산하여 가중 평균
    const simpleItems = nonCategoryItems.filter(item => (item.itemMode || 'simple') === 'simple');
    const repeatItems = nonCategoryItems.filter(item => item.itemMode === 'repeat');
    
    let totalProgress = 0;
    
    // 간단체크 항목들의 진행률
    if (simpleItems.length > 0) {
      const simpleCompleted = simpleItems.filter(item => item.checked).length;
      const simpleProgress = (simpleCompleted / simpleItems.length) * 100;
      const simpleWeight = simpleItems.length / nonCategoryItems.length;
      totalProgress += simpleProgress * simpleWeight;
    }
    
    // 반복관리 항목들의 진행률
    if (repeatItems.length > 0) {
      const repeatTotalTarget = repeatItems.reduce((sum, item) => sum + (item.targetCount || 1), 0);
      const repeatTotalCurrent = repeatItems.reduce((sum, item) => sum + (item.currentCount || 0), 0);
      const repeatProgress = repeatTotalTarget > 0 ? (repeatTotalCurrent / repeatTotalTarget) * 100 : 0;
      const repeatWeight = repeatItems.length / nonCategoryItems.length;
      totalProgress += repeatProgress * repeatWeight;
    }
    
    return Math.round(totalProgress);
  },
  
  // 진행률 상세 정보 (혼합 모드 지원)
  getProgressInfo: (checklistId) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) return null;
    
    // findItemById 함수를 state에서 가져오기
    const findItemById = state.findItemById;
    
    // 카테고리 항목을 제외한 실제 아이템만 필터링
    const nonCategoryItems = checklist.items.filter(item => {
      const fullItem = findItemById(item.id);
      return fullItem && !(fullItem.children && fullItem.children.length > 0);
    });
    
    const progress = get().getProgress(checklistId);
    const totalItems = nonCategoryItems.length;
    
    if (totalItems === 0) {
      return {
        mode: 'mixed',
        progress: 0,
        totalItems: 0,
        completedItems: 0,
        simpleItems: 0,
        repeatItems: 0,
        description: '항목이 없습니다',
      };
    }
    
    const simpleItems = nonCategoryItems.filter(item => (item.itemMode || 'simple') === 'simple');
    const repeatItems = nonCategoryItems.filter(item => item.itemMode === 'repeat');
    const completedItems = nonCategoryItems.filter(item => item.checked);
    
    // 반복 항목 통계
    const repeatStats = repeatItems.length > 0 ? {
      totalTarget: repeatItems.reduce((sum, item) => sum + (item.targetCount || 1), 0),
      totalCurrent: repeatItems.reduce((sum, item) => sum + (item.currentCount || 0), 0),
      completedRepeatItems: repeatItems.filter(item => item.checked).length,
    } : {
      totalTarget: 0,
      totalCurrent: 0,
      completedRepeatItems: 0,
    };
    
    // 설명 생성
    let description = '';
    if (simpleItems.length > 0 && repeatItems.length > 0) {
      // 혼합 모드
      const simpleCompleted = simpleItems.filter(item => item.checked).length;
      description = `전체: ${completedItems.length}/${totalItems} 완료 (간단: ${simpleCompleted}/${simpleItems.length}, 반복: ${repeatStats.completedRepeatItems}/${repeatItems.length})`;
    } else if (simpleItems.length > 0) {
      // 간단체크만
      description = `${completedItems.length}/${totalItems} 항목 완료`;
    } else if (repeatItems.length > 0) {
      // 반복관리만
      description = `${repeatStats.totalCurrent}/${repeatStats.totalTarget} 회 완료 (${completedItems.length}/${totalItems} 항목 달성)`;
    }
    
    return {
      mode: simpleItems.length > 0 && repeatItems.length > 0 ? 'mixed' :
        simpleItems.length > 0 ? 'simple' : 'repeat',
      progress,
      totalItems,
      completedItems: completedItems.length,
      simpleItems: simpleItems.length,
      repeatItems: repeatItems.length,
      ...repeatStats,
      description,
    };
  },
  
  // 모드별 통계 가져오기 (중복 방지를 위해 checklistSlice에서 이동)
  getModeStats: (checklistId) => {
    const state = get();
    const checklist = state.checklists.find((c) => c.id === checklistId);
    if (!checklist) return null;
    
    // findItemById 함수를 state에서 가져오기
    const findItemById = state.findItemById;
    
    const nonCategoryItems = checklist.items.filter(item => {
      const fullItem = findItemById(item.id);
      return fullItem && !(fullItem.children && fullItem.children.length > 0);
    });
    
    const simpleItems = nonCategoryItems.filter(item => (item.itemMode || 'simple') === 'simple');
    const repeatItems = nonCategoryItems.filter(item => item.itemMode === 'repeat');
    
    return {
      total: nonCategoryItems.length,
      simple: {
        count: simpleItems.length,
        completed: simpleItems.filter(item => item.checked).length,
        progress: simpleItems.length > 0 ?
          Math.round((simpleItems.filter(item => item.checked).length / simpleItems.length) * 100) : 0,
      },
      repeat: {
        count: repeatItems.length,
        completed: repeatItems.filter(item => item.checked).length,
        totalTarget: repeatItems.reduce((sum, item) => sum + (item.targetCount || 1), 0),
        totalCurrent: repeatItems.reduce((sum, item) => sum + (item.currentCount || 0), 0),
        progress: repeatItems.length > 0 && repeatItems.reduce((sum, item) => sum + (item.targetCount || 1), 0) > 0 ?
          Math.round((repeatItems.reduce((sum, item) => sum + (item.currentCount || 0), 0) /
            repeatItems.reduce((sum, item) => sum + (item.targetCount || 1), 0)) * 100) : 0,
      },
    };
  },
});