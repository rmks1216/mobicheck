'use client';

import { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import TreeItem from './items/TreeItem';
import SearchBar from './items/SearchBar';
import useItemsLogic from './items/useItemsLogic';
import { categoryConfig } from './items/constants';

// 동적 임포트
const QuickAccessPanel = lazy(() => import('./items/QuickAccessPanel'));
const ContextMenu = lazy(() => import('./items/ContextMenu'));
const VirtualizedList = lazy(() => import('./items/VirtualizedList'));

export default function ItemsPanel({ allItems, isMobile = false, isTablet = false }) {
  const {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    expandedItems,
    selectedItems,
    isMultiSelect,
    setIsMultiSelect,
    recentItems,
    favoriteItems,
    usageStats,
    searchOptions,
    searchResults,
    filteredItems,
    categories,
    currentChecklistItems,
    handleSelect,
    handleAddSelected,
    handleToggleFavorite,
    handleToggleExpand,
    handleItemSelect,
    expandAll,
    collapseAll,
    toggleSearchOption,
    renderHighlightedText
  } = useItemsLogic({ allItems });
  
  const [viewMode, setViewMode] = useState('tree');
  const [contextMenu, setContextMenu] = useState(null);
  const [isVirtualized, setIsVirtualized] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  
  // 컨텍스트 메뉴 핸들러
  const handleContextMenu = useCallback((e, item) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  }, []);
  
  // 렌더링 함수들
  const renderTreeView = useCallback(() => {
    if (isVirtualized && filteredItems.length > 100) {
      return (
        <Suspense fallback={<div className="p-4 text-center">로딩 중...</div>}>
          <VirtualizedList
            items={filteredItems}
            containerHeight={600}
            renderItem={(item) => (
              <TreeItem
                node={item}
                onSelect={handleSelect}
                level={0}
                isExpanded={expandedItems.has(item.id)}
                onToggleExpand={handleToggleExpand}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                isMultiSelect={isMultiSelect}
                onContextMenu={handleContextMenu}
                onToggleFavorite={handleToggleFavorite}
                expandedItems={expandedItems}
                currentChecklistItems={currentChecklistItems}
                usageStats={usageStats}
                renderHighlightedText={renderHighlightedText}
                searchPath={item.path}
              />
            )}
          />
        </Suspense>
      );
    }
    
    return (
      <div className="overflow-y-auto custom-scrollbar p-4">
        <ul>
          {filteredItems.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              onSelect={handleSelect}
              level={0}
              isExpanded={expandedItems.has(node.id)}
              onToggleExpand={handleToggleExpand}
              selectedItems={selectedItems}
              onItemSelect={handleItemSelect}
              isMultiSelect={isMultiSelect}
              onContextMenu={handleContextMenu}
              onToggleFavorite={handleToggleFavorite}
              expandedItems={expandedItems}
              currentChecklistItems={currentChecklistItems}
              usageStats={usageStats}
              renderHighlightedText={renderHighlightedText}
              searchPath={node.path}
            />
          ))}
        </ul>
      </div>
    );
  }, [filteredItems, isVirtualized, expandedItems, selectedItems, isMultiSelect, currentChecklistItems, usageStats, handleSelect, handleToggleExpand, handleItemSelect, handleContextMenu, handleToggleFavorite, renderHighlightedText]);
  
  const renderGridView = useCallback(() => {
    return (
      <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.map((item) => {
          const config = categoryConfig[item.id] || {};
          const isInChecklist = currentChecklistItems?.some(i => i.id === item.id);
          const displayName = config.name || item.name;
          const renderedName = item.highlightIndices && renderHighlightedText
            ? renderHighlightedText(displayName, item.highlightIndices)
            : displayName;
          
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${item.matchedText ? 'ring-2 ring-yellow-400 ring-opacity-30' : ''}
                ${isInChecklist ? 'bg-green-50 border-green-300' : 'bg-white hover:shadow-md'}
              `}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{config.emoji}</div>
                <div className="text-sm font-medium truncate">{renderedName}</div>
                {item.children && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.children.length} 항목
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [filteredItems, currentChecklistItems, handleSelect, handleContextMenu, renderHighlightedText]);
  
  const renderCompactView = useCallback(() => {
    return (
      <div className="p-4">
        {filteredItems.map((item) => {
          const config = categoryConfig[item.id] || {};
          const isInChecklist = currentChecklistItems?.some(i => i.id === item.id);
          const displayName = config.name || item.name;
          const renderedName = item.highlightIndices && renderHighlightedText
            ? renderHighlightedText(displayName, item.highlightIndices)
            : displayName;
          
          return (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className={`
                px-3 py-2 border-b cursor-pointer transition-colors flex items-center gap-3
                ${item.matchedText ? 'bg-yellow-50' : ''}
                ${isInChecklist ? 'bg-green-50' : 'hover:bg-gray-50'}
              `}
            >
              <span className="text-lg">{config.emoji}</span>
              <span className="flex-1 text-sm">{renderedName}</span>
              {isInChecklist && (
                <span className="text-xs text-green-600">✓</span>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [filteredItems, currentChecklistItems, handleSelect, handleContextMenu, renderHighlightedText]);
  
  // 가상화 모드 자동 전환
  useEffect(() => {
    setIsVirtualized(filteredItems.length > 100);
  }, [filteredItems.length]);
  
  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder*="검색"]')?.focus();
            break;
          case 'a':
            if (isMultiSelect) {
              e.preventDefault();
              const allItemIds = new Set();
              const collectIds = (items) => {
                items.forEach(item => {
                  allItemIds.add(item.id);
                  if (item.children) collectIds(item.children);
                });
              };
              collectIds(filteredItems);
              setSelectedItems(allItemIds);
            }
            break;
          case '1':
            e.preventDefault();
            setViewMode('tree');
            break;
          case '2':
            e.preventDefault();
            setViewMode('grid');
            break;
          case '3':
            e.preventDefault();
            setViewMode('compact');
            break;
        }
      }
      if (e.key === 'Escape') {
        setContextMenu(null);
        setSelectedItems(new Set());
        setIsMultiSelect(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMultiSelect, filteredItems]);
  
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-blue-900">항목 브라우저</h2>
          
          {/* 툴바 */}
          <div className="flex items-center gap-2">
            {/* 뷰 모드 선택 */}
            <div className="flex items-center bg-white rounded-lg shadow-sm border p-1">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'tree' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="트리 뷰 (Ctrl+1)"
              >
                🌳 트리
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="그리드 뷰 (Ctrl+2)"
              >
                ⚏ 그리드
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === 'compact' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="컴팩트 뷰 (Ctrl+3)"
              >
                ☰ 목록
              </button>
            </div>
            
            {/* 확장/축소 버튼 */}
            {viewMode === 'tree' && (
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="모두 펼치기"
                >
                  ⊞
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="모두 접기"
                >
                  ⊟
                </button>
              </div>
            )}
            
            {/* 가상화 토글 */}
            {filteredItems.length > 50 && (
              <button
                onClick={() => setIsVirtualized(!isVirtualized)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  isVirtualized ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="가상화 스크롤링"
              >
                ⚡ 가속
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* 다중 선택 토글 */}
            <button
              onClick={() => setIsMultiSelect(!isMultiSelect)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                isMultiSelect
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="다중 선택 모드"
            >
              ☑ 다중 선택
            </button>
            
            {/* 선택된 항목 추가 버튼 */}
            {selectedItems.size > 0 && (
              <button
                onClick={handleAddSelected}
                className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                선택된 {selectedItems.size}개 추가
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* 빠른 액세스 패널 */}
      <Suspense fallback={<div className="h-24 bg-gray-100 animate-pulse" />}>
        <QuickAccessPanel
          recentItems={recentItems}
          favoriteItems={favoriteItems}
          onSelect={handleSelect}
          onRemoveFavorite={(id) => handleToggleFavorite(id)}
        />
      </Suspense>
      
      {/* 검색 및 필터 */}
      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCategory={filterCategory}
        onFilterChange={setFilterCategory}
        categories={categories}
        searchOptions={searchOptions}
        onToggleSearchOption={toggleSearchOption}
        searchResults={searchResults}
      />
      
      {/* 항목 리스트 */}
      <div className="flex-1 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-2">
              {searchTerm ? '검색 결과가 없습니다' : '항목이 없습니다'}
            </p>
            <p className="text-sm">
              {searchTerm ? '다른 검색어를 시도해보세요' : '카테고리를 선택해보세요'}
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'tree' && renderTreeView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'compact' && renderCompactView()}
          </>
        )}
      </div>
      
      {/* 하단 상태바 */}
      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {filteredItems.length}개 항목
          {searchTerm && ` (전체 ${allItems.length}개 중)`}
          {searchResults && ` - ${searchResults.length}개 매칭`}
        </span>
        <span>
          단축키: Ctrl+F (검색), Ctrl+1-3 (뷰 변경), Esc (취소)
        </span>
      </div>
      
      {/* 컨텍스트 메뉴 */}
      {contextMenu && (
        <Suspense>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            itemName={categoryConfig[contextMenu.item.id]?.name || contextMenu.item.name}
            onClose={() => setContextMenu(null)}
            onAddToChecklist={() => {
              handleSelect(contextMenu.item.id);
              setContextMenu(null);
            }}
            onAddToFavorites={() => {
              handleToggleFavorite(contextMenu.item.id);
              setContextMenu(null);
            }}
            onViewDetails={() => {
              console.log('View details for:', contextMenu.item);
              setContextMenu(null);
            }}
          />
        </Suspense>
      )}
      
      {/* 성능 메트릭 (개발 모드에서만) */}
      {process.env.NODE_ENV === 'development' && performanceMetrics && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
          <div>렌더 시간: {performanceMetrics.renderTime.toFixed(2)}ms</div>
          <div>항목 수: {performanceMetrics.itemCount}</div>
        </div>
      )}
    </div>
  );
}