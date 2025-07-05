import { useState } from 'react';
import { useResponsive, useTouchGestures } from '../../hooks/useResponsive';
import { categoryConfig } from './constants';
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
      className="bg-slate-800 rounded-xl shadow-xl border border-slate-700 h-full flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleSwipe}
    >
      {/* 모바일 헤더 */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-700">
        <div className="flex items-center justify-between">
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            🗂️ {selectedCategory ? selectedCategory.name : '전체 항목'}
          </h2>
          
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
        
        {/* 경로 표시 */}
        {selectedCategory && (
          <div className="mt-2 text-sm text-slate-400">
            <span>전체 항목</span> <span className="mx-1">›</span> <span>{selectedCategory.name}</span>
          </div>
        )}
      </div>
      
      {/* 검색바 (확장 가능) */}
      {isSearchExpanded && (
        <div className="p-4 border-b border-slate-700 bg-slate-800/50">
          <input
            type="text"
            placeholder="항목 검색..."
            className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            autoFocus
          />
        </div>
      )}
      
      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCategory ? (
          // 카테고리 목록 표시
          <div className="p-4 space-y-3">
            {allItems.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 p-4 bg-slate-700/50 border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCategory(category)}
              >
                <span className="text-2xl">{categoryConfig[category.id]?.emoji || '📄'}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-200">{categoryConfig[category.id]?.name || category.name}</h3>
                  {category.children && (
                    <p className="text-sm text-slate-400">{category.children.length}개 항목</p>
                  )}
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        ) : (
          // 선택된 카테고리의 하위 항목들 표시
          <div className="p-4 space-y-2">
            {selectedCategory.children?.map((item) => (
              <TreeItem
                key={item.id}
                node={item}
                level={1}
                // 필요한 props 추가
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}