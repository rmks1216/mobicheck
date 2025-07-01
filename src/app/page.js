import fs from 'node:fs/promises';
import path from 'node:path';
import ItemsPanel from '@/components/ItemsPanel';
import ChecklistTabs from '@/components/checklist/ChecklistTabs';
import ChecklistPanel from '@/components/checklist/ChecklistPanel';
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
    <div className="bg-gray-50 min-h-screen">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">📋 마비노기 모바일 체크리스트 (MobiCheck) Alpha v1.0.0</h1>
          <p className="text-gray-600 text-sm mt-1">항목을 클릭하여 체크리스트에 추가하고 관리하세요</p>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 좌측: 전체 항목 패널 */}
          <ItemsPanel
            allItems={allItems}
            descendantMap={descendantMap}
            ancestorMap={ancestorMap}
          />
          
          {/* 우측: 체크리스트 패널 */}
          <section className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
              <ChecklistTabs />
              <div className="flex-1 flex flex-col">
                <ChecklistPanel
                  allItems={allItems}
                  idNameMap={idNameMap}
                  descendantMap={descendantMap}
                  ancestorMap={ancestorMap}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}