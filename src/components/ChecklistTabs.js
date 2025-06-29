'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';

export default function ChecklistTabs() {
  const {checklists, activeId, setActive, addChecklist} =
    useChecklistStore();
  return (
    <div className="flex items-center gap-2 mb-3">
      {checklists.map((c) => (
        <button
          key={c.id}
          className={`px-3 py-1 rounded-full text-sm border ${
            c.id === activeId ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
          onClick={() => setActive(c.id)}
        >
          {c.name}
        </button>
      ))}
      <button
        className="ml-auto text-sm underline text-blue-600"
        onClick={() => addChecklist()}
      >
        + 새 체크리스트
      </button>
    </div>
  );
}