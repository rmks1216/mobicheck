'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';

// 모드 통계 표시 컴포넌트
function ModeStats({ stats }) {
  if (!stats) return null;
  
  const { simple, repeat, total } = stats;
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">총 {total}개 항목</span>
      </div>
      
      {simple.count > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-blue-400">📝</span>
          <span className="text-slate-300">
            간단체크: {simple.completed}/{simple.count}
          </span>
          <div className="w-16 h-2 bg-blue-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${simple.progress}%` }}
            />
          </div>
          <span className="text-xs text-blue-400 w-8">{simple.progress}%</span>
        </div>
      )}
      
      {repeat.count > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-purple-400">🔄</span>
          <span className="text-slate-300">
            반복관리: {repeat.totalCurrent}/{repeat.totalTarget}회
          </span>
          <div className="w-16 h-2 bg-purple-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${repeat.progress}%` }}
            />
          </div>
          <span className="text-xs text-purple-400 w-8">{repeat.progress}%</span>
        </div>
      )}
    </div>
  );
}

// 체크리스트 헤더 컴포넌트 (혼합 모드 지원)
export default function ChecklistHeader({
                                          checklist,
                                          progressInfo,
                                          onRename,
                                          onClearAll,
                                          onDeleteAll
                                        }) {
  const { findItemById, getModeStats } = useChecklistStore();
  
  const nonCategoryItemsCount = checklist.items.filter(item => {
    const fullItem = findItemById(item.id);
    return fullItem && !(fullItem.children && fullItem.children.length > 0);
  }).length;
  
  const modeStats = getModeStats(checklist.id);
  
  return (
    <div className="p-4 border-b border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={checklist.name}
            onChange={(e) => onRename(e.target.value)}
            className="text-xl font-bold bg-transparent text-slate-100 border-none outline-none focus:bg-slate-700/30 rounded px-2 py-1"
          />
          <span className="text-slate-500 text-sm">
            ({nonCategoryItemsCount}개 항목)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            className="px-3 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded hover:bg-yellow-900/50 transition-colors border border-yellow-800/50"
            title="모든 항목 체크 해제"
          >
            🔄 초기화
          </button>
          <button
            onClick={onDeleteAll}
            className="px-3 py-1 text-xs bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 transition-colors border border-red-800/50"
            title="모든 항목 삭제"
          >
            🗑️ 전체삭제
          </button>
        </div>
      </div>
      
      {/* 진행률 표시 */}
      {progressInfo && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-300">{progressInfo.description}</span>
            <span className="text-sm font-medium text-slate-200">{progressInfo.progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progressInfo.progress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* 모드별 통계 */}
      <ModeStats stats={modeStats} />
    </div>
  );
}