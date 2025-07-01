'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';
import CheckboxIndet from '@/components/CheckboxIndet';

// 아이템별 이모지 매핑 (ItemsPanel과 동일)
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
  // descendantMap[id]가 undefined일 수 있으므로 안전하게 처리
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
  // descendantMap[id]가 undefined일 수 있으므로 안전하게 처리
  const descendants = descendantMap[id] || [];
  const presentDescendants = descendants.filter((d) => itemsMap.has(d));
  
  if (presentDescendants.length === 0) return { completed: 0, total: 0 };
  
  const completed = presentDescendants.filter(d => itemsMap.get(d).checked).length;
  return { completed, total: presentDescendants.length };
}

export default function ChecklistPanel({idNameMap, descendantMap, ancestorMap}) {
  const {checklists, activeId, toggleCascade, renameChecklist, clearChecklist, uncheckAllItems, removeItem} = useChecklistStore();
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
  
  // 레벨별로 항목 그룹화
  const itemsByLevel = active.items.reduce((acc, item) => {
    const level = getItemLevel(item.id, ancestorMap);
    if (!acc[level]) acc[level] = [];
    acc[level].push(item);
    return acc;
  }, {});
  
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
          <span className="text-blue-600 font-medium">{progress}% 진행</span>
        </div>
        
        {/* 진행률 바 */}
        <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{width: `${progress}%`}}
          ></div>
        </div>
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
                  <div className="flex items-center gap-3 mb-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
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
                        {idNameMap[item.id]}
                      </span>
                      {total > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          completed === total
                            ? 'bg-green-100 text-green-700'
                            : completed > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {completed}/{total} 완료
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 레벨 1 하위 항목들 */}
                  <div className="ml-6 space-y-2">
                    {itemsByLevel[1]?.filter(subItem =>
                      ancestorMap[subItem.id]?.[0] === item.id
                    ).map((subItem) => {
                      const {all: subAll, some: subSome} = getDescendantState(subItem.id, descendantMap, itemsMap);
                      const {completed: subCompleted, total: subTotal} = getCompletionStats(subItem.id, descendantMap, itemsMap);
                      const subEmoji = itemEmojis[subItem.id] || '📄';
                      
                      return (
                        <div key={subItem.id}>
                          <div className="flex items-center gap-3 mb-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ml-4">
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
                              <span className={`${subItem.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                {idNameMap[subItem.id]}
                              </span>
                              {subTotal > 0 && (
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  subCompleted === subTotal
                                    ? 'bg-green-100 text-green-700'
                                    : subCompleted > 0
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {subCompleted}/{subTotal}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* 레벨 2 하위 항목들 */}
                          <div className="ml-6 space-y-1">
                            {itemsByLevel[2]?.filter(leafItem =>
                              ancestorMap[leafItem.id]?.[0] === subItem.id
                            ).map((leafItem) => {
                              const leafEmoji = itemEmojis[leafItem.id] || '📄';
                              
                              return (
                                <div key={leafItem.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors">
                                  <CheckboxIndet
                                    checked={leafItem.checked}
                                    indeterminate={false}
                                    onChange={() =>
                                      toggleCascade(
                                        leafItem.id,
                                        descendantMap[leafItem.id] || [],
                                        ancestorMap[leafItem.id] || [],
                                        descendantMap
                                      )
                                    }
                                  />
                                  <span className="text-sm">{leafEmoji}</span>
                                  <span className={`text-sm ${leafItem.checked ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                                    {idNameMap[leafItem.id]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}