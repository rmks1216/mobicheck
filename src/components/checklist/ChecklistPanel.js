'use client';
import { useChecklistStore } from '@/lib/store/checklistStore';
import { useState } from 'react';
import ChecklistHeader from './ChecklistHeader';
import ChecklistItem from './ChecklistItem';
import { RepeatSettingsModal } from './RepeatComponents';

function getItemLevel(id, ancestorMap) {
  return ancestorMap[id]?.length || 0;
}

export default function ChecklistPanel({ idNameMap, descendantMap, ancestorMap }) {
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
  
  // 레벨별로 항목 그룹화
  const itemsByLevel = active.items.reduce((acc, item) => {
    const level = getItemLevel(item.id, ancestorMap);
    if (!acc[level]) acc[level] = [];
    acc[level].push(item);
    return acc;
  }, {});
  
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
          <div className="p-4 space-y-6">
            {Object.keys(itemsByLevel)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((level) => {
                const levelItems = itemsByLevel[level];
                
                return (
                  <div key={level} className="space-y-3">
                    {/* 레벨 헤더 (레벨 0 이상만 표시) */}
                    {parseInt(level) > 0 && (
                      <div
                        className="text-xs font-medium text-gray-500 uppercase tracking-wide border-b pb-1"
                        style={{ paddingLeft: `${parseInt(level) * 12}px` }}
                      >
                        Level {level}
                      </div>
                    )}
                    
                    {levelItems.map((item) => (
                      <ChecklistItem
                        key={item.id}
                        item={item}
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
                );
              })}
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