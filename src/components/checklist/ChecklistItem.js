'use client';
import CheckboxIndet from '@/components/CheckboxIndet';
import { RepeatCounter } from './RepeatComponents';

// 아이템별 이모지 매핑
const itemEmojis = {
  'cat-groceries': '🛒',
  'cat-household': '🏠',
  'cat-electronics': '📱',
  'sub-vegetables': '🥬',
  'sub-fruits': '🍎',
  'sub-cleaning': '🧽',
  'sub-kitchen': '🍳',
  'sub-mobile': '📱',
  'sub-computer': '💻',
  'item-carrot': '🥕',
  'item-onion': '🧅',
  'item-apple': '🍎',
  'item-banana': '🍌',
  'item-detergent': '🧴',
  'item-sponge': '🧽',
  'item-foil': '📄',
  'item-wrap': '🎁',
  'item-phone-case': '📱',
  'item-charger': '🔌',
  'item-mouse': '🖱️',
  'item-keyboard': '⌨️'
};

function getDescendantState(id, descendantMap, itemsMap) {
  const descendants = descendantMap[id] || [];
  const present = descendants.filter((d) => itemsMap.has(d));
  
  if (present.length === 0) return { all: false, some: false };
  
  const allChecked = present.every((d) => itemsMap.get(d).checked);
  const someChecked = present.some((d) => itemsMap.get(d).checked);
  
  return {
    all: allChecked,
    some: someChecked && !allChecked,
  };
}

function getItemLevel(id, ancestorMap) {
  return ancestorMap[id]?.length || 0;
}

function getCompletionStats(id, descendantMap, itemsMap) {
  const descendants = descendantMap[id] || [];
  const presentDescendants = descendants.filter((d) => itemsMap.has(d));
  
  if (presentDescendants.length === 0) return { completed: 0, total: 0 };
  
  const completed = presentDescendants.filter(d => itemsMap.get(d).checked).length;
  return { completed, total: presentDescendants.length };
}

// 개별 체크리스트 아이템 컴포넌트
export default function ChecklistItem({
                                        item,
                                        checklist,
                                        idNameMap,
                                        descendantMap,
                                        ancestorMap,
                                        itemsMap,
                                        onToggle,
                                        onRemove,
                                        onIncrement,
                                        onDecrement,
                                        onSettings
                                      }) {
  const descendants = descendantMap[item.id] || [];
  const ancestors = ancestorMap[item.id] || [];
  const descendantState = getDescendantState(item.id, descendantMap, itemsMap);
  const stats = getCompletionStats(item.id, descendantMap, itemsMap);
  const hasChildren = descendants.some(d => itemsMap.has(d));
  const level = getItemLevel(item.id, ancestorMap);
  
  return (
    <div
      className="group hover:bg-gray-50 rounded-lg transition-colors"
      style={{ paddingLeft: `${level * 20}px` }}
    >
      <div className="flex items-center gap-3 p-3">
        {/* 체크박스 */}
        <CheckboxIndet
          checked={item.checked}
          indeterminate={descendantState.some}
          onChange={() => onToggle(item.id, descendants, ancestors, descendantMap)}
        />
        
        {/* 아이템 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{itemEmojis[item.id] || '📋'}</span>
            <span className={`font-medium ${item.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
              {idNameMap[item.id] || item.id}
            </span>
            
            {/* 하위 항목 통계 */}
            {hasChildren && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {stats.completed}/{stats.total}
              </span>
            )}
          </div>
        </div>
        
        {/* 반복 카운터 (반복 모드에서만) */}
        {checklist.mode === 'repeat' && (
          <RepeatCounter
            item={item}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
            onSettings={() => onSettings(item)}
          />
        )}
        
        {/* 개별 삭제 버튼 */}
        <button
          className="w-4 h-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all text-xs font-bold opacity-0 group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`"${idNameMap[item.id] || item.id}"을(를) 체크리스트에서 제거하시겠습니까?`)) {
              onRemove(item.id);
            }
          }}
          title="항목 삭제"
        >
          ✕
        </button>
      </div>
    </div>
  );
}