'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';

export default function AddChecklistButton() {
  const { addChecklist } = useChecklistStore();

  return (
    <button
      className="px-3 py-2 rounded bg-blue-600 text-white"
      onClick={() => addChecklist('새 체크리스트')}
    >
      + 체크리스트 추가
    </button>
  );
}
