'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';

// 모드 선택 컴포넌트
function ModeSelector({ mode, onModeChange }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">모드:</span>
      <div className="flex gap-1">
        <button
          onClick={() => onModeChange('simple')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === 'simple'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border'
          }`}
        >
          📝 간단 체크
        </button>
        <button
          onClick={() => onModeChange('repeat')}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === 'repeat'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border'
          }`}
        >
          🔄 반복 관리
        </button>
      </div>
    </div>
  );
}

// 체크리스트 헤더 컴포넌트
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
    <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
      <input
        className="text-xl font-semibold bg-transparent border-none outline-none w-full text-blue-900 placeholder-blue-700"
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
        <div className="flex items-center gap-4 text-sm text-blue-700">
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
                checklist.mode === 'simple' ? 'text-blue-600' : 'text-purple-600'
              }`}>
                {checklist.mode === 'simple' ? '완료율' : '진행율'}
              </span>
              <div className={`flex-1 rounded-full h-3 ${
                checklist.mode === 'simple' ? 'bg-blue-200' : 'bg-purple-200'
              }`}>
                <div
                  className={`h-3 rounded-full transition-all duration-300 ease-out ${
                    checklist.mode === 'simple' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}
                  style={{width: `${progressInfo.progress}%`}}
                />
              </div>
              <span className={`text-sm font-bold w-12 ${
                checklist.mode === 'simple' ? 'text-blue-600' : 'text-purple-600'
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
            className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
            onClick={onClearAll}
            title="모든 항목 초기화"
          >
            🔄 초기화
          </button>
          <button
            className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
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