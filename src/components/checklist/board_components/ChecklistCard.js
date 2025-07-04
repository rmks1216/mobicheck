'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';
import TreeItem from '../items/TreeItem'; // 경로 수정 필요 시 확인

export default function ChecklistCard({ checklist, allItems }) {
  const { renameChecklist, toggleItem } = useChecklistStore();

  return (
    <div className="border p-4 rounded-xl">
      <input
        className="font-semibold text-lg mb-2 outline-none bg-transparent"
        value={checklist.name}
        onChange={(e) => renameChecklist(checklist.id, e.target.value)}
      />

      <ul className="pl-4">
        {allItems.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            checklistId={checklist.id}
            toggleItem={toggleItem} // 이 부분은 itemSlice에서 가져와야 할 수 있음
            storedItems={checklist.items}
          />
        ))}
      </ul>
    </div>
  );
}
