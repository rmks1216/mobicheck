import { useEffect, useRef } from 'react';

export default function ContextMenu({ x, y, onClose, onAddToFavorites, onAddToChecklist, onViewDetails, itemName }) {
  const menuRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-48"
      style={{ left: x, top: y }}
    >
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
        {itemName}
      </div>
      <button onClick={onAddToChecklist} className="w-full px-3 py-2 text-gray-500 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
        <span>➕</span> 체크리스트에 추가
      </button>
      <button onClick={onAddToFavorites} className="w-full px-3 py-2 text-gray-500 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
        <span>⭐</span> 즐겨찾기에 추가
      </button>
      <button onClick={onViewDetails} className="w-full px-3 py-2 text-gray-500 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
        <span>ℹ️</span> 세부 정보
      </button>
    </div>
  );
}
