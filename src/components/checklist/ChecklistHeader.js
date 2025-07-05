'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';

// 모드 선택 컴포넌트 (다크모드)
function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg border border-slate-600">
      <span className="text-sm font-medium text-slate-300">모드:</span>
      <div className="flex gap-1">
        <button
          onClick={() => onModeChange('simple')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === 'simple'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500 border border-slate-500'
          }`}
        >
          📝 간단 체크
        </button>
        <button
          onClick={() => onModeChange('repeat')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === 'repeat'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500 border border-slate-500'
          }`}
        >
          🔄 반복 관리
        </button>
      </div>
    </div>
  );
}

// 체크리스트 헤더 컴포넌트 (다크모드)
export default function ChecklistHeader({
                                          checklist,
                                          progressInfo,
                                          onRename,
                                          onModeChange,
                                          onClearAll,
                                          onDeleteAll
                                        }) {
  const { allItems, findItemById } = useChecklistStore();
  
  const handleModeChange = (newMode) => {
    if (confirm(`모드를 "${newMode === 'simple' ? '간단 체크' : '반복 관리'}"로 변경하시겠습니까?\n모든 항목의 진행상태가 초기화됩니다.`)) {
      onModeChange(newMode);
    }
  };
  
  const nonCategoryItemsCount = checklist.items.filter(item => {
    const fullItem = findItemById(allItems, item.id);
    return fullItem && !(fullItem.children && fullItem.children.length > 0);
  }).length;
  
  return (
    <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
      <input
        className="text-xl font-semibold bg-transparent border-none outline-none w-full text-slate-100 placeholder-slate-400"
        value={checklist.name}
        onChange={(e) => onRename(e.target.value)}
        placeholder="체크리스트 이름"
      />
      
      {/* 모드 선택 */}
      <div className="mt-4">
        <ModeSelector
          mode={checklist.mode || 'simple'}
          onModeChange={handleModeChange}
        />
      </div>
      
      {/* 진행률 정보 */}
      <div className="mt-4">
        <div className="flex items-center gap-4 text-sm text-slate-300">
          <span>총 {nonCategoryItemsCount}개 항목</span>
          {progressInfo && (
            <>
              <span>•</span>
              <span>{progressInfo.description}</span>
            </>
          )}
        </div>
        
        {/* 통합 진행률 바 */}
        {progressInfo && (
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium w-16 ${
                checklist.mode === 'simple' ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {checklist.mode === 'simple' ? '완료율' : '진행율'}
              </span>
              <div className={`flex-1 rounded-full h-3 ${
                checklist.mode === 'simple' ? 'bg-blue-900/30' : 'bg-purple-900/30'
              }`}>
                <div
                  className={`h-3 rounded-full transition-all duration-300 ease-out ${
                    checklist.mode === 'simple' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}
                  style={{width: `${progressInfo.progress}%`}}
                />
              </div>
              <span className={`text-sm font-bold w-12 ${
                checklist.mode === 'simple' ? 'text-blue-400' : 'text-purple-400'
              }`}>
                {progressInfo.progress}%
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* 액션 버튼들 */}
      {checklist.items.length > 0 && (
        <div className="flex gap-2 mt-4">
          <button
            className="px-3 py-1.5 text-xs bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-colors border border-amber-800/50"
            onClick={onClearAll}
            title="모든 항목 초기화"
          >
            🔄 초기화
          </button>
          <button
            className="px-3 py-1.5 text-xs bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors border border-red-800/50"
            onClick={() => {
              if (confirm(`"${checklist.name}"의 모든 항목을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                onDeleteAll();
              }
            }}
            title="모든 항목 삭제"
          >
            🗑️ 전체 삭제
          </button>
        </div>
      )}
    </div>
  );
}