'use client';

import dynamic from 'next/dynamic';

const TreeItem = dynamic(() => import('../TreeItem'));
const VirtualizedList = dynamic(() => import('../VirtualizedList'));

const GridView = ({ items, handleSelect, categoryConfig, usageStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    {items.map((node) => (
      <div key={node.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer" onClick={() => handleSelect(node.id)}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryConfig[node.id]?.emoji || '📄'}</span>
          <h3 className="font-medium text-gray-900">{categoryConfig[node.id]?.name || node.name}</h3>
        </div>
        {node.children && <p className="text-sm text-gray-500">{node.children.length}개 하위 항목</p>}
        {usageStats.get(node.id) > 0 && <div className="mt-2"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">🔥 {usageStats.get(node.id)}회 사용</span></div>}
      </div>
    ))}
  </div>
);

const CompactView = ({ items, handleSelect, categoryConfig, currentChecklistItems }) => (
  <div className="p-4">
    {items.map((node) => (
      <div key={node.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => handleSelect(node.id)}>
        <span className="text-lg">{categoryConfig[node.id]?.emoji || '📄'}</span>
        <span className="flex-1 text-sm">{categoryConfig[node.id]?.name || node.name}</span>
        {node.children && <span className="text-xs text-gray-500">{node.children.length}</span>}
        {currentChecklistItems.has(node.id) && <span className="text-green-500">✓</span>}
      </div>
    ))}
  </div>
);

export default function ItemsList({ viewMode, filteredItems, ...props }) {
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
        <p className="text-sm">다른 검색어를 시도해보세요</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      {viewMode === 'tree' && (
        <ul className="p-4">
          {filteredItems.map((node) => (
            <TreeItem key={node.id} node={node} {...props} />
          ))}
        </ul>
      )}
      {viewMode === 'grid' && <GridView items={filteredItems} {...props} />}
      {viewMode === 'compact' && <CompactView items={filteredItems} {...props} />}
    </div>
  );
}
