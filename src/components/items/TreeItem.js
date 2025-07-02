// src/components/items/TreeItem.js
'use client';
import { memo } from 'react';
import { categoryConfig, colorThemes } from './constants';

// 성능 최적화를 위한 메모이제이션
const TreeItem = memo(function TreeItem({
                                          node,
                                          onSelect,
                                          level = 0,
                                          isInChecklist = false, // 기본값 유지 (하위호환성)
                                          usageCount = 0, // 기본값 유지 (하위호환성)
                                          isExpanded, // 현재 노드의 확장 상태 (상위에서 전달받음)
                                          onToggleExpand, // 확장 토글 함수
                                          selectedItems,
                                          onItemSelect,
                                          isMultiSelect = false,
                                          onContextMenu,
                                          onToggleFavorite,
                                          expandedItems, // 전체 확장 상태를 추가로 받음
                                          currentChecklistItems, // 체크리스트 항목들 (개별 계산용)
                                          usageStats, // 사용 통계 (개별 계산용)
                                        }) {
  const config = categoryConfig[node.id] || { emoji: '📄', name: node.name, color: 'gray' };
  const hasChildren = node.children && node.children.length > 0;
  const isCategory = level === 0;
  const isSubCategory = level === 1;
  const isSelected = selectedItems?.has(node.id);
  
  // 현재 노드의 확장 상태 - expandedItems에서 직접 확인
  const currentIsExpanded = expandedItems?.has(node.id) || false;
  
  // 개별 상태 계산 - currentChecklistItems와 usageStats가 제공되면 사용
  const nodeIsInChecklist = currentChecklistItems ? currentChecklistItems.has(node.id) : isInChecklist;
  const nodeUsageCount = usageStats ? (usageStats.get(node.id) || 0) : usageCount;
  
  const handleToggleClick = (e) => {
    e.stopPropagation();
    if (hasChildren && onToggleExpand) {
      onToggleExpand(node.id);
    }
  };
  
  const handleClick = (e) => {
    if (isMultiSelect) {
      e.preventDefault();
      onItemSelect?.(node.id);
    } else {
      onSelect?.(node.id);
    }
  };
  
  const handleContextMenuClick = (e) => {
    e.preventDefault();
    onContextMenu?.(e, node);
  };
  
  return (
    <li className="relative">
      <div
        className={`
          group relative border rounded-lg transition-all duration-200 cursor-pointer
          ${colorThemes[config.color] || colorThemes.gray}
          ${isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white hover:shadow-sm'}
          ${isCategory ? 'shadow-sm border-gray-200' : ''}
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
                  isCategory ? 'text-base' : isSubCategory ? 'text-sm' : 'text-xs'
                } font-medium text-gray-900 truncate`}>
                  {config.name || node.name}
                </h3>
                
                {nodeIsInChecklist && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 flex-shrink-0">
                    ✓ 추가됨
                  </span>
                )}
                
                {nodeUsageCount > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 flex-shrink-0">
                    🔥 {nodeUsageCount}회
                  </span>
                )}
              </div>
              
              {hasChildren && !currentIsExpanded && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {node.children.map(child => {
                    const childConfig = categoryConfig[child.id] || {};
                    return childConfig.name || child.name;
                  }).join(', ')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasChildren && <ItemCount count={node.children.length} isCategory={isCategory} />}
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
      
      {/* 하위 항목들 렌더링 - 각 하위 항목의 독립적인 확장 상태 처리 */}
      {hasChildren && currentIsExpanded && (
        <ul className={`${level === 0 ? 'ml-4 mt-2 border-l-2 border-gray-100 pl-4' : 'ml-8 mt-1'}`}>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              level={level + 1}
              // 각 하위 항목의 개별 상태 계산을 위해 추가 props 전달
              currentChecklistItems={currentChecklistItems}
              usageStats={usageStats}
              // 각 하위 항목의 독립적인 확장 상태 전달
              isExpanded={expandedItems?.has(child.id) || false}
              onToggleExpand={onToggleExpand}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
              isMultiSelect={isMultiSelect}
              onContextMenu={onContextMenu}
              onToggleFavorite={onToggleFavorite}
              // expandedItems 전체를 하위로 전달
              expandedItems={expandedItems}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

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

TreeItem.displayName = 'TreeItem';

export default TreeItem;