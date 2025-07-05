'use client';

import dynamic from 'next/dynamic';

const TreeItem = dynamic(() => import('../TreeItem'));
const VirtualizedList = dynamic(() => import('../VirtualizedList'));

const GridView = ({ items, handleSelect, categoryConfig, usageStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
    {items.map((node) => (
      <div
        key={node.id}
        className="flex flex-col h-full bg-slate-700 border border-slate-600 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
        onClick={() => handleSelect(node.id)}
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{categoryConfig[node.id]?.emoji || '📄'}</span>
          <h3 className="font-medium text-slate-200">{categoryConfig[node.id]?.name || node.name}</h3>
        </div>
        <div className="mb-auto">
          {node.children && <p className="text-sm text-slate-400">{node.children.length}개 하위 항목</p>}
        </div>
        {usageStats.get(node.id) > 0 && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-900/30 text-amber-400 border border-amber-800/50">
              🔥 {usageStats.get(node.id)}회 사용
            </span>
          </div>
        )}
      </div>
    ))}
  </div>
);

const CompactView = ({ items, handleSelect, categoryConfig, currentChecklistItems }) => (
  <div className="p-4">
    {items.map((node) => (
      <div
        key={node.id}
        className="flex text-slate-200 items-center gap-3 py-2.5 hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors border-b border-slate-600 last:border-b-0"
        onClick={() => handleSelect(node.id)}
      >
        <span className="text-lg">{categoryConfig[node.id]?.emoji || '📄'}</span>
        <span className="flex-1 text-sm">{categoryConfig[node.id]?.name || node.name}</span>
        {node.children && <span className="text-xs text-slate-400">{node.children.length}</span>}
        {currentChecklistItems.has(node.id) && <span className="text-green-400">✓</span>}
      </div>
    ))}
  </div>
);

export default function ItemsList({ viewMode, filteredItems, ...props }) {
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <div className="text-4xl mb-4">🤔</div>
        <p className="text-lg font-medium mb-2 text-slate-300">아직 항목이 없거나 검색 결과가 없습니다.</p>
        <p className="text-sm">새로운 항목을 추가하거나 다른 검색어를 시도해보세요.</p>
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
      {viewMode === 'grid' && <GridView items={filteredItems} handleSelect={props.onSelect} {...props} />}
      {viewMode === 'compact' && <CompactView items={filteredItems} handleSelect={props.onSelect} {...props} />}
    </div>
  );
}