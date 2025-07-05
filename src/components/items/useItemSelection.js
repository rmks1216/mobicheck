import { useState, useCallback } from 'react';
import { useChecklistStore } from '@/lib/store/checklistStore';

export function useItemSelection(addItems, descendantMap, ancestorMap) {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const handleSelect = useCallback((itemId) => {
    const itemsToAdd = [itemId, ...(descendantMap[itemId] || [])];
    addItems(itemsToAdd, ancestorMap);
  }, [addItems, descendantMap, ancestorMap]);

  const handleItemSelect = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }
      return newSelection;
    });
  }, []);

  const handleAddSelected = useCallback(() => {
    let itemsToAdd = [];
    selectedItems.forEach(itemId => {
      itemsToAdd.push(itemId, ...(descendantMap[itemId] || []));
    });
    addItems([...new Set(itemsToAdd)], ancestorMap);
    setSelectedItems(new Set());
    setIsMultiSelect(false);
  }, [selectedItems, addItems, descendantMap, ancestorMap]);

  return {
    selectedItems,
    isMultiSelect,
    setIsMultiSelect,
    handleSelect,
    handleItemSelect,
    handleAddSelected,
  };
}
