'use client';
import { useChecklistStore } from '@/lib/store/checklistStore';

export default function ChecklistTabs() {
  const {
    checklists,
    activeId,
    setActive,
    addChecklist,
    deleteChecklist,
  } = useChecklistStore();
  
  return (
    <div className="border-b border-slate-700 bg-slate-800/50">
      <div className="flex items-center px-4 py-2 overflow-x-auto">
        {checklists.map((checklist) => (
          <div key={checklist.id} className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setActive(checklist.id)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                checklist.id === activeId
                  ? 'bg-slate-700 text-blue-400 border-b-2 border-blue-500 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <span className="mr-1">
                {checklist.mode === 'repeat' ? '🔄' : '📝'}
              </span>
              {checklist.name}
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
        ))}
        
        {/* 새 체크리스트 추가 버튼 */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => addChecklist('새 간단 체크리스트', 'simple')}
            className="px-3 py-2 text-xs bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition-colors whitespace-nowrap border border-blue-800/50"
            title="간단 체크리스트 추가"
          >
            + 📝 간단
          </button>
          <button
            onClick={() => addChecklist('새 반복 체크리스트', 'repeat')}
            className="px-3 py-2 text-xs bg-purple-900/30 text-purple-400 rounded-lg hover:bg-purple-900/50 transition-colors whitespace-nowrap border border-purple-800/50"
            title="반복 체크리스트 추가"
          >
            + 🔄 반복
          </button>
        </div>
      </div>
    </div>
  );
}