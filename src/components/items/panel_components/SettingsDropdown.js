'use client';

import { useState } from 'react';

export default function SettingsDropdown({
                                           isVirtualized,
                                           setIsVirtualized,
                                           isMultiSelect,
                                           setIsMultiSelect,
                                           filteredItemsCount,
                                         }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-slate-700 transition-colors text-slate-300 hover:text-slate-100"
        title="설정"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M11.49 3.17a.75.75 0 0 1 1.02.02l1.125 1.125a.75.75 0 0 1 0 1.06l-1.125 1.125a.75.75 0 0 1-1.06 0l-1.125-1.125a.75.75 0 0 1-.02-1.02l1.125-1.125Zm-4.44 0a.75.75 0 0 1 1.02.02l1.125 1.125a.75.75 0 0 1 0 1.06L8.07 6.43a.75.75 0 0 1-1.06 0L5.885 5.305a.75.75 0 0 1-.02-1.02l1.125-1.125ZM4.75 11a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75Zm.75 4.75a.75.75 0 0 0-1.5 0v.5a.75.75 0 0 0 .75.75h.5a.75.75 0 0 0 .75-.75v-.5Zm2.5 0a.75.75 0 0 0-1.5 0v.5a.75.75 0 0 0 .75.75h.5a.75.75 0 0 0 .75-.75v-.5Zm5.5 0a.75.75 0 0 0-1.5 0v.5a.75.75 0 0 0 .75.75h.5a.75.75 0 0 0 .75-.75v-.5Zm2.5 0a.75.75 0 0 0-1.5 0v.5a.75.75 0 0 0 .75.75h.5a.75.75 0 0 0 .75-.75v-.5Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-700 rounded-xl shadow-xl border border-slate-600 z-10">
          <div className="p-5 space-y-5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-base font-medium text-slate-200">☑️ 다중 선택 모드</span>
              <input
                type="checkbox"
                checked={isMultiSelect}
                onChange={() => setIsMultiSelect(!isMultiSelect)}
                className="sr-only"
              />
              <div className={`w-12 h-6 rounded-full transition-colors ${isMultiSelect ? 'bg-blue-600' : 'bg-slate-500'}`}>
                <div className={`w-5 h-5 m-0.5 rounded-full bg-white transition-transform ${isMultiSelect ? 'translate-x-6' : ''}`} />
              </div>
            </label>
            {filteredItemsCount > 50 && (
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-base font-medium text-slate-200">⚡️ 가속 (가상화)</span>
                <input
                  type="checkbox"
                  checked={isVirtualized}
                  onChange={() => setIsVirtualized(!isVirtualized)}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors ${isVirtualized ? 'bg-green-600' : 'bg-slate-500'}`}>
                  <div className={`w-5 h-5 m-0.5 rounded-full bg-white transition-transform ${isVirtualized ? 'translate-x-6' : ''}`} />
                </div>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}