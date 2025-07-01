'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';
import CheckboxIndet from '@/components/CheckboxIndet';
import { useState } from 'react';

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

function calculateProgress(items) {
  if (items.length === 0) return 0;
  const completed = items.filter(item => item.checked).length;
  return Math.round((completed / items.length) * 100);
}

function getCompletionStats(id, descendantMap, itemsMap) {
  const descendants = descendantMap[id] || [];
  const presentDescendants = descendants.filter((d) => itemsMap.has(d));
  
  if (presentDescendants.length === 0) return { completed: 0, total: 0 };
  
  const completed = presentDescendants.filter(d => itemsMap.get(d).checked).length;
  return { completed, total: presentDescendants.length };
}

// 반복 항목 설정 모달 컴포넌트
function RepeatSettingsModal({ item, idNameMap, onClose, onSave }) {
  const [targetCount, setTargetCount] = useState(item.targetCount || 1);
  const [currentCount, setCurrentCount] = useState(item.currentCount || 0);
  
  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setTargetCount('');
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setTargetCount(numValue);
      // 현재 카운트가 새로운 목표값보다 크면 조정
      if (currentCount > numValue) {
        setCurrentCount(numValue);
      }
    }
  };
  
  const handleCurrentChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setCurrentCount('');
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCurrentCount(Math.min(numValue, targetCount || 1));
    }
  };
  
  const handleSave = () => {
    const finalTargetCount = targetCount === '' ? 1 : Math.max(1, parseInt(targetCount) || 1);
    const finalCurrentCount = currentCount === '' ? 0 : Math.max(0, Math.min(parseInt(currentCount) || 0, finalTargetCount));
    onSave(finalTargetCount, finalCurrentCount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-4">반복 설정</h3>
        <p className="text-sm text-gray-600 mb-4">
          {idNameMap[item.id] || item.id}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">목표 횟수</label>
            <input
              type="number"
              min="1"
              max="999"
              value={targetCount}
              onChange={handleTargetChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">현재 진행</label>
            <input
              type="number"
              min="0"
              max={targetCount || 999}
              value={currentCount}
              onChange={handleCurrentChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// 반복 카운터 컴포넌트
function RepeatCounter({ item, onIncrement, onDecrement, onSettings }) {
  const safeItem = {
    checked: item.checked || false,
    targetCount: item.targetCount || 1,
    currentCount: item.currentCount || 0
  };
  
  const isCompleted = safeItem.checked;
  const progress = safeItem.targetCount > 0 ? (safeItem.currentCount / safeItem.targetCount) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      {/* 진행 상황 표시 */}
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
          {safeItem.currentCount}/{safeItem.targetCount}
        </span>
        
        {/* 진행률 바 (작은 버전) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
      
      {/* 카운터 버튼들 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          disabled={safeItem.currentCount <= 0}
          className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
          title="횟수 감소"
        >
          -
        </button>
        
        <button
          onClick={onIncrement}
          disabled={safeItem.currentCount >= safeItem.targetCount}
          className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
          title="횟수 증가"
        >
          +
        </button>
        
        <button
          onClick={onSettings}
          className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors"
          title="반복 설정"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

export default function ChecklistPanel({idNameMap, descendantMap, ancestorMap}) {
  const {
    checklists,
    activeId,
    toggleCascade,
    renameChecklist,
    clearChecklist,
    uncheckAllItems,
    removeItem,
    incrementCount,
    decrementCount,
    setTargetCount,
    setCurrentCount,
    getTotalProgress
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
  const progress = calculateProgress(active.items);
  const totalProgress = getTotalProgress(active.id);
  
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
      {/* 리스트 정보 헤더 */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <input
          className="text-xl font-semibold bg-transparent border-none outline-none w-full text-blue-900 placeholder-blue-700"
          value={active.name}
          onChange={(e) => renameChecklist(active.id, e.target.value)}
          placeholder="체크리스트 이름"
        />
        
        <div className="flex items-center gap-4 mt-3 text-sm text-blue-700">
          <span>총 {active.items.length}개 항목</span>
          <span>•</span>
          <span>완료 {active.items.filter(i => i.checked).length}개</span>
          <span>•</span>
          <span className="text-blue-600 font-medium">{progress}% 항목 완료</span>
          <span>•</span>
          <span className="text-purple-600 font-medium">{totalProgress}% 전체 진행</span>
        </div>
        
        {/* 진행률 바 - 이중 표시 */}
        <div className="space-y-2 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium w-16">항목 완료</span>
            <div className="flex-1 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{width: `${progress}%`}}
              />
            </div>
            <span className="text-xs text-blue-600 w-10">{progress}%</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-purple-600 font-medium w-16">전체 진행</span>
            <div className="flex-1 bg-purple-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{width: `${totalProgress}%`}}
              />
            </div>
            <span className="text-xs text-purple-600 w-10">{totalProgress}%</span>
          </div>
        </div>
        
        {/* 액션 버튼들 */}
        {active.items.length > 0 && (
          <div className="flex gap-2 mt-4">
            <button
              className="px-3 py-1.5 text-xs bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              onClick={() => uncheckAllItems(active.id)}
              title="모든 항목 초기화"
            >
              🔄 초기화
            </button>
            <button
              className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              onClick={() => {
                if (confirm(`"${active.name}"의 모든 항목을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
                  clearChecklist(active.id);
                }
              }}
              title="모든 항목 삭제"
            >
              🗑️ 전체 삭제
            </button>
          </div>
        )}
      </div>
      
      {/* 체크리스트 항목들 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {active.items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg font-medium mb-2">아직 항목이 없습니다</p>
            <p className="text-sm">좌측에서 항목을 클릭해서 추가해보세요</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* 레벨 0 (최상위 카테고리) */}
            {itemsByLevel[0]?.map((item) => {
              const {all, some} = getDescendantState(item.id, descendantMap, itemsMap);
              const {completed, total} = getCompletionStats(item.id, descendantMap, itemsMap);
              const emoji = itemEmojis[item.id] || '📄';
              
              return (
                <div key={item.id} className="mb-6">
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                    <CheckboxIndet
                      checked={item.checked}
                      indeterminate={some}
                      onChange={() =>
                        toggleCascade(
                          item.id,
                          descendantMap[item.id] || [],
                          ancestorMap[item.id] || [],
                          descendantMap
                        )
                      }
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-lg">{emoji}</span>
                      <span className={`font-medium ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {idNameMap[item.id] || item.id}
                      </span>
                      {total > 0 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {completed}/{total}
                        </span>
                      )}
                    </div>
                    
                    {/* 반복 카운터 */}
                    <RepeatCounter
                      item={item}
                      onIncrement={() => incrementCount(item.id)}
                      onDecrement={() => decrementCount(item.id)}
                      onSettings={() => setSettingsModal(item)}
                    />
                    
                    {/* 개별 삭제 버튼 */}
                    <button
                      className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all text-xs font-bold opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`"${idNameMap[item.id] || item.id}"을(를) 체크리스트에서 제거하시겠습니까?`)) {
                          removeItem(item.id);
                        }
                      }}
                      title="항목 삭제"
                    >
                      ✕
                    </button>
                  </div>
                  
                  {/* 레벨 1 (하위 카테고리) */}
                  {itemsByLevel[1]?.filter(subItem =>
                    ancestorMap[subItem.id]?.[0] === item.id
                  ).map((subItem) => {
                    const {all: subAll, some: subSome} = getDescendantState(subItem.id, descendantMap, itemsMap);
                    const {completed: subCompleted, total: subTotal} = getCompletionStats(subItem.id, descendantMap, itemsMap);
                    const subEmoji = itemEmojis[subItem.id] || '📂';
                    
                    return (
                      <div key={subItem.id} className="ml-8 mb-4">
                        <div className="flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                          <CheckboxIndet
                            checked={subItem.checked}
                            indeterminate={subSome}
                            onChange={() =>
                              toggleCascade(
                                subItem.id,
                                descendantMap[subItem.id] || [],
                                ancestorMap[subItem.id] || [],
                                descendantMap
                              )
                            }
                          />
                          <div className="flex items-center gap-2 flex-1">
                            <span>{subEmoji}</span>
                            <span className={`text-sm font-medium ${subItem.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                              {idNameMap[subItem.id] || subItem.id}
                            </span>
                            {subTotal > 0 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {subCompleted}/{subTotal}
                              </span>
                            )}
                          </div>
                          
                          {/* 반복 카운터 */}
                          <RepeatCounter
                            item={subItem}
                            onIncrement={() => incrementCount(subItem.id)}
                            onDecrement={() => decrementCount(subItem.id)}
                            onSettings={() => setSettingsModal(subItem)}
                          />
                          
                          {/* 개별 삭제 버튼 */}
                          <button
                            className="w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all text-xs font-bold opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`"${idNameMap[subItem.id] || subItem.id}"을(를) 체크리스트에서 제거하시겠습니까?`)) {
                                removeItem(subItem.id);
                              }
                            }}
                            title="항목 삭제"
                          >
                            ✕
                          </button>
                        </div>
                        
                        {/* 레벨 2 (개별 항목들) */}
                        <div className="ml-6 space-y-1">
                          {itemsByLevel[2]?.filter(leafItem =>
                            ancestorMap[leafItem.id]?.[0] === subItem.id
                          ).map((leafItem) => {
                            const leafEmoji = itemEmojis[leafItem.id] || '•';
                            
                            return (
                              <div key={leafItem.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors group">
                                <CheckboxIndet
                                  checked={leafItem.checked}
                                  onChange={() =>
                                    toggleCascade(
                                      leafItem.id,
                                      [],
                                      ancestorMap[leafItem.id] || [],
                                      descendantMap
                                    )
                                  }
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-sm">{leafEmoji}</span>
                                  <span className={`text-sm ${leafItem.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {idNameMap[leafItem.id] || leafItem.id}
                                  </span>
                                </div>
                                
                                {/* 반복 카운터 */}
                                <RepeatCounter
                                  item={leafItem}
                                  onIncrement={() => incrementCount(leafItem.id)}
                                  onDecrement={() => decrementCount(leafItem.id)}
                                  onSettings={() => setSettingsModal(leafItem)}
                                />
                                
                                {/* 개별 삭제 버튼 */}
                                <button
                                  className="w-4 h-4 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-all text-xs font-bold opacity-0 group-hover:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`"${idNameMap[leafItem.id] || leafItem.id}"을(를) 체크리스트에서 제거하시겠습니까?`)) {
                                      removeItem(leafItem.id);
                                    }
                                  }}
                                  title="항목 삭제"
                                >
                                  ✕
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* 반복 설정 모달 */}
      {settingsModal && (
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