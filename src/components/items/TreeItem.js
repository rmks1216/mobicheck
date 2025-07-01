import { useState } from 'react';
import { categoryConfig, colorThemes } from './constants';

function ItemCount({ count, isCategory = false }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
      isCategory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
    }`}>
      {count}개
    </span>
  );
}

export default function TreeItem({
                                   node,
                                   onSelect,
                                   level = 0,
                                   isInChecklist = false,
                                   usageCount = 0,
                                   isExpanded = true,
                                   onToggleExpand,
                                   selectedItems = new Set(),
                                   onItemSelect,
                                   isMultiSelect = false,
                                   onContextMenu,
                                   onToggleFavorite
                                 }) {
  const config = categoryConfig[node.id] || { emoji: '📄', icon: '📄', color: 'gray' };
  const theme = colorThemes[config.color] || colorThemes.gray;
  const isCategory = level === 0;
  const isSubCategory = level === 1;
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedItems.has(node.id);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleClick = (e) => {
    if (isMultiSelect && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onItemSelect(node.id);
    } else {
      onSelect(node.id);
    }
  };
  
  const handleContextMenu = (e) => {
    e.preventDefault();
    onContextMenu({ x: e.clientX, y: e.clientY, item: node });
  };
  
  const handleDragStart = (e) => {
    setIsDragging(true);
    const dragData = { id: node.id, name: config.name || node.name, type: 'item' };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
  };
  
  return (
    <li className="mb-1">
      <div className="flex items-center gap-2 group">
        {isMultiSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onItemSelect(node.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div
          className={`flex-1 text-left p-3 rounded-lg transition-all duration-200 border cursor-pointer ${theme} ${
            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          } ${isInChecklist ? 'bg-green-50 border-green-200' : 'border-transparent'} ${
            isDragging ? 'opacity-50 scale-95' : ''
          } ${isCategory ? 'font-medium shadow-sm' : isSubCategory ? 'font-normal' : 'text-sm'}`}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          onDragEnd={() => setIsDragging(false)}
          draggable
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {hasChildren && (
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
                  className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                >
                  <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              <div className="flex items-center gap-2">
                <span className={isCategory ? 'text-2xl' : isSubCategory ? 'text-lg' : 'text-base'}>{config.emoji}</span>
                <span className="text-xs opacity-60">{config.icon}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`${isCategory ? 'text-base' : isSubCategory ? 'text-sm' : 'text-xs'} font-medium text-gray-900`}>
                    {config.name || node.name}
                  </h3>
                  
                  {isInChecklist && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      ✓ 추가됨
                    </span>
                  )}
                  
                  {usageCount > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                      🔥 {usageCount}회
                    </span>
                  )}
                </div>
                
                {hasChildren && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {node.children.map(child => {
                      const childConfig = categoryConfig[child.id] || {};
                      return childConfig.name || child.name;
                    }).join(', ')}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {hasChildren && <ItemCount count={node.children.length} isCategory={isCategory} />}
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="체크리스트에 추가"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(node.id); }}
                  className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
                  title="즐겨찾기에 추가"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {hasChildren && isExpanded && (
        <ul className={`${level === 0 ? 'ml-4 mt-2 border-l-2 border-gray-100 pl-4' : 'ml-8 mt-1'}`}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              level={level + 1}
              isInChecklist={isInChecklist}
              usageCount={usageCount}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
              isMultiSelect={isMultiSelect}
              onContextMenu={onContextMenu}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </ul>
      )}
    </li>
  );
}