// components/items/useItemsLogic.js
import { useState, useMemo, useEffect } from 'react';
import { categoryConfig } from './constants';

export function useItemsLogic({ allItems, addItems, ancestorMap, descendantMap, checklists, activeId }) {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [recentItems, setRecentItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [usageStats, setUsageStats] = useState(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 현재 체크리스트의 항목들
  const currentChecklistItems = useMemo(() => {
    const activeChecklist = checklists.find(c => c.id === activeId);
    return new Set(activeChecklist?.items.map(item => item.id) || []);
  }, [checklists, activeId]);
  
  // 카테고리 목록
  const categories = useMemo(() => {
    return allItems.filter(item => item.children && item.children.length > 0);
  }, [allItems]);
  
  // 필터링 및 검색된 항목들
  const filteredItems = useMemo(() => {
    let items = allItems;
    
    // (1) 카테고리 필터 기존 로직 유지
    if (filterCategory !== 'all') {
      items = items.filter(item => {
        const config = categoryConfig[item.id];
        return config && config.category === filterCategory;
      });
    }
    
    // (2) 검색어가 있을 때만 가지치기 수행
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      
      // 재귀 prune 함수
      const prune = (nodes) => {
        return nodes.reduce((acc, node) => {
          const config = categoryConfig[node.id] || {};
          const name = (config.name || node.name).toLowerCase();
          
          // 자식부터 먼저 가지치기
          const prunedChildren = node.children
            ? prune(node.children)
            : [];
          
          // 현재 노드가 매칭되거나, 매칭된 자식이 하나라도 있으면 포함
          if (name.includes(searchLower) || prunedChildren.length > 0) {
            acc.push({
              ...node,
              children: prunedChildren
            });
          }
          return acc;
        }, []);
      };
      
      items = prune(items);
    }
    
    return items;
  }, [allItems, filterCategory, searchTerm]);
  
  // 유틸리티 함수들
  const findItemById = (items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  // 이벤트 핸들러들
  const handleToggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  const handleSelect = (id) => {
    // 사용 통계 업데이트
    setUsageStats(prev => {
      const newStats = new Map(prev);
      newStats.set(id, (newStats.get(id) || 0) + 1);
      return newStats;
    });
    
    // 최근 사용 항목에 추가
    setRecentItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      const selectedItem = findItemById(allItems, id);
      if (selectedItem) {
        newItems.unshift(selectedItem);
      }
      return newItems.slice(0, 10); // 최대 10개
    });
    
    addItems(
      [
        ...ancestorMap[id].slice().reverse(),
        id,
        ...descendantMap[id],
      ],
      ancestorMap
    );
  };
  
  const handleAddSelected = () => {
    selectedItems.forEach(id => {
      handleSelect(id);
    });
    setSelectedItems(new Set());
    setIsMultiSelect(false);
  };
  
  const handleToggleFavorite = (itemId) => {
    setFavoriteItems(prev => {
      const exists = prev.some(item => item.id === itemId);
      if (exists) {
        return prev.filter(item => item.id !== itemId);
      } else {
        const item = findItemById(allItems, itemId);
        if (item) {
          return [...prev, item].slice(0, 20); // 최대 20개
        }
      }
      return prev;
    });
  };
  
  const handleContextMenu = ({ x, y, item }) => {
    setContextMenu({ x, y, item });
  };
  
  // 초기 확장 상태 설정 - 최상위 카테고리만 확장
  useEffect(() => {
    if (!isInitialized && categories.length > 0) {
      const topLevelCategoryIds = categories.map(cat => cat.id);
      setExpandedItems(new Set(topLevelCategoryIds));
      setIsInitialized(true);
    }
  }, [categories, isInitialized]);
  
  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedRecentItems = localStorage.getItem('itemsPanel_recentItems');
    const savedFavoriteItems = localStorage.getItem('itemsPanel_favoriteItems');
    const savedUsageStats = localStorage.getItem('itemsPanel_usageStats');
    
    if (savedRecentItems) {
      try {
        setRecentItems(JSON.parse(savedRecentItems));
      } catch (e) {
        console.error('Failed to load recent items:', e);
      }
    }
    
    if (savedFavoriteItems) {
      try {
        setFavoriteItems(JSON.parse(savedFavoriteItems));
      } catch (e) {
        console.error('Failed to load favorite items:', e);
      }
    }
    
    if (savedUsageStats) {
      try {
        const statsArray = JSON.parse(savedUsageStats);
        setUsageStats(new Map(statsArray));
      } catch (e) {
        console.error('Failed to load usage stats:', e);
      }
    }
  }, []);
  
  // 로컬 스토리지에 데이터 저장
  useEffect(() => {
    localStorage.setItem('itemsPanel_recentItems', JSON.stringify(recentItems));
  }, [recentItems]);
  
  useEffect(() => {
    localStorage.setItem('itemsPanel_favoriteItems', JSON.stringify(favoriteItems));
  }, [favoriteItems]);
  
  useEffect(() => {
    const statsArray = Array.from(usageStats.entries());
    localStorage.setItem('itemsPanel_usageStats', JSON.stringify(statsArray));
  }, [usageStats]);
  
  return {
    // 상태
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
    
    // 계산된 값들
    filteredItems,
    currentChecklistItems,
    categories,
    
    // 핸들러들
    handleToggleExpand,
    handleItemSelect,
    handleSelect,
    handleAddSelected,
    handleToggleFavorite,
    handleContextMenu,
    findItemById
  };
}