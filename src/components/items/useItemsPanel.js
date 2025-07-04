'use client';

import { useState, useEffect } from 'react';
import { useItemsLogic } from './useItemsLogic';

export function useItemsPanel(allItems, addItems, ancestorMap, descendantMap, checklists, activeId) {
  const [viewMode, setViewMode] = useState('tree');
  const [isVirtualized, setIsVirtualized] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({ renderTime: 0, itemCount: 0, lastUpdate: Date.now() });

  const itemsLogic = useItemsLogic({ allItems, addItems, ancestorMap, descendantMap, checklists, activeId });

  useEffect(() => {
    setIsVirtualized(itemsLogic.filteredItems.length > 100);
  }, [itemsLogic.filteredItems.length]);

  useEffect(() => {
    const startTime = performance.now();
    const measureRender = () => {
      const endTime = performance.now();
      setPerformanceMetrics({
        renderTime: endTime - startTime,
        itemCount: itemsLogic.filteredItems.length,
        lastUpdate: Date.now(),
      });
    };
    const timeoutId = setTimeout(measureRender, 0);
    return () => clearTimeout(timeoutId);
  }, [itemsLogic.filteredItems]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'f') {
          e.preventDefault();
          document.querySelector('input[placeholder*="검색"]')?.focus();
        } else if (e.key === 'a' && itemsLogic.isMultiSelect) {
          e.preventDefault();
          const allItemIds = new Set();
          const collectIds = (items) => {
            items.forEach(item => {
              allItemIds.add(item.id);
              if (item.children) collectIds(item.children);
            });
          };
          collectIds(itemsLogic.filteredItems);
          itemsLogic.setSelectedItems(allItemIds);
        } else if (['1', '2', '3'].includes(e.key)) {
          e.preventDefault();
          const newViewMode = e.key === '1' ? 'tree' : e.key === '2' ? 'grid' : 'compact';
          setViewMode(newViewMode);
        }
      }
      if (e.key === 'Escape') {
        itemsLogic.setContextMenu(null);
        itemsLogic.setSelectedItems(new Set());
        itemsLogic.setIsMultiSelect(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [itemsLogic.isMultiSelect, itemsLogic.filteredItems, itemsLogic.setSelectedItems, itemsLogic.setContextMenu, itemsLogic.setIsMultiSelect]);

  return {
    ...itemsLogic,
    viewMode,
    setViewMode,
    isVirtualized,
    setIsVirtualized,
    performanceMetrics,
  };
}
