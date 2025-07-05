import { categoryConfig } from './constants';

export default function SearchBar({ searchTerm, onSearchChange, filterCategory, onFilterChange, categories }) {
  return (
    <div className="sticky top-0 bg-slate-800 z-10 p-4 border-b border-slate-700 space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="항목 검색... (Ctrl+F로 빠른 검색)"
          className="w-full pl-10 pr-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => onSearchChange('')} className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg className="h-4 w-4 text-slate-400 hover:text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => {
          const config = categoryConfig[category.id] || {};
          const isAllCategory = category.id === 'all';
          return (
            <button
              key={category.id}
              onClick={() => onFilterChange(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                filterCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
              }`}
            >
              {!isAllCategory && <span>{config.emoji}</span>}
              {isAllCategory ? category.name : (config.name || category.name)}
            </button>
          );
        })}
      </div>
    </div>
  );
}