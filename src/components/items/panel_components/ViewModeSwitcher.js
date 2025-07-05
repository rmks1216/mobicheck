'use client';

export default function ViewModeSwitcher({ viewMode, setViewMode }) {
  return (
    <div className="flex bg-gray-700 rounded-xl p-1.5 border border-gray-600">
      <button
        onClick={() => setViewMode('tree')}
        className={`flex flex-col items-center px-4 py-2 text-sm rounded-lg transition-colors ${
          viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
        }`}
        title="트리 뷰 (Ctrl+1)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M10 1a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 1ZM5.75 5.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM14.25 5.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM1.75 10.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM18.25 10.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5ZM10 15.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 10 15.25ZM5.75 15.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3ZM14.25 15.25a.75.75 0 0 0-1.5 0v3a.75.75 0 0 0 1.5 0v-3Z"
            clipRule="evenodd"
          />
        </svg>
        트리
      </button>
      <button
        onClick={() => setViewMode('grid')}
        className={`flex flex-col items-center px-4 py-2 text-sm rounded-lg transition-colors ${
          viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
        }`}
        title="그리드 뷰 (Ctrl+2)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M3 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM3 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM3 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM7.5 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM12 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 5.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 9.75a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5ZM16.5 14.25a.75.75 0 0 1 .75-.75h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5a.75.75 0 0 1-.75-.75v-.5Z"
            clipRule="evenodd"
          />
        </svg>
        그리드
      </button>
      <button
        onClick={() => setViewMode('compact')}
        className={`flex flex-col items-center px-4 py-2 text-sm rounded-lg transition-colors ${
          viewMode === 'compact' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
        }`}
        title="컴팩트 뷰 (Ctrl+3)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10ZM2 15.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1-.75-.75Z"
            clipRule="evenodd"
          />
        </svg>
        목록
      </button>
    </div>
  );
}
