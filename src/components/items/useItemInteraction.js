import { useState, useEffect, useCallback } from 'react';

export function useItemInteraction(allItems, addItems, ancestorMap, descendantMap) {
  const [recentItems, setRecentItems] = useState([]);
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [usageStats, setUsageStats] = useState(new Map());

  const findItemById = useCallback((items, id) => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const handleSelect = useCallback((id) => {
    setUsageStats(prev => {
      const newStats = new Map(prev);
      newStats.set(id, (newStats.get(id) || 0) + 1);
      return newStats;
    });

    setRecentItems(prev => {
      const newItems = prev.filter(item => item.id !== id);
      const selectedItem = findItemById(allItems, id);
      if (selectedItem) {
        newItems.unshift(selectedItem);
      }
      return newItems.slice(0, 10);
    });

    addItems(
      [
        ...(ancestorMap[id] || []).slice().reverse(),
        id,
        ...(descendantMap[id] || []),
      ],
      ancestorMap
    );
  }, [addItems, allItems, ancestorMap, descendantMap, findItemById]);

  const handleToggleFavorite = useCallback((itemId) => {
    setFavoriteItems(prev => {
      const exists = prev.some(item => item.id === itemId);
      if (exists) {
        return prev.filter(item => item.id !== itemId);
      } else {
        const item = findItemById(allItems, itemId);
        if (item) {
          return [...prev, item].slice(0, 20);
        }
      }
      return prev;
    });
  }, [allItems, findItemById]);

  const handleContextMenu = useCallback(({ x, y, item }) => {
    setContextMenu({ x, y, item });
  }, []);

  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem('itemsPanel_recentItems');
      if (savedRecent) setRecentItems(JSON.parse(savedRecent));
      const savedFav = localStorage.getItem('itemsPanel_favoriteItems');
      if (savedFav) setFavoriteItems(JSON.parse(savedFav));
      const savedStats = localStorage.getItem('itemsPanel_usageStats');
      if (savedStats) setUsageStats(new Map(JSON.parse(savedStats)));
    } catch (e) {
      console.error('Failed to load from localStorage', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('itemsPanel_recentItems', JSON.stringify(recentItems));
      localStorage.setItem('itemsPanel_favoriteItems', JSON.stringify(favoriteItems));
      localStorage.setItem('itemsPanel_usageStats', JSON.stringify(Array.from(usageStats.entries())));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, [recentItems, favoriteItems, usageStats]);

  return {
    recentItems,
    favoriteItems,
    contextMenu,
    setContextMenu,
    usageStats,
    handleSelect,
    handleToggleFavorite,
    handleContextMenu,
  };
}
