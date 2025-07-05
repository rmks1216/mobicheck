import { useState, useMemo } from 'react';
import { categoryConfig } from './constants';

export function useItemsFilter(allItems, ancestorMap) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = useMemo(() => {
    const topLevelCategories = allItems.filter(item => !item.parent);
    return [{ id: 'all', name: '전체' }, ...topLevelCategories];
  }, [allItems]);

  const filteredItems = useMemo(() => {
    let items = allItems;

    if (filterCategory !== 'all') {
      items = allItems.filter(item => {
        const ancestors = ancestorMap[item.id] || [];
        return ancestors.includes(filterCategory) || item.id === filterCategory;
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const prune = (nodes) => {
        return nodes.reduce((acc, node) => {
          const config = categoryConfig[node.id] || {};
          const name = (config.name || node.name).toLowerCase();
          const prunedChildren = node.children ? prune(node.children) : [];
          if (name.includes(searchLower) || prunedChildren.length > 0) {
            acc.push({ ...node, children: prunedChildren });
          }
          return acc;
        }, []);
      };
      items = prune(items);
    }

    return items;
  }, [allItems, filterCategory, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filteredItems,
    categories,
  };
}
