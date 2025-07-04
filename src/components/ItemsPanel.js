'use client';

import { Suspense } from 'react';
import { useChecklistStore } from '@/lib/store/checklistStore';
import { useResponsive } from '../../hooks/useResponsive';
import { useItemsPanel } from './useItemsPanel';
import ItemsPanelHeader from './panel_components/ItemsPanelHeader';
import ItemsList from './panel_components/ItemsList';
import ContextMenu from './ContextMenu';
import MobileItemsPanel from './MobileItemsPanel';
import { categoryConfig } from './constants';

export default function ItemsPanel({ allItems, descendantMap, ancestorMap }) {
  const { addItems, checklists, activeId } = useChecklistStore();
  const { isMobile, isTablet } = useResponsive();

  const {
    viewMode,
    setViewMode,
    isVirtualized,
    setIsVirtualized,
    performanceMetrics,
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
  } = useItemsPanel(allItems, addItems, ancestorMap, descendantMap, checklists, activeId);

  if (isMobile || isTablet) {
    return (
      <Suspense fallback={<div className="h-full bg-gray-100 animate-pulse rounded-xl" />}>
        <MobileItemsPanel allItems={allItems} descendantMap={descendantMap} ancestorMap={ancestorMap} />
      </Suspense>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      <ItemsPanelHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        isVirtualized={isVirtualized}
        setIsVirtualized={setIsVirtualized}
        isMultiSelect={isMultiSelect}
        setIsMultiSelect={setIsMultiSelect}
        selectedItems={selectedItems}
        handleAddSelected={handleAddSelected}
        performanceMetrics={performanceMetrics}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        recentItems={recentItems}
        favoriteItems={favoriteItems}
        handleSelect={handleSelect}
        handleToggleFavorite={handleToggleFavorite}
        filteredItemsCount={filteredItems.length}
      />

      <ItemsList
        viewMode={viewMode}
        filteredItems={filteredItems}
        onSelect={handleSelect}
        level={0}
        isExpanded={expandedItems}
        onToggleExpand={handleToggleExpand}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        isMultiSelect={isMultiSelect}
        onContextMenu={handleContextMenu}
        onToggleFavorite={handleToggleFavorite}
        expandedItems={expandedItems}
        currentChecklistItems={currentChecklistItems}
        usageStats={usageStats}
        categoryConfig={categoryConfig}
      />

      <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
        <span>
          {filteredItems.length}개 항목 {searchTerm && `(전체 ${allItems.length}개 중)`}
        </span>
        <span>단축키: Ctrl+F (검색), Ctrl+1-3 (뷰 변경), Esc (취소)</span>
      </div>

      {contextMenu && (
        <Suspense>
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            itemName={categoryConfig[contextMenu.item.id]?.name || contextMenu.item.name}
            onClose={() => setContextMenu(null)}
            onAddToChecklist={() => { handleSelect(contextMenu.item.id); setContextMenu(null); }}
            onAddToFavorites={() => { handleToggleFavorite(contextMenu.item.id); setContextMenu(null); }}
            onViewDetails={() => { console.log('View details for:', contextMenu.item); setContextMenu(null); }}
          />
        </Suspense>
      )}
    </div>
  );
}
