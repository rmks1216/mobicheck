'use client';

import dynamic from 'next/dynamic';
import ViewModeSwitcher from './ViewModeSwitcher';
import SettingsDropdown from './SettingsDropdown';

const SearchBar = dynamic(() => import('../SearchBar'));
const QuickAccessPanel = dynamic(() => import('../QuickAccessPanel'));

export default function ItemsPanelHeader({
                                           viewMode,
                                           setViewMode,
                                           isVirtualized,
                                           setIsVirtualized,
                                           isMultiSelect,
                                           setIsMultiSelect,
                                           selectedItems,
                                           handleAddSelected,
                                           searchTerm,
                                           setSearchTerm,
                                           filterCategory,
                                           setFilterCategory,
                                           categories,
                                           recentItems,
                                           favoriteItems,
                                           handleSelect,
                                           handleToggleFavorite,
                                           filteredItemsCount,
                                         }) {
  return (
    <>
      <div className="p-4 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">🗂️ 전체 항목</h2>
          <div className="flex items-center gap-2">
            <ViewModeSwitcher viewMode={viewMode} setViewMode={setViewMode} />
            <SettingsDropdown
              isVirtualized={isVirtualized}
              setIsVirtualized={setIsVirtualized}
              isMultiSelect={isMultiSelect}
              setIsMultiSelect={setIsMultiSelect}
              filteredItemsCount={filteredItemsCount}
            />
          </div>
        </div>
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterCategory={filterCategory}
          onFilterChange={setFilterCategory}
          categories={categories}
        />
        {isMultiSelect && selectedItems.size > 0 && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={handleAddSelected}
              className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              선택된 {selectedItems.size}개 추가
            </button>
          </div>
        )}
      </div>
      <QuickAccessPanel
        recentItems={recentItems}
        favoriteItems={favoriteItems}
        onSelect={handleSelect}
        onRemoveFavorite={handleToggleFavorite}
      />
    </>
  );
}