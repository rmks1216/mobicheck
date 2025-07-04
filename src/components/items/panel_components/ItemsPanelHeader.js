'use client';

import dynamic from 'next/dynamic';

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
  performanceMetrics,
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
          {process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 bg-white rounded-lg p-2">
              <div>렌더링: {performanceMetrics.renderTime.toFixed(2)}ms</div>
              <div>항목 수: {performanceMetrics.itemCount}</div>
              {isVirtualized && <div>가상화: ON</div>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-lg p-1 border">
              <button onClick={() => setViewMode('tree')} className={`flex flex-col items-center px-3 py-1 text-xs rounded transition-colors ${viewMode === 'tree' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}                 title="트리 뷰 (Ctrl+1)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 1ZM5.75 5.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM14.25 5.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM1.75 10.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM18.25 10.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM10 15.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 10 15.25ZM5.75 15.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3ZM14.25 15.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Z" clipRule="evenodd" /></svg>
                트리</button>
              <button onClick={() => setViewMode('grid')} className={`flex flex-col items-center px-3 py-1 text-xs rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}                 title="그리드 뷰 (Ctrl+2)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM3 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM3 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5Z" clipRule="evenodd" /></svg>
                그리드</button>
              <button onClick={() => setViewMode('compact')} className={`flex flex-col items-center px-3 py-1 text-xs rounded transition-colors ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}                 title="컴팩트 뷰 (Ctrl+3)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10ZM2 15.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>
                목록
            </button>
            </div>
            {filteredItemsCount > 50 && (
              <button onClick={() => setIsVirtualized(!isVirtualized)} className={`px-3 py-1 text-xs rounded transition-colors ${isVirtualized ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="가상화 스크롤링">⚡ 가속</button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMultiSelect(!isMultiSelect)} className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${isMultiSelect ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="다중 선택 모드">☑ 다중 선택</button>
            {selectedItems.size > 0 && (
              <button onClick={handleAddSelected} className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">선택된 {selectedItems.size}개 추가</button>
            )}
          </div>
        </div>
      </div>
      <QuickAccessPanel recentItems={recentItems} favoriteItems={favoriteItems} onSelect={handleSelect} onRemoveFavorite={handleToggleFavorite} />
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} filterCategory={filterCategory} onFilterChange={setFilterCategory} categories={categories} />
    </>
  );
}
