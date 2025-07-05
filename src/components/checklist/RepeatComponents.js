'use client';

import { useState } from 'react';

// 반복 설정 다이얼로그 (다크모드)
export function RepeatSettingsDialog({ item, idNameMap, onSave, onClose }) {
  const [targetCount, setTargetCount] = useState(item.targetCount?.toString() || '1');
  const [currentCount, setCurrentCount] = useState(item.currentCount?.toString() || '0');
  
  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 999)) {
      setTargetCount(value);
      // 목표가 변경되면 현재값이 목표를 초과하지 않도록 조정
      if (value !== '' && parseInt(currentCount) > parseInt(value)) {
        setCurrentCount(value);
      }
    }
  };
  
  const handleCurrentChange = (e) => {
    const value = e.target.value;
    const maxValue = targetCount === '' ? 999 : parseInt(targetCount);
    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= maxValue)) {
      setCurrentCount(value);
    }
  };
  
  const handleSave = () => {
    const finalTargetCount = targetCount === '' ? 1 : Math.max(1, parseInt(targetCount) || 1);
    const finalCurrentCount = currentCount === '' ? 0 : Math.max(0, Math.min(parseInt(currentCount) || 0, finalTargetCount));
    onSave(finalTargetCount, finalCurrentCount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-96 max-w-[90vw] border border-slate-700 shadow-2xl">
        <h3 className="text-lg font-semibold mb-4 text-slate-100">반복 설정</h3>
        <p className="text-sm text-slate-400 mb-4">
          {idNameMap[item.id] || item.id}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">목표 횟수</label>
            <input
              type="number"
              min="1"
              max="999"
              value={targetCount}
              onChange={handleTargetChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">현재 진행</label>
            <input
              type="number"
              min="0"
              max={targetCount || 999}
              value={currentCount}
              onChange={handleCurrentChange}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg bg-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-slate-600 text-slate-300 py-2 rounded-lg hover:bg-slate-500 transition-colors font-medium"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// 호환성을 위한 별칭 export
export const RepeatSettingsModal = RepeatSettingsDialog;

// 반복 카운터 컴포넌트 (반복 모드에서만 표시) - 다크모드
export function RepeatCounter({ item, onIncrement, onDecrement, onSettings }) {
  const safeItem = {
    checked: item.checked || false,
    targetCount: item.targetCount || 1,
    currentCount: item.currentCount || 0
  };
  
  const isCompleted = safeItem.checked;
  const progress = safeItem.targetCount > 0 ? (safeItem.currentCount / safeItem.targetCount) * 100 : 0;
  
  return (
    <div className="flex items-center gap-2">
      {/* 진행 상황 표시 */}
      <div className="flex items-center gap-1">
        <span className={`text-xs font-medium ${isCompleted ? 'text-green-400' : 'text-purple-400'}`}>
          {safeItem.currentCount}/{safeItem.targetCount}
        </span>
        
        {/* 진행률 바 (작은 버전) - 다크모드 */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
      
      {/* 카운터 버튼들 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          disabled={safeItem.currentCount <= 0}
          className="w-6 h-6 rounded-md bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors"
        >
          −
        </button>
        <button
          onClick={onIncrement}
          disabled={safeItem.currentCount >= safeItem.targetCount}
          className="w-6 h-6 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors"
        >
          +
        </button>
        <button
          onClick={onSettings}
          className="w-6 h-6 rounded-md bg-slate-600 text-slate-300 hover:bg-slate-500 flex items-center justify-center text-xs transition-colors"
          title="설정"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}