// src/components/items/TreeItem.js
'use client';
import { memo } from 'react';
import { categoryConfig, colorThemes } from './constants';

// 다크모드 색상 테마 (constants.js와 동일하게 업데이트 필요)
const darkColorThemes = {
  blue: 'hover:bg-blue-900/20 hover:border-blue-600 text-blue-400 border-blue-800/50',
  purple: 'hover:bg-purple-900/20 hover:border-purple-600 text-purple-400 border-purple-800/50',
  indigo: 'hover:bg-indigo-900/20 hover:border-indigo-600 text-indigo-400 border-indigo-800/50',
  green: 'hover:bg-green-900/20 hover:border-green-600 text-green-400 border-green-800/50',
  pink: 'hover:bg-pink-900/20 hover:border-pink-600 text-pink-400 border-pink-800/50',
  orange: 'hover:bg-orange-900/20 hover:border-orange-600 text-orange-400 border-orange-800/50',
  gray: 'hover:bg-slate-700/50 hover:border-slate-500 text-slate-300 border-slate-600/50',
  yellow: 'hover:bg-yellow-900/20 hover:border-yellow-600 text-yellow-400 border-yellow-800/50',
  red: 'hover:bg-red-900/20 hover:border-red-600 text-red-400 border-red-800/50',
  cyan: 'hover:bg-cyan-900/20 hover:border-cyan-600 text-cyan-400 border-cyan-800/50'
};

// 성능 최적화를 위한 메모이제이션
const TreeItem = memo(function TreeItem({
                                          node,
                                          onSelect,
                                          level = 0,
                                          isInChecklist = false,
                                          usageCount = 0,
                                          isExpanded,
                                          onToggleExpand,
                                          selectedItems,
                                          onItemSelect,
                                          isMultiSelect = false,
                                          onContextMenu,
                                          onToggleFavorite,
                                          expandedItems,
                                          currentChecklistItems,
                                          usageStats,
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
    onContextMenu?.({
      x: e.clientX,
      y: e.clientY,
      item: node
    });
  };
  
  return (
    <li className="relative">
      <div
        className={`
          group relative border rounded-lg transition-all duration-200 cursor-pointer
          ${darkColorThemes[config.color] || darkColorThemes.gray}
          ${isSelected ? 'bg-blue-900/30 border-blue-500 shadow-sm' : 'bg-slate-700/50 hover:shadow-sm'}
          ${isCategory ? 'shadow-sm border-slate-600' : ''}
        `}
        onClick={handleClick}
        onContextMenu={handleContextMenuClick}
      >
        <div className={`p-${isCategory ? '4' : isSubCategory ? '3' : '2.5'} flex items-center gap-3`}>
          {/* 확장/축소 토글 버튼 */}
          {hasChildren && (
            <button
              onClick={handleToggleClick}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
            >
              {currentIsExpanded ? '📂' : '📁'}
            </button>
          )}
          
          {/* 아이콘/이모지 */}
          <span className={`${isCategory ? 'text-2xl' : isSubCategory ? 'text-xl' : 'text-lg'}`}>
            {config.emoji}
          </span>
          
          {/* 항목 정보 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-slate-200 ${isCategory ? 'text-lg' : isSubCategory ? 'text-base' : 'text-sm'}`}>
                {config.name}
              </span>
              
              {/* 상태 표시 */}
              <div className="flex items-center gap-1">
                {nodeIsInChecklist && (
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full border border-green-800/50">
                    ✓ 추가됨
                  </span>
                )}
                
                {nodeUsageCount > 0 && (
                  <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full border border-amber-800/50">
                    🔥 {nodeUsageCount}
                  </span>
                )}
                
                {hasChildren && (
                  <span className="text-xs text-slate-400">
                    ({node.children.length})
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* 선택 체크박스 (멀티선택 모드) */}
          {isMultiSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onItemSelect?.(node.id)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 rounded focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
      
      {/* 하위 항목들 */}
      {hasChildren && currentIsExpanded && (
        <ul className="ml-6 mt-2 space-y-1">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              level={level + 1}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
              selectedItems={selectedItems}
              onItemSelect={onItemSelect}
              isMultiSelect={isMultiSelect}
              onContextMenu={onContextMenu}
              onToggleFavorite={onToggleFavorite}
              expandedItems={expandedItems}
              currentChecklistItems={currentChecklistItems}
              usageStats={usageStats}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

export default TreeItem;