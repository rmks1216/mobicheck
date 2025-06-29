'use client';
import {useChecklistStore} from '@/lib/store/checklistStore';
import CheckboxIndet from '@/components/CheckboxIndet';

function getDescendantState(id, descendantMap, itemsMap) {
  // 체크리스트에 실제로 들어와 있는 하위만 필터링
  const present = descendantMap[id].filter((d) => itemsMap.has(d));
  
  if (present.length === 0) return { all: false, some: false }; // 리프 or 하위 없음
  
  const allChecked = present.every((d) => itemsMap.get(d).checked);
  const someChecked = present.some((d) => itemsMap.get(d).checked);
  
  return {
    all: allChecked,
    some: someChecked && !allChecked,
  };
}

export default function ChecklistPanel({idNameMap, descendantMap, ancestorMap}) {
  const {checklists, activeId, toggleCascade, renameChecklist} =
    useChecklistStore();
  const active = checklists.find((c) => c.id === activeId);
  
  // 1) 아직 체크리스트가 없으면 가드문으로 바로 리턴
  if (!active)
    return <p className="text-gray-500">체크리스트를 먼저 추가하세요.</p>;
  
  // 2) 여기! active.items → Map으로 변환
  const itemsMap = new Map(active.items.map((i) => [i.id, i]));
  
  // 3) 아래부터 JSX 반환
  return (
    <div>
      {/* 이름 인라인 편집 */}
      <input
        className="font-semibold text-xl mb-2 outline-none"
        value={active.name}
        onChange={(e) => renameChecklist(active.id, e.target.value)}
      />
      
      {/* 항목 렌더 */}
      <ul>
        {active.items.map((it) => {
          // 하위 체크 상태 계산용 함수 호출
          const {all, some} = getDescendantState(
            it.id,
            descendantMap,
            itemsMap
          );
          
          return (
            <li key={it.id} className="flex items-center gap-2">
              <CheckboxIndet
                checked={it.checked}
                indeterminate={some}
                onChange={() =>
                  toggleCascade(
                    it.id,
                    descendantMap[it.id],
                    ancestorMap[it.id],
                    descendantMap
                  )
                }
              />
              {idNameMap[it.id]}
            </li>
          );
        })}
        
        {active.items.length === 0 && (
          <li className="text-sm text-gray-400">
            좌측에서 항목을 클릭해 담아보세요
          </li>
        )}
      </ul>
    </div>
  );
}
