'use client';
import { useChecklistStore } from '@/lib/store/checklistStore';
import { useState } from 'react';
import ChecklistHeader from './ChecklistHeader';
import ChecklistItem from './ChecklistItem';
import { RepeatSettingsModal } from './RepeatComponents';

// 카테고리별 이모지 매핑
const categoryEmojis = {
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

// 원본 트리 구조를 기반으로 체크리스트 항목들을 재구성하는 함수
function buildChecklistTree(allItems, checklistItems, idNameMap) {
  const itemsMap = new Map(checklistItems.map(item => [item.id, item]));
  
  function filterTreeNode(node) {
    // 현재 노드가 체크리스트에 있는지 확인
    const hasCurrentItem = itemsMap.has(node.id);
    
    // 하위 노드들을 재귀적으로 필터링
    const filteredChildren = node.children
      ? node.children.map(filterTreeNode).filter(Boolean)
      : [];
    
    // 현재 노드가 체크리스트에 있거나, 하위에 포함된 항목이 있으면 노드를 유지
    if (hasCurrentItem || filteredChildren.length > 0) {
      return {
        ...node,
        checklistItem: hasCurrentItem ? itemsMap.get(node.id) : null,
        children: filteredChildren
      };
    }
    
    return null;
  }
  
  return allItems.map(filterTreeNode).filter(Boolean);
}

// 체크리스트 트리 항목 렌더링 컴포넌트 (혼합 모드 지원)
function ChecklistTreeItem({
                             node,
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
                             level = 0
                           }) {
  const emoji = categoryEmojis[node.id] || '📋';
  const isCategory = level === 0;
  const isSubCategory = level === 1;
  
  return (
    <div className="space-y-2">
      {/* 현재 노드가 체크리스트에 있으면 ChecklistItem으로 렌더링 */}
      {node.checklistItem && (
        <ChecklistItem
          item={node.checklistItem}
          checklist={checklist}
          idNameMap={idNameMap}
          descendantMap={descendantMap}
          ancestorMap={ancestorMap}
          itemsMap={itemsMap}
          onToggle={onToggle}
          onRemove={onRemove}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          onSettings={onSettings}
          onModeChange={onModeChange}
          customLevel={level}
        />
      )}
      
      {/* 하위 항목들 렌더링 */}
      {node.children && node.children.length > 0 && (
        <div className={level > 0 ? "ml-4" : ""}>
          {node.children.map(child => (
            <ChecklistTreeItem
              key={child.id}
              node={child}
              checklist={checklist}
              idNameMap={idNameMap}
              descendantMap={descendantMap}
              ancestorMap={ancestorMap}
              itemsMap={itemsMap}
              onToggle={onToggle}
              onRemove={onRemove}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onSettings={onSettings}
              onModeChange={onModeChange}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChecklistPanel() {
  const {
    checklists,
    activeId,
    allItems,
    renameChecklist,
    removeItem,
    uncheckAllItems,
    clearChecklist,
    toggleCascade,
    incrementCount,
    decrementCount,
    getProgressInfo,
    setTargetCount,
    setCurrentCount,
    setItemMode,
    descendantMap,
    ancestorMap,
    findItemById,
    getIdNameMap
  } = useChecklistStore();
  
  const [settingsModal, setSettingsModal] = useState(null);
  
  const active = checklists.find(c => c.id === activeId);
  if (!active) return null;
  
  const idNameMap = getIdNameMap();
  const progressInfo = getProgressInfo(activeId);
  
  // 카테고리 항목을 제외한 체크리스트 항목들
  const nonCategoryChecklistItems = active.items.filter(item => {
    const fullItem = findItemById(allItems, item.id);
    return fullItem && !(fullItem.children && fullItem.children.length > 0);
  });
  
  const itemsMap = new Map(active.items.map(item => [item.id, item]));
  const checklistTree = buildChecklistTree(allItems, active.items, idNameMap);
  
  const handleRemoveItem = (itemId) => {
    removeItem(itemId, descendantMap);
  };
  
  const handleSaveSettings = (targetCount, currentCount) => {
    if (settingsModal) {
      setTargetCount(settingsModal.id, targetCount);
      setCurrentCount(settingsModal.id, currentCount);
      setSettingsModal(null);
    }
  };
  
  const handleModeChange = (itemId, newMode) => {
    if (confirm(`항목을 "${newMode === 'simple' ? '간단 체크' : '반복 관리'}" 모드로 변경하시겠습니까?\n진행상태가 초기화됩니다.`)) {
      setItemMode(itemId, newMode);
    }
  };
  
  return (
    <div className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 h-full flex flex-col">
      {/* 헤더 */}
      <ChecklistHeader
        checklist={{ ...active, items: nonCategoryChecklistItems }}
        progressInfo={progressInfo}
        onRename={(name) => renameChecklist(active.id, name)}
        onClearAll={() => uncheckAllItems(active.id)}
        onDeleteAll={() => clearChecklist(active.id)}
      />
      
      {/* 체크리스트 항목들 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {active.items.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-medium mb-2 text-slate-300">항목을 추가해보세요</p>
            <p className="text-sm">좌측에서 원하는 항목을 클릭하여 추가할 수 있습니다</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {checklistTree.map(node => (
              <ChecklistTreeItem
                key={node.id}
                node={node}
                checklist={active}
                idNameMap={idNameMap}
                descendantMap={descendantMap}
                ancestorMap={ancestorMap}
                itemsMap={itemsMap}
                onToggle={toggleCascade}
                onRemove={handleRemoveItem}
                onIncrement={incrementCount}
                onDecrement={decrementCount}
                onSettings={setSettingsModal}
                onModeChange={handleModeChange}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 반복 설정 모달 (반복 모드 항목에서만) */}
      {settingsModal && settingsModal.itemMode === 'repeat' && (
        <RepeatSettingsModal
          item={settingsModal}
          idNameMap={idNameMap}
          onClose={() => setSettingsModal(null)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
}