import { memo, useCallback } from 'react';
import { categoryConfig, colorThemes } from './constants';

// 항목 개수 표시 컴포넌트
function ItemCount({ count, isCategory }) {
  return (
    <span className={`
      inline-flex items-center justify-center rounded-full text-xs font-medium
      ${isCategory
      ? 'bg-blue-100 text-blue-700 px-2 py-1'
      : 'bg-gray-100 text-gray-600 px-1.5 py-0.5'
    }
    `}>
      {count}
    </span>
  );
}

// 검색 경로 표시 컴포넌트
function SearchPath({ path, categoryConfig }) {
  if (!path || path.length <= 1) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      {path.slice(0, -1).map((id, index) => {
        const config = categoryConfig[id] || {};
        return (
          <span key={id} className="flex items-center gap-1">
            {index > 0 && <span className="text-gray-400">/</span>}
            <span>{config.emoji} {config.name || id}</span>
          </span>
        );
      })}
    </div>
  );
}

const TreeItem = memo(function TreeItem({
                                          node,
                                          onSelect,
                                          level = 0,
                                          isExpanded,
                                          onToggleExpand,
                                          selectedItems,
                                          onItemSelect,
                                          isMultiSelect,
                                          onContextMenu,
                                          onToggleFavorite,
                                          expandedItems,
                                          currentChecklistItems,
                                          usageStats,
                                          renderHighlightedText,
                                          searchPath
                                        }) {
  const config = categoryConfig[node.id] || {};
  const hasChildren = node.children && node.children.length > 0;
  const isCategory = level === 0 && hasChildren;
  const isSubCategory = level === 1 && hasChildren;
  const isSelected = selectedItems?.has(node.id);
  const isInChecklist = currentChecklistItems?.some(item => item.id === node.id);
  const usageCount = usageStats?.get(node.id) || 0;
  
  // 현재 노드의 확장 상태
  const currentIsExpanded = expandedItems?.has(node.id) || isExpanded || false;
  
  // 하위 항목 개수 계산
  const getChildCount = useCallback((item) => {
    if (!item.children) return 0;
    return item.children.reduce((count, child) => {
      return count + 1 + getChildCount(child);
    }, 0);
  }, []);
  
  const childCount = hasChildren ? getChildCount(node) : 0;
  
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (isMultiSelect) {
      onItemSelect?.(node.id);
    } else {
      onSelect?.(node.id);
    }
  }, [isMultiSelect, onItemSelect, onSelect, node.id]);
  
  const handleToggleClick = useCallback((e) => {
    e.stopPropagation();
    onToggleExpand?.(node.id);
  }, [onToggleExpand, node.id]);
  
  const handleContextMenuClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu?.(e, node);
  }, [onContextMenu, node]);
  
  // 하이라이트된 텍스트 렌더링
  const displayName = config.name || node.name;
  const renderedName = node.highlightIndices && renderHighlightedText
    ? renderHighlightedText(displayName, node.highlightIndices)
    : displayName;
  
  return (
    <li className="relative">
      {/* 검색 경로 표시 (플랫 뷰에서만) */}
      {searchPath && <SearchPath path={searchPath} categoryConfig={categoryConfig} />}
      
      <div
        className={`
          group relative border rounded-lg transition-all duration-200 cursor-pointer
          ${colorThemes[config.color] || colorThemes.gray}
          ${isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white hover:shadow-sm'}
          ${isCategory ? 'shadow-sm border-gray-200' : ''}
          ${node.matchedText ? 'ring-2 ring-yellow-400 ring-opacity-30' : ''}
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenuClick}
      >
        <div className={`p-${isCategory ? '4' : isSubCategory ? '3' : '2'}`}>
          <div className="flex items-center gap-3">
            {/* 폴딩 버튼 */}
            {hasChildren && (
              <button
                onClick={handleToggleClick}
                className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                aria-label={currentIsExpanded ? "접기" : "펼치기"}
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    currentIsExpanded ? 'rotate-90' : 'rotate-0'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            
            {/* 다중 선택 체크박스 */}
            {isMultiSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onItemSelect?.(node.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            )}
            
            {/* 아이콘 영역 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`${isCategory ? 'text-2xl' : isSubCategory ? 'text-lg' : 'text-base'}`}>
                {config.emoji}
              </span>
              <span className="text-xs opacity-60">{config.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`${
                  isCategory ? 'text-base' : isSubCategory ? 'text-sm' : 'text-sm'
                } font-${isCategory ? 'semibold' : 'medium'} truncate`}>
                  {renderedName}
                </h3>
                
                {/* 상태 표시 배지들 */}
                <div className="flex items-center gap-1">
                  {isInChecklist && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ 추가됨
                    </span>
                  )}
                  
                  {usageCount > 0 && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {usageCount}회
                    </span>
                  )}
                  
                  {hasChildren && <ItemCount count={childCount} isCategory={isCategory} />}
                </div>
              </div>
              
              {/* 빠른 액션 버튼들 - 호버 시 표시 */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onSelect?.(node.id); }}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="체크리스트에 추가"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite?.(node.id); }}
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
      
      {/* 하위 항목들 렌더링 */}
      {hasChildren && currentIsExpanded && (
        <ul className={`${level === 0 ? 'ml-4 mt-2 border-l-2 border-gray-100 pl-4' : 'ml-8 mt-1'}`}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              level={level + 1}
              currentChecklistItems={currentChecklistItems}
              usageStats={usageStats}
              isExpanded={expandedItems?.has(child.id) || false}
              onToggleExpand={onToggleExpand}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
              isMultiSelect={isMultiSelect}
              onContextMenu={onContextMenu}
              onToggleFavorite={onToggleFavorite}
              expandedItems={expandedItems}
              renderHighlightedText={renderHighlightedText}
              searchPath={child.path}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

TreeItem.displayName = 'TreeItem';

export default TreeItem;