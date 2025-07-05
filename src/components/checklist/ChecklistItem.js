'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';
import CheckboxIndet from './CheckboxIndet';
import { RepeatCounter } from './RepeatComponents';

// 하위 항목들의 상태를 확인하는 함수
function getDescendantState(id, descendantMap, itemsMap) {
  const descendants = descendantMap[id] || [];
  const descendantItems = descendants.map(d => itemsMap.get(d)).filter(Boolean);
  const checked = descendantItems.filter(item => item.checked);
  
  return {
    all: descendantItems.length > 0 && checked.length === descendantItems.length,
    some: checked.length > 0 && checked.length < descendantItems.length,
    none: checked.length === 0
  };
}

// 완료 통계를 계산하는 함수
function getCompletionStats(id, descendantMap, itemsMap) {
  const { findItemById } = useChecklistStore.getState();
  const descendants = descendantMap[id] || [];
  
  const nonCategoryDescendants = descendants.filter((d) => {
    const fullItem = findItemById(d);
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

// 개별 항목 모드 변경 컴포넌트
function ItemModeSelector({ item, onModeChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onModeChange(item.id, 'simple')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          item.itemMode === 'simple'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
        }`}
        title="간단체크 모드로 변경"
      >
        📝
      </button>
      <button
        onClick={() => onModeChange(item.id, 'repeat')}
        className={`px-2 py-1 text-xs rounded transition-colors ${
          item.itemMode === 'repeat'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'bg-slate-600/50 text-slate-400 hover:bg-slate-600 hover:text-slate-300'
        }`}
        title="반복관리 모드로 변경"
      >
        🔄
      </button>
    </div>
  );
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
                                        onModeChange,
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
  
  // 항목의 현재 모드 (기본값: 'simple')
  const currentMode = item.itemMode || 'simple';
  
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
            
            {/* 모드 표시 배지 */}
            {!isCategory && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                currentMode === 'repeat'
                  ? 'bg-purple-900/30 text-purple-400 border border-purple-800/50'
                  : 'bg-blue-900/30 text-blue-400 border border-blue-800/50'
              }`}>
                {currentMode === 'repeat' ? '🔄 반복' : '📝 간단'}
              </span>
            )}
            
            {/* 하위 항목 통계 */}
            {hasChildren && (
              <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded-full border border-slate-600">
                {stats.completed}/{stats.total}
              </span>
            )}
          </div>
        </div>
        
        {/* 반복 카운터 (반복 모드 항목에서만) */}
        {currentMode === 'repeat' && !isCategory && (
          <RepeatCounter
            item={item}
            onIncrement={() => onIncrement(item.id)}
            onDecrement={() => onDecrement(item.id)}
            onSettings={() => onSettings(item)}
          />
        )}
        
        {/* 모드 변경 버튼들 (카테고리가 아닌 경우에만) */}
        {!isCategory && onModeChange && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ItemModeSelector
              item={item}
              onModeChange={onModeChange}
            />
          </div>
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