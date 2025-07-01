'use client';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useChecklistStore } from '@/lib/store/checklistStore';
import { useResponsive } from '../hooks/useResponsive';

// 동적 임포트로 코드 스플리팅
import dynamic from 'next/dynamic';

const SearchBar = dynamic(() => import('./items/SearchBar'), {
  loading: () => <div className="h-20 bg-gray-100 animate-pulse rounded-lg" />
});

const QuickAccessPanel = dynamic(() => import('./items/QuickAccessPanel'), {
  loading: () => <div className="h-24 bg-gray-100 animate-pulse" />
});

const TreeItem = dynamic(() => import('./items/TreeItem'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg mb-2" />
});

const ContextMenu = dynamic(() => import('./items/ContextMenu'));
const MobileItemsPanel = dynamic(() => import('./items/MobileItemsPanel'));
const VirtualizedList = dynamic(() => import('./items/VirtualizedList'));

import { useItemsLogic } from './items/useItemsLogic';
import { categoryConfig } from './items/constants';

export default function ItemsPanel({ allItems, descendantMap, ancestorMap }) {
  const { addItems, checklists, activeId } = useChecklistStore();
  const { isMobile, isTablet } = useResponsive();
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'grid', 'compact'
  const [isVirtualized, setIsVirtualized] = useState(false);
  
  // 커스텀 훅으로 로직 분리
  const {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    expandedItems,
    selectedItems,
    setSelectedItems,
    isMultiSelect,
    setIsMultiSelect,
    recentItems,
    favoriteItems,
    contextMenu,
    setContextMenu,
    usageStats,
    filteredItems,
    currentChecklistItems,
    categories,
    handleToggleExpand,
    handleItemSelect,
    handleSelect,
    handleAddSelected,
    handleToggleFavorite,
    handleContextMenu,
    findItemById
  } = useItemsLogic({ allItems, addItems, ancestorMap, descendantMap, checklists, activeId });
  
  // 성능 모니터링
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    itemCount: 0,
    lastUpdate: Date.now()
  });
  
  // 가상화 모드 자동 전환
  useEffect(() => {
    if (filteredItems.length > 100) {
      setIsVirtualized(true);
    } else {
      setIsVirtualized(false);
    }
  }, [filteredItems.length]);
  
  // 성능 측정
  useEffect(() => {
    const startTime = performance.now();
    
    const measureRender = () => {
      const endTime = performance.now();
      setPerformanceMetrics({
        renderTime: endTime - startTime,
        itemCount: filteredItems.length,
        lastUpdate: Date.now()
      });
    };
    
    const timeoutId = setTimeout(measureRender, 0);
    return () => clearTimeout(timeoutId);
  }, [filteredItems]);
  
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
  
  // 모바일/태블릿에서는 별도 컴포넌트 사용
  if (isMobile || isTablet) {
    return (
      <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded-xl" />}>
        <MobileItemsPanel
          allItems={allItems}
          descendantMap={descendantMap}
          ancestorMap={ancestorMap}
        />
      </Suspense>
    );
  }
  
  // TreeItem 렌더링 함수 (가상화용)
  const renderTreeItem = (node, index) => (
    <TreeItem
      key={node.id}
      node={node}
      onSelect={handleSelect}
      level={0}
      isInChecklist={currentChecklistItems.has(node.id)}
      usageCount={usageStats.get(node.id) || 0}
      isExpanded={expandedItems.has(node.id)}
      onToggleExpand={handleToggleExpand}
      selectedItems={selectedItems}
      onItemSelect={handleItemSelect}
      isMultiSelect={isMultiSelect}
      onContextMenu={handleContextMenu}
      onToggleFavorite={handleToggleFavorite}
    />
  );
  
  // 그리드 뷰 렌더링
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredItems.map((node) => (
        <div
          key={node.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          onClick={() => handleSelect(node.id)}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{categoryConfig[node.id]?.emoji || '📄'}</span>
            <h3 className="font-medium text-gray-900">{categoryConfig[node.id]?.name || node.name}</h3>
          </div>
          {node.children && (
            <p className="text-sm text-gray-500">{node.children.length}개 하위 항목</p>
          )}
          {usageStats.get(node.id) > 0 && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                🔥 {usageStats.get(node.id)}회 사용
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
  
  // 컴팩트 뷰 렌더링
  const renderCompactView = () => (
    <div className="p-4">
      {filteredItems.map((node) => (
        <div
          key={node.id}
          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
          onClick={() => handleSelect(node.id)}
        >
          <span className="text-lg">{categoryConfig[node.id]?.emoji || '📄'}</span>
          <span className="flex-1 text-sm">{categoryConfig[node.id]?.name || node.name}</span>
          {node.children && (
            <span className="text-xs text-gray-500">{node.children.length}</span>
          )}
          {currentChecklistItems.has(node.id) && (
            <span className="text-green-500">✓</span>
          )}
        </div>
      ))}
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      {/* 헤더 */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🗂️ 전체 항목
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              카테고리를 클릭하면 하위 항목까지 모두 추가됩니다
            </p>
          </div>
          
          {/* 성능 지표 (개발 모드에서만) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
              <div>렌더링: {performanceMetrics.renderTime.toFixed(2)}ms</div>
              <div>항목 수: {performanceMetrics.itemCount}</div>
              {isVirtualized && <div>가상화: ON</div>}
            </div>
          )}
        </div>
        
        {/* 컨트롤 바 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 뷰 모드 전환 */}
            <div className="flex bg-white rounded-lg p-1 border">
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
      <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse" />}>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterChange={setFilterCategory}
          categories={categories}
        />
      </Suspense>
      
      {/* 항목 리스트 */}
      <div className="flex-1 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
            <p className="text-sm">다른 검색어를 시도해보세요</p>
          </div>
        ) : (
          <>
            {viewMode === 'tree' && (
              isVirtualized && filteredItems.length > 100 ? (
                <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse" />}>
                  <VirtualizedList
                    items={filteredItems}
                    renderItem={renderTreeItem}
                    containerHeight={400}
                  />
                </Suspense>
              ) : (
                <div className="overflow-y-auto custom-scrollbar p-4">
                  <ul>
                    {filteredItems.map((node) => renderTreeItem(node, 0))}
                  </ul>
                </div>
              )
            )}
            
            {viewMode === 'grid' && (
              <div className="overflow-y-auto custom-scrollbar">
                {renderGridView()}
              </div>
            )}
            
            {viewMode === 'compact' && (
              <div className="overflow-y-auto custom-scrollbar">
                {renderCompactView()}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 하단 상태바 */}
      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {filteredItems.length}개 항목
          {searchTerm && ` (전체 ${allItems.length}개 중)`}
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
              // 상세 정보 모달 표시 로직
              console.log('View details for:', contextMenu.item);
              setContextMenu(null);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}