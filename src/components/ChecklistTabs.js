'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';

export default function ChecklistTabs() {
  const {checklists, activeId, setActive, addChecklist, deleteChecklist} = useChecklistStore();
  
  return (
    <div className="p-6 border-b">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          ✅ 내 체크리스트
        </h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          onClick={() => addChecklist()}
        >
          <span>+</span>
          새 리스트
        </button>
      </div>
      
      {/* 탭 버튼들 */}
      <div className="flex gap-2 overflow-x-auto">
        {checklists.map((c) => (
          <div key={c.id} className="relative group">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors pr-8 ${
                c.id === activeId
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setActive(c.id)}
            >
              {c.name}
            </button>
            
            {/* X 버튼 (체크리스트가 2개 이상일 때만 표시) */}
            {checklists.length > 1 && (
              <button
                className={`absolute -right-1 w-5 h-5 rounded-full text-xs font-bold transition-all opacity-0 group-hover:opacity-100 ${
                  c.id === activeId
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-400 text-white hover:bg-red-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`"${c.name}" 체크리스트를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                    deleteChecklist(c.id);
                  }
                }}
                title="체크리스트 삭제"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        
        {checklists.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            아직 체크리스트가 없습니다. 새 리스트를 만들어보세요!
          </div>
        )}
      </div>
      
      {/* 체크리스트 개수가 1개일 때 안내 메시지 */}
      {checklists.length === 1 && (
        <div className="mt-3 text-xs text-gray-500">
          💡 체크리스트를 더 추가하면 개별 삭제가 가능합니다
        </div>
      )}
    </div>
  );
}