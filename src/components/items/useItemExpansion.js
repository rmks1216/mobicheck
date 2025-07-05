import { useState, useEffect } from 'react';

export function useItemExpansion(categories) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

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

  useEffect(() => {
    if (!isInitialized && categories.length > 0) {
      const topLevelCategoryIds = categories.map(cat => cat.id);
      setExpandedItems(new Set(topLevelCategoryIds));
      setIsInitialized(true);
    }
  }, [categories, isInitialized]);

  return {
    expandedItems,
    handleToggleExpand,
  };
}
