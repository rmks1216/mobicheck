'use client';
import TreeItem from './TreeItem';
import {useChecklistStore} from '@/lib/store/checklistStore';

// 카테고리별 이모지 매핑
const categoryEmojis = {
  'cat-groceries': '🛒',
  'cat-household': '🏠',
  'cat-electronics': '📱',
  'sub-vegetables': '🥬',
  'sub-fruits': '🍎',
  'sub-cleaning': '🧽',
  'sub-kitchen': '🍳',
  'sub-mobile': '📱',
  'sub-computer': '💻',
  'item-carrot': '🥕',
  'item-onion': '🧅',
  'item-apple': '🍎',
  'item-banana': '🍌',
  'item-detergent': '🧴',
  'item-sponge': '🧽',
  'item-foil': '📄',
  'item-wrap': '🎁',
  'item-phone-case': '📱',
  'item-charger': '🔌',
  'item-mouse': '🖱️',
  'item-keyboard': '⌨️'
};

// 카테고리별 색상 테마
const categoryThemes = {
  'cat-groceries': 'hover:bg-blue-50 hover:border-blue-200 group-hover:text-blue-700',
  'cat-household': 'hover:bg-purple-50 hover:border-purple-200 group-hover:text-purple-700',
  'cat-electronics': 'hover:bg-indigo-50 hover:border-indigo-200 group-hover:text-indigo-700',
  'sub-vegetables': 'hover:bg-green-50 group-hover:text-green-700',
  'sub-fruits': 'hover:bg-pink-50 group-hover:text-pink-700',
  'sub-cleaning': 'hover:bg-blue-50 group-hover:text-blue-700',
  'sub-kitchen': 'hover:bg-orange-50 group-hover:text-orange-700',
  'sub-mobile': 'hover:bg-purple-50 group-hover:text-purple-700',
  'sub-computer': 'hover:bg-gray-50 group-hover:text-gray-700'
};

function EnhancedTreeItem({node, onSelect, level = 0}) {
  const emoji = categoryEmojis[node.id] || '📄';
  const theme = categoryThemes[node.id] || 'hover:bg-gray-50 group-hover:text-gray-700';
  const isCategory = level === 0;
  const isSubCategory = level === 1;
  
  return (
    <li className="mb-2">
      <button
        className={`w-full text-left p-3 rounded-lg transition-all duration-200 border border-transparent group ${theme} ${
          isCategory ? 'font-medium' : isSubCategory ? 'font-normal' : 'text-sm'
        }`}
        onClick={() => onSelect(node.id)}
      >
        <div className="flex items-center gap-3">
          <span className={isCategory ? 'text-2xl' : isSubCategory ? 'text-lg' : 'text-sm'}>
            {emoji}
          </span>
          <div>
            <h3 className={`${isCategory ? 'text-base' : isSubCategory ? 'text-sm' : 'text-xs'} font-medium text-gray-900`}>
              {node.name}
            </h3>
            {node.children?.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {node.children.map(child => child.name).join(', ')}
              </p>
            )}
          </div>
        </div>
      </button>
      
      {node.children?.length > 0 && (
        <div className={level === 0 ? 'tree-line mt-2' : 'ml-6 mt-2'}>
          {node.children.map((child) => (
            <EnhancedTreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </li>
  );
}

export default function ItemsPanel({allItems, descendantMap, ancestorMap}) {
  const {addItems} = useChecklistStore();
  
  const handleSelect = (id) =>
    addItems(
      [
        ...ancestorMap[id].slice().reverse(),
        id,
        ...descendantMap[id],
      ],
      ancestorMap
    );
  
  return (
    <div className="bg-white rounded-xl shadow-sm border h-full flex flex-col">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          🗂️ 전체 항목
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          카테고리를 클릭하면 하위 항목까지 모두 추가됩니다
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        <ul>
          {allItems.map((node) => (
            <EnhancedTreeItem
              key={node.id}
              node={node}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}