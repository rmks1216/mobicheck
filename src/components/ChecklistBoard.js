'use client';                 // 반드시 선언 (Client Component)

import {useChecklistStore} from '@/lib/store/checklistStore';
import {v4 as uuid} from 'uuid';
import TreeItem from './TreeItem';     // 트리 렌더링용(재귀)

// allItems(props) 구조 예시
// [{ id, name, children: [ { id, name … } ] }, …]

export default function ChecklistBoard({allItems}) {
  const {
    checklists,
    addChecklist,
    renameChecklist,
    toggleItem,
  } = useChecklistStore();
  
  return (
    <section className="space-y-8">
      {/* 새 체크리스트 만들기 */}
      <button
        className="px-3 py-2 rounded bg-blue-600 text-white"
        onClick={() => addChecklist('새 체크리스트')}
      >
        + 체크리스트 추가
      </button>
      
      {/* 체크리스트 목록 */}
      {checklists.map((cl) => (
        <div key={cl.id} className="border p-4 rounded-xl">
          {/* 이름 인라인 수정 */}
          <input
            className="font-semibold text-lg mb-2 outline-none"
            value={cl.name}
            onChange={(e) => renameChecklist(cl.id, e.target.value)}
          />
          
          {/* 항목 트리 표시 */}
          <ul className="pl-4">
            {allItems.map((node) => (
              <TreeItem
                key={node.id}
                node={node}
                checklistId={cl.id}
                toggleItem={toggleItem}
                storedItems={cl.items}
              />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}