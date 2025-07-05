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
          <path fillRule="evenodd" d="M7.84 1.804A1 1 0 0 1 8.82 1h2.36a1 1 0 0 1 .98.804l.331 1.652a6.993 6.993 0 0 1 1.929 1.115l1.598-.54a1 1 0 0 1 1.186.447l1.18 2.044a1 1 0 0 1-.205 1.251l-1.267 1.113a7.047 7.047 0 0 1 0 2.228l1.267 1.113a1 1 0 0 1 .206 1.25l-1.18 2.045a1 1 0 0 1-1.187.447l-1.598-.54a6.993 6.993 0 0 1-1.929 1.115l-.33 1.652a1 1 0 0 1-.98.804H8.82a1 1 0 0 1-.98-.804l-.331-1.652a6.993 6.993 0 0 1-1.929-1.115l-1.598.54a1 1 0 0 1-1.186-.447l-1.18-2.044a1 1 0 0 1 .205-1.251l1.267-1.114a7.05 7.05 0 0 1 0-2.227L1.821 7.773a1 1 0 0 1-.206-1.25l1.18-2.045a1 1 0 0 1 1.187-.447l1.598.54A6.993 6.993 0 0 1 7.51 3.456l.33-1.652ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-700 rounded-xl shadow-xl border border-slate-600 z-50">
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