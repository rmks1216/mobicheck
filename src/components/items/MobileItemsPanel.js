import { useState } from 'react';
import { useResponsive, useTouchGestures } from '../../hooks/useResponsive';
import SearchBar from './SearchBar';
import QuickAccessPanel from './QuickAccessPanel';
import TreeItem from './TreeItem';

export default function MobileItemsPanel({ allItems, descendantMap, ancestorMap }) {
  const { isMobile, isTablet } = useResponsive();
  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useTouchGestures();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  if (!isMobile && !isTablet) {
    // 데스크톱에서는 기본 컴포넌트 사용
    return null;
  }
  
  const handleSwipe = () => {
    const result = handleTouchEnd();
    if (result?.isRightSwipe && selectedCategory) {
      setSelectedCategory(null); // 뒤로 가기
    }
  };
  
  return (
    <div
      className="bg-white rounded-xl shadow-sm border h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleSwipe}
    >
      {/* 모바일 헤더 */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 text-gray-600 hover:bg-white rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            🗂️ {selectedCategory ? selectedCategory.name : '전체 항목'}
          </h2>
          
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="p-2 text-gray-600 hover:bg-white rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {/* 경로 표시 */}
        {selectedCategory && (
          <div className="mt-2 text-sm text-gray-600">
            <span>전체 항목</span> <span className="mx-1">›</span> <span>{selectedCategory.name}</span>
          </div>
        )}
      </div>
      
      {/* 검색바 (확장 가능) */}
      {isSearchExpanded && (
        <div className="p-4 border-b bg-gray-50">
          <input
            type="text"
            placeholder="항목 검색..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          />
        </div>
      )}
      
      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCategory ? (
          // 카테고리 그리드 뷰
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {allItems.filter(item => item.children?.length > 0).map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategory(category)}
                />
              ))}
            </div>
          </div>
        ) : (
          // 선택된 카테고리의 항목들
          <div className="p-4">
            <div className="space-y-2">
              {selectedCategory.children?.map(item => (
                <MobileTreeItem
                  key={item.id}
                  node={item}
                  onSelect={(id) => {
                    // 항목 추가 로직
                    console.log('Selected:', id);
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 하단 액션 바 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <button className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium">
            선택 완료
          </button>
          <button className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg">
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// 모바일용 카테고리 카드
function CategoryCard({ category, onClick }) {
  const config = categoryConfig[category.id] || {};
  
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left"
    >
      <div className="text-2xl mb-2">{config.emoji}</div>
      <h3 className="font-medium text-gray-900 text-sm">{config.name || category.name}</h3>
      <p className="text-xs text-gray-500 mt-1">{category.children?.length || 0}개 항목</p>
    </button>
  );
}

// 모바일용 트리 아이템
function MobileTreeItem({ node, onSelect }) {
  const config = categoryConfig[node.id] || {};
  
  return (
    <button
      onClick={() => onSelect(node.id)}
      className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{config.emoji}</span>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{config.name || node.name}</h4>
        </div>
        <div className="text-blue-500">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    </button>
  );
}