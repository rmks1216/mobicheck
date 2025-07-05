'use client';

import CheckboxIndet from './CheckboxIndet';
import { RepeatCounter } from './RepeatComponents';
import { useChecklistStore } from '@/lib/store/checklistStore';

// 체크박스 상태 계산 함수들
function getDescendantState(itemId, descendantMap, itemsMap) {
  const descendants = descendantMap[itemId] || [];
  const checkedDesc = descendants.filter((d) => itemsMap.get(d)?.checked);
  return {
    all: descendants.length > 0 && checkedDesc.length === descendants.length,
    some: checkedDesc.length > 0 && checkedDesc.length < descendants.length,
  };
}

function getCompletionStats(itemId, descendantMap, itemsMap) {
  const { findItemById } = useChecklistStore.getState();
  
  const descendants = descendantMap[itemId] || [];
  const presentDescendants = descendants.filter((d) => itemsMap.has(d));
  
  // 카테고리 항목을 제외한 실제 아이템만 필터링
  const nonCategoryDescendants = presentDescendants.filter(id => {
    const fullItem = findItemById(id);
    return fullItem && !(fullItem.children && fullItem.children.length > 0);
  });
  
  const completed = nonCategoryDescendants.filter((d) => itemsMap.get(d)?.checked).length;
  return {
    completed,
    total: nonCategoryDescendants.length,
  };
}

function getItemLevel(id, ancestorMap) {
  return ancestorMap[id]?.length || 0;
}

// 카테고리별 이모지 매핑
const itemEmojis = {
  // 메인 카테고리
  'duty': '📋',
  
  // 지역별 서브 카테고리
  'dunbarton': '🏰',
  'tyrconail': '🌲',
  'colen': '🌊',
  
  // 던바튼 항목들
  'dunbarton01': '🧃',
  'dunbarton02': '🍄',
  'dunbarton03': '🥛',
  'dunbarton04': '⛏️',
  
  // 티르코네일 항목들
  'tyrconail01': '🍳',
  'tyrconail02': '🕷️',
  'tyrconail03': '🐑',
  'tyrconail04': '🌿',
  
  // 콜헨 항목들
  'colen01': '🦪',
  'colen02': '🌸',
  'colen03': '🥚',
  'colen04': '🪵'
};

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
                                        onSettings,
                                        customLevel = null
                                      }) {
  const { findItemById } = useChecklistStore();
  const fullItem = findItemById(item.id);
  const isCategory = fullItem && fullItem.children && fullItem.children.length > 0;
  
  const descendants = descendantMap[item.id] || [];
  const ancestors = ancestorMap[item.id] || [];
  const descendantState = getDescendantState(item.id, descendantMap, itemsMap);
  const stats = getCompletionStats(item.id, descendantMap, itemsMap);
  const hasChildren = descendants.some(d => itemsMap.has(d));
  
  // customLevel이 제공되면 사용하고, 그렇지 않으면 기존 방식 사용
  const level = customLevel !== null ? customLevel : getItemLevel(item.id, ancestorMap);
  
  return (
    <div
      className="group hover:bg-slate-700/30 rounded-lg transition-colors"
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
            <span className={`font-medium ${item.checked
              ? 'text-slate-500 line-through'
              : 'text-slate-200'
            }`}>
              {idNameMap[item.id] || item.id}
            </span>
            
            {/* 하위 항목 통계 */}
            {hasChildren && (
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full border border-slate-600">
                {stats.completed}/{stats.total}
              </span>
            )}
          </div>
        </div>
        
        {/* 반복 카운터 (반복 모드에서만) */}
        {checklist.mode === 'repeat' && !isCategory && (
          <RepeatCounter
            item={item}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
            onSettings={() => onSettings(item)}
          />
        )}
        
        {/* 개별 삭제 버튼 */}
        <button
          className="w-4 h-4 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all text-xs font-bold opacity-0 group-hover:opacity-100 border border-red-800/50"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          title="항목 삭제"
        >
          ✕
        </button>
      </div>
    </div>
  );
}