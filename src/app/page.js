import fs from 'node:fs/promises';
import path from 'node:path';
import ItemsPanel from '@/components/ItemsPanel';
import ChecklistTabs from '@/components/ChecklistTabs';
import ChecklistPanel from '@/components/ChecklistPanel';
import {buildMaps} from '@/lib/utils/treeMaps';

async function getItems() {
  const file = path.join(process.cwd(), 'public/items.json');
  const text = await fs.readFile(file, 'utf-8');
  return JSON.parse(text);
}

export default async function HomePage() {
  const allItems = await getItems();
  const {idNameMap, descendantMap, ancestorMap} = buildMaps(allItems);
  
  return (
    <main className="flex p-6 gap-6">
      {/* 좌측: 전체 항목 */}
      <ItemsPanel allItems={allItems} descendantMap={descendantMap} ancestorMap={ancestorMap} />
      
      {/* 우측: 체크리스트 */}
      <section className="w-1/2">
        <ChecklistTabs/>
        <ChecklistPanel
          idNameMap={idNameMap}
          descendantMap={descendantMap}
          ancestorMap={ancestorMap}
        />
      </section>
    </main>
  );
}