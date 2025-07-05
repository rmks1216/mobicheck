'use client';
import { useChecklistStore } from '@/lib/store/checklistStore';

export default function ChecklistTabs() {
  const {
    checklists,
    activeId,
    setActive,
    addChecklist,
    deleteChecklist,
    getModeStats,
  } = useChecklistStore();
  
  return (
    <div className="border-b border-slate-700 bg-slate-800/50">
      <div className="flex items-center px-4 py-2 overflow-x-auto">
        {checklists.map((checklist) => {
          const modeStats = getModeStats(checklist.id);
          const hasMixedModes = modeStats && modeStats.simple.count > 0 && modeStats.repeat.count > 0;
          
          // 탭 아이콘 결정
          let tabIcon = '📋';
          if (hasMixedModes) {
            tabIcon = '🔀';
          } else if (modeStats?.simple.count > 0) {
            tabIcon = '📝';
          } else if (modeStats?.repeat.count > 0) {
            tabIcon = '🔄';
          }
          
          return (
            <div key={checklist.id} className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setActive(checklist.id)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap relative ${
                  checklist.id === activeId
                    ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-500 shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <span className="mr-1">{tabIcon}</span>
                {checklist.name}
                
                {/* 모드 표시 배지 */}
                {modeStats && modeStats.total > 0 && (
                  <span className={`absolute -top-1 -right-1 text-xs px-1 py-0.5 rounded-full text-white ${
                    hasMixedModes
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : modeStats.simple.count > 0
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                  }`}>
                    {modeStats.total}
                  </span>
                )}
              </button>
              {checklists.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`"${checklist.name}" 체크리스트를 삭제하시겠습니까?`)) {
                      deleteChecklist(checklist.id);
                    }
                  }}
                  className="w-5 h-5 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50 text-xs font-bold opacity-60 hover:opacity-100 transition-all border border-red-800/50"
                  title="체크리스트 삭제"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
        
        {/* 새 체크리스트 추가 버튼 */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => addChecklist('새 체크리스트')}
            className="px-3 py-2 text-xs bg-slate-900/50 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-slate-200 transition-colors whitespace-nowrap border border-slate-600"
            title="새 체크리스트 추가 (개별 항목별로 모드 설정 가능)"
          >
            + 📋 체크리스트
          </button>
        </div>
      </div>
    </div>
  );
}