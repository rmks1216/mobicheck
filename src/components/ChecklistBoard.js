'use client';

import { useChecklistStore } from '@/lib/store/checklistStore';
import AddChecklistButton from './checklist/board_components/AddChecklistButton';
import ChecklistCard from './checklist/board_components/ChecklistCard';

export default function ChecklistBoard({ allItems }) {
  const { checklists } = useChecklistStore();

  return (
    <section className="space-y-8">
      <AddChecklistButton />

      <div className="space-y-4">
        {checklists.map((cl) => (
          <ChecklistCard key={cl.id} checklist={cl} allItems={allItems} />
        ))}
      </div>
    </section>
  );
}
