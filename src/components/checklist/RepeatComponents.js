'use client';
import { useState } from 'react';

// 반복 항목 설정 모달 컴포넌트
export function RepeatSettingsModal({ item, idNameMap, onClose, onSave }) {
  const [targetCount, setTargetCount] = useState(item.targetCount || 1);
  const [currentCount, setCurrentCount] = useState(item.currentCount || 0);
  
  const handleTargetChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setTargetCount('');
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 1) {
      setTargetCount(numValue);
      // 현재 카운트가 새로운 목표값보다 크면 조정
      if (currentCount > numValue) {
        setCurrentCount(numValue);
      }
    }
  };
  
  const handleCurrentChange = (e) => {
    const value = e.target.value;
    if (value === '') {
      setCurrentCount('');
      return;
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setCurrentCount(Math.min(numValue, targetCount || 1));
    }
  };
  
  const handleSave = () => {
    const finalTargetCount = targetCount === '' ? 1 : Math.max(1, parseInt(targetCount) || 1);
    const finalCurrentCount = currentCount === '' ? 0 : Math.max(0, Math.min(parseInt(currentCount) || 0, finalTargetCount));
    onSave(finalTargetCount, finalCurrentCount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-4">반복 설정</h3>
        <p className="text-sm text-gray-600 mb-4">
          {idNameMap[item.id] || item.id}
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">목표 횟수</label>
            <input
              type="number"
              min="1"
              max="999"
              value={targetCount}
              onChange={handleTargetChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">현재 진행</label>
            <input
              type="number"
              min="0"
              max={targetCount || 999}
              value={currentCount}
              onChange={handleCurrentChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            저장
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

// 반복 카운터 컴포넌트 (반복 모드에서만 표시)
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
        <span className={`text-xs font-medium ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
          {safeItem.currentCount}/{safeItem.targetCount}
        </span>
        
        {/* 진행률 바 (작은 버전) */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      </div>
      
      {/* 카운터 버튼들 */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDecrement}
          disabled={safeItem.currentCount <= 0}
          className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
          title="횟수 감소"
        >
          -
        </button>
        
        <button
          onClick={onIncrement}
          disabled={safeItem.currentCount >= safeItem.targetCount}
          className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold transition-colors"
          title="횟수 증가"
        >
          +
        </button>
        
        <button
          onClick={onSettings}
          className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 text-xs font-bold transition-colors"
          title="반복 설정"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}