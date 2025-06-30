'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';

export default function ChecklistTabs() {
  const {checklists, activeId, setActive, addChecklist} = useChecklistStore();
  
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
          <button
            key={c.id}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              c.id === activeId
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setActive(c.id)}
          >
            {c.name}
          </button>
        ))}
        
        {checklists.length === 0 && (
          <div className="text-sm text-gray-500 py-2">
            아직 체크리스트가 없습니다. 새 리스트를 만들어보세요!
          </div>
        )}
      </div>
    </div>
  );
}