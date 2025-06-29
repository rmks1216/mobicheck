'use client';
import TreeItem from './TreeItem';
import {useChecklistStore} from '@/lib/store/checklistStore';

export default function ItemsPanel({allItems, descendantMap, ancestorMap}) {
  const {addItems} = useChecklistStore();
  const handleSelect = (id) =>
    addItems(
      [
        ...ancestorMap[id].slice().reverse(),
        id,
        ...descendantMap[id],
      ],
      ancestorMap
    );
  
  return (
    <aside className="w-1/2 border-r pr-4 overflow-y-auto max-h-screen">
      <h2 className="text-lg font-semibold mb-3">전체 항목</h2>
      <ul>
        {allItems.map((n) => (
          <TreeItem key={n.id} node={n} onSelect={handleSelect}/>
        ))}
      </ul>
    </aside>
  );
}