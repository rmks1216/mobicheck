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
  const hasMixedModes = modeStats && modeStats.simple.count > 0 && modeStats.repeat.count > 0;
  
  return (
    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
      <input
        className="text-xl font-semibold bg-transparent border-none outline-none w-full text-slate-100 placeholder-slate-400"
        value={checklist.name}
        onChange={(e) => onRename(e.target.value)}
        placeholder="체크리스트 이름"
      />
      
      {/* 모드 표시 */}
      <div className="mt-4">
        <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600">
          <span className="text-sm font-medium text-slate-300">모드:</span>
          <div className="flex items-center gap-2">
            {hasMixedModes ? (
              <span className="px-3 py-1 text-xs rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
                🔀 혼합 모드 (간단체크 + 반복관리)
              </span>
            ) : modeStats?.simple.count > 0 ? (
              <span className="px-3 py-1 text-xs rounded-md bg-blue-600 text-white shadow-md">
                📝 간단 체크
              </span>
            ) : modeStats?.repeat.count > 0 ? (
              <span className="px-3 py-1 text-xs rounded-md bg-purple-600 text-white shadow-md">
                🔄 반복 관리
              </span>
            ) : (
              <span className="px-3 py-1 text-xs rounded-md bg-slate-600 text-slate-400">
                📋 항목 없음
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* 모드별 통계 정보 */}
      {modeStats && (
        <div className="mt-4">
          <ModeStats stats={modeStats} />
        </div>
      )}
      
      {/* 전체 진행률 바 */}
      {progressInfo && nonCategoryItemsCount > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium w-16 text-slate-300">
              전체 진행률
            </span>
            <div className={`flex-1 rounded-full h-3 ${
              hasMixedModes
                ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30'
                : modeStats?.simple.count > 0
                  ? 'bg-blue-900/30'
                  : 'bg-purple-900/30'
            }`}>
              <div
                className={`h-3 rounded-full transition-all duration-300 ease-out ${
                  hasMixedModes
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                    : modeStats?.simple.count > 0
                      ? 'bg-blue-500'
                      : 'bg-purple-500'
                }`}
                style={{width: `${progressInfo.progress}%`}}
              />
            </div>
            <span className={`text-sm font-bold w-12 ${
              hasMixedModes
                ? 'text-slate-100'
                : modeStats?.simple.count > 0
                  ? 'text-blue-400'
                  : 'text-purple-400'
            }`}>
              {progressInfo.progress}%
            </span>
          </div>
          
          {/* 진행률 설명 */}
          <div className="mt-2">
            <p className="text-xs text-slate-400">
              {progressInfo.description}
            </p>
          </div>
        </div>
      )}
      
      {/* 액션 버튼들 */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={onClearAll}
          className="px-3 py-2 text-xs bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-colors border border-amber-800/50"
          title="모든 항목 초기화"
        >
          🔄 초기화
        </button>
        <button
          onClick={onDeleteAll}
          className="px-3 py-2 text-xs bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors border border-red-800/50"
          title="모든 항목 삭제"
        >
          🗑️ 전체 삭제
        </button>
      </div>
    </div>
  );
}