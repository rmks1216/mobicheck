// components/items/VirtualizedList.js
import { useState, useEffect, useRef, useMemo } from 'react';

const ITEM_HEIGHT = 80; // 예상 아이템 높이
const BUFFER_SIZE = 5; // 화면 밖 렌더링할 아이템 수

export default function VirtualizedList({
                                          items,
                                          renderItem,
                                          containerHeight = 400,
                                          estimatedItemHeight = ITEM_HEIGHT
                                        }) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: containerHeight });
  const containerRef = useRef(null);
  const itemHeights = useRef(new Map());
  
  // 아이템 높이 측정
  const measureItemHeight = (index, height) => {
    itemHeights.current.set(index, height);
  };
  
  // 가시 영역 계산
  const visibleRange = useMemo(() => {
    const itemCount = items.length;
    let startIndex = 0;
    let endIndex = itemCount - 1;
    let currentTop = 0;
    
    // 시작 인덱스 찾기
    for (let i = 0; i < itemCount; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight;
      if (currentTop + height > scrollTop - BUFFER_SIZE * estimatedItemHeight) {
        startIndex = Math.max(0, i - BUFFER_SIZE);
        break;
      }
      currentTop += height;
    }
    
    // 끝 인덱스 찾기
    currentTop = 0;
    for (let i = 0; i < itemCount; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight;
      currentTop += height;
      if (currentTop > scrollTop + containerSize.height + BUFFER_SIZE * estimatedItemHeight) {
        endIndex = Math.min(itemCount - 1, i + BUFFER_SIZE);
        break;
      }
    }
    
    return { startIndex, endIndex };
  }, [scrollTop, containerSize.height, items.length, estimatedItemHeight]);
  
  // 전체 컨테이너 높이 계산
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += itemHeights.current.get(i) || estimatedItemHeight;
    }
    return height;
  }, [items.length, estimatedItemHeight]);
  
  // 상위 오프셋 계산
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offset += itemHeights.current.get(i) || estimatedItemHeight;
    }
    return offset;
  }, [visibleRange.startIndex, estimatedItemHeight]);
  
  // 스크롤 이벤트 핸들러
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };
  
  // 컨테이너 사이즈 측정
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => resizeObserver.disconnect();
  }, []);
  
  // 가시 아이템들
  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({ index: i, item: items[i] });
      }
    }
    return result;
  }, [items, visibleRange]);
  
  return (
    <div
      ref={containerRef}
      className="overflow-auto custom-scrollbar"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ index, item }) => (
            <VirtualizedItem
              key={item.id || index}
              index={index}
              onHeightChange={measureItemHeight}
            >
              {renderItem(item, index)}
            </VirtualizedItem>
          ))}
        </div>
      </div>
    </div>
  );
}

// 개별 가상화된 아이템
function VirtualizedItem({ index, children, onHeightChange }) {
  const itemRef = useRef(null);
  
  useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.getBoundingClientRect().height;
      onHeightChange(index, height);
    }
  }, [index, onHeightChange]);
  
  return (
    <div ref={itemRef}>
      {children}
    </div>
  );
}

// 성능 최적화된 TreeItem 컴포넌트
export function OptimizedTreeItem({ node, ...props }) {
  return (
    <div className="mb-1">
      {/* TreeItem 내용을 여기에 복사하거나 기존 TreeItem을 import */}
      {/* 메모이제이션과 함께 사용하면 더 좋음 */}
    </div>
  );
}