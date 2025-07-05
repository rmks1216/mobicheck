import { categoryConfig } from './constants';

export default function QuickAccessPanel({ recentItems, favoriteItems, onSelect, onRemoveFavorite }) {
  if (recentItems.length === 0 && favoriteItems.length === 0) return null;
  
  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 border-b border-slate-700">
      <h3 className="text-sm font-medium text-slate-200 mb-3">빠른 액세스</h3>
      
      <div className="space-y-3">
        {recentItems.length > 0 && (
          <div>
            <h4 className="text-xs text-slate-400 mb-2">최근 사용</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {recentItems.slice(0, 5).map(item => {
                const config = categoryConfig[item.id] || {};
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className="flex-shrink-0 px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 hover:border-blue-500 hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{config.emoji}</span>
                      <span className="text-xs text-slate-200">{config.name || item.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {favoriteItems.length > 0 && (
          <div>
            <h4 className="text-xs text-slate-400 mb-2">즐겨찾기</h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {favoriteItems.slice(0, 5).map(item => {
                const config = categoryConfig[item.id] || {};
                return (
                  <div key={item.id} className="flex-shrink-0 relative group">
                    <button
                      onClick={() => onSelect(item.id)}
                      className="px-3 py-2 bg-slate-700 rounded-lg border border-amber-800/50 hover:border-amber-500 hover:bg-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">⭐</span>
                        <span className="text-sm">{config.emoji}</span>
                        <span className="text-xs text-slate-200">{config.name || item.name}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => onRemoveFavorite(item.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}