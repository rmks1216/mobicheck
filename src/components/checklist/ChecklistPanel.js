'use client';
import { useChecklistStore } from '@/lib/store/checklistStore';
import { useState } from 'react';
import ChecklistHeader from './ChecklistHeader';
import ChecklistItem from './ChecklistItem';
import { RepeatSettingsModal } from './RepeatComponents';

// 카테고리별 이모지 매핑
const categoryEmojis = {
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

// 체크리스트 트리 항목 렌더링 컴포넌트
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
          customLevel={level}
        />
      )}
      
      {/* 하위 항목들 렌더링 */}
      {node.children && node.children.length > 0 && (
        <div className={level > 0 ? "ml-6" : ""}>
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
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChecklistPanel({ allItems, idNameMap, descendantMap, ancestorMap }) {
  const {
    checklists,
    activeId,
    toggleCascade,
    renameChecklist,
    setChecklistMode,
    clearChecklist,
    uncheckAllItems,
    removeItem,
    incrementCount,
    decrementCount,
    setTargetCount,
    setCurrentCount,
    getProgressInfo
  } = useChecklistStore();
  
  const [settingsModal, setSettingsModal] = useState(null);
  
  const active = checklists.find((c) => c.id === activeId);
  
  if (!active) {
    return (
      <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg font-medium mb-2">체크리스트를 먼저 추가하세요</p>
            <p className="text-sm">우측 상단의 "+ 새 리스트" 버튼을 클릭해보세요</p>
          </div>
        </div>
      </div>
    );
  }
  
  const itemsMap = new Map(active.items.map((i) => [i.id, i]));
  const progressInfo = getProgressInfo(active.id);
  
  // 원본 트리 구조를 기반으로 체크리스트 트리 구성
  const checklistTree = buildChecklistTree(allItems, active.items, idNameMap);
  
  const handleSaveSettings = (targetCount, currentCount) => {
    if (settingsModal) {
      setTargetCount(settingsModal.id, targetCount);
      setCurrentCount(settingsModal.id, currentCount);
      setSettingsModal(null);
    }
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      {/* 헤더 */}
      <ChecklistHeader
        checklist={active}
        progressInfo={progressInfo}
        onRename={(name) => renameChecklist(active.id, name)}
        onModeChange={(mode) => setChecklistMode(active.id, mode)}
        onClearAll={() => uncheckAllItems(active.id)}
        onDeleteAll={() => clearChecklist(active.id)}
      />
      
      {/* 체크리스트 항목들 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {active.items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-lg font-medium mb-2">항목을 추가해보세요</p>
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
                onRemove={removeItem}
                onIncrement={incrementCount}
                onDecrement={decrementCount}
                onSettings={setSettingsModal}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* 반복 설정 모달 */}
      {settingsModal && active.mode === 'repeat' && (
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